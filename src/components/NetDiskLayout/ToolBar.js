import React,{Component} from 'react'
import {Button,Icon,message,Modal} from 'antd'
import cs from 'classnames'
import './ToolBarStyle.less'
import MineIcon from '../MineIcon'
import DragLayer from '../DragLayer/DragLayer'
import UploaderWorker from '@workers/Uploader/Disk.worker'
import CodeStatus from '@util/CodeStatus'
import FileHelper from '@util/File'
import http from '@util/http'
import Url from '@util/Url'
import Cookie from 'js-cookie'
import filesize from 'filesize'
import Uploader from '@router/NetDisk/UploaderDialog/UploaderDialog'
import PropTypes from 'prop-types'
import {inject,observer} from 'mobx-react'
import FileChunk from '@util/FileChunk'
import {isEmpty} from 'lodash'
import {toJS} from 'mobx'

@inject("stores")
class ToolBar extends Component{

    static propTypes = {
        onToggleCreateFolderInput:PropTypes.func,
        onDelete:PropTypes.func
    }

    static defaultProps = {
        onToggleCreateFolderInput:function(){},
        onDelete:function(){}
    }

    FileChunkHandler = []

    constructor(props){
        super(props)
        this.worker = {}
        this.state = {
            uploadLayerVisible:false,
            // chunkItemSize:10240*1024, // 文件切割最小单位
            chunkItemSize:0,
            maxSize:0,
            uploadTask:[
                /** {
                name:'文件名',
                file:File,
                size:'文件大小',
                count:10,
                chunks:[],
                progress:0,
                speed:0, // 上传速度
                status:'',
                code:100,
                md5:''
                stop:true,
                enableAction:true,
                show:true,
                uploaded:[],
                worker:Object
            }*/
            ],
            showUploadInput:true
        }
        this.uploadInputEl = React.createRef()

    }

    componentDidMount(){
        this.getChunkSize.call(this)
        this.getMaxSize.call(this)
        // console.log(this.uploadInputEl)
    }


    getChunkSize(){
        // let chunkItemSize = Cookie.get('disk_chunk_size') || null
        let chunkItemSize = null
        if(chunkItemSize){
            this.setState({
                chunkItemSize
            })
            return;
        }
        http.post('/tool/disk/getChunkSize').then(({size})=>{
            // console.log(size)

            this.setState({
                chunkItemSize:size
            })
            Cookie.set('disk_chunk_size',size,{expires:7})
        }).catch(err=>{
            console.error(err)
        })

    }

    getMaxSize(){
        http.post('/tool/disk/getMaxSize').then(({size})=>{
            // console.log(size)
            this.setState({
                maxSize:size
            })
        }).catch(err=>{
            console.error(err)
        })
    }


    handleUploadClick(){
        const {uploadInputEl:{current:uploadInputEl}} = this
        uploadInputEl.click()
    }

    getUploadTaskItem(index){
        const {state:{uploadTask}} = this
        if([undefined,null,'',NaN].includes(index) || !uploadTask[index]){
            // throw new Error(`索引${index || ''}不存在`)
            return false
        }
        return uploadTask[index]

    }

    insertUploadTask(file){
        return new Promise((resolve,reject)=>{
            try{
                const item = {
                    name:file.name,
                    file:file,
                    size:file.size,
                    count:0,
                    chunks:[],
                    progress:0,
                    speed:0, // 上传速度
                    status:'正在校验文件...',
                    md5:'',
                    upload_key:'',
                    stop:true,
                    enableAction:false,
                    show:true,
                    uploaded:[]
                }
                this.setState(({uploadTask})=>{
                    uploadTask.push(item)
                    return {
                        uploadTask
                    }
                },()=>{
                    resolve(this.state.uploadTask.indexOf(item))
                })
            }catch(err){
                reject(err)
            }
        })


    }

    updateUploadTask(index,info={}){
        return new Promise((resolve,reject)=>{
            this.setState(({uploadTask})=>{
                // uploadTask[index] =
                if(!uploadTask[index]){
                    reject(`索引：${index}不存在`)
                    return;
                }
                uploadTask[index] = Object.assign({},uploadTask[index],info)
                return {uploadTask}
            },resolve)
        })

    }

    // updateCurrentFolderContent(){
    //
    // }

    uploadSuccess(index,is_fast=false){
        const {state,props:{stores:{DiskStore}}} = this
        this.updateUploadTask.call(this,index,{
            status:`上传成功${!!is_fast?'[秒传]':''}`,
            enableAction:false,
            stop:false,
            progress:state.uploadTask[index].count
        })
        DiskStore.getContent(DiskStore.folderId,true)
    }

    handleUploader(event){
        const {target: {files}} = event

        if (!files.length) return;
        this.reMountUploadInput()
        for(let file of files){
            this.handleFile(file)
        }


    }

    // 获取各个文件对应的上传web-worker
    getWorker(index){
        const detail = this.getUploadTaskItem.call(this,index)
        if(!detail.hasOwnProperty('worker') || !detail.worker instanceof Worker){
            detail.worker = new UploaderWorker()
        }
        return detail.worker
    }

    computedFileMd5(index){
        return new Promise(async (resolve,reject)=>{
            const {state} = this
            const info = this.getUploadTaskItem.call(this,index)
            if(info===false) {
                reject('校验失败')
                return;
            }
            try{
                // console.time(`校验文件${info.name}`)
                // result = await FileHelper.chunk(info.file,state.chunkItemSize)
                this.FileChunkHandler[index] = new FileChunk()
                await this.FileChunkHandler[index].setFile(info.file,state.chunkItemSize).md5()
                // console.timeEnd(`校验文件${info.name}`)
            }catch(err){
                reject(err.message || err)
                return;
            }
            let result = this.FileChunkHandler[index].getChunkInfo()
            resolve(result)
        })
    }

    async handleFile(file) {
        const {state,state:{maxSize}} = this
        const {stores:{DiskStore}} = this.props
        if(file.size>maxSize){
            message.error(`文件太大，限制最大${filesize(maxSize)}`)
            return;
        }
        let index
        try{
            index = await this.insertUploadTask.call(this,file)
        }catch(err){
            console.error(err.message || err)
            message.error(err.message || err)
            return;
        }
        this.setState({
            uploadLayerVisible:true
        })


        // console.log(index)

        let result
        // return;
        try{
            result = await this.computedFileMd5.call(this,index)
        }catch(err){
            // message.error()
            console.error(err)
            return;
        }

        this.updateUploadTask(index,{
            status:'校验完成，准备上传',
            count:result.chunk_count,
            chunks:result.chunks,
            progress:0,
            speed:0, // 上传速度
            md5:result.md5,
            stop:true,
            enableAction:false,
            show:true
        })

        const {stores:{IpStore}} = this.props
        const upload_server= toJS(IpStore.home)
        if(isEmpty(upload_server) || !upload_server.ip || !upload_server.port) {
            message.error('上传失败')
            console.error('上传服务器空')
            return;
        }

        let prepare
        try{
            prepare = await http.post(`http://${upload_server.ip}:${upload_server.port}${Url.NetDiskFilePrepareUpload}`,{
                md5:result.md5,
                size:file.size,
                count:result.chunk_count,
                folder_id:DiskStore.folderId,
                name:file.name
            })
        }catch(err){
            console.error(err)
            this.updateUploadTask(index,{
                status:'上传失败',
            })
            return;
        }
        // console.log(prepare)
        if(!prepare.success){
            this.updateUploadTask(index,{
                status:'上传失败',
            })
            message.error(prepare.error || prepare.msg)
            return;
        }

        if(!!prepare.fast){
            // 秒传
            message.success(`${file.name}上传成功[秒传]`)
            this.uploadSuccess.call(this,index,true)
            return;
        }

        let {upload_key,uploaded} = prepare
        this.updateUploadTask(index,{
            status:'正在上传...',
            upload_key,
            enableAction:true,
            stop:false,
            progress:uploaded.length,
            uploaded
        })

        // web-worker传输文件
        const useWorkerUpload = (chunks,uploaded,md5,upload_key)=>{

            const Uploader = this.getWorker.call(this,index)
            Uploader.addEventListener('message',({data})=>{
                const {success,finish} = data
                // console.log(data)


                // 数据块传输成功
                if(success){
                    const item = this.getUploadTaskItem(index)
                    let progress = item.progress+1
                    if(progress>item.count){
                        progress = item.count
                    }
                    this.updateUploadTask.call(this,index,{
                        progress
                    })
                }

                // 传输完成（不是所有都成功）
                if(finish){
                    const {fail_count} = data
                    // 有部分数据块传输失败
                    if(fail_count>0){
                        this.updateUploadTask.call(this,index,{
                            status:'部分数据上传中断',
                            stop:true,
                            enableAction:true,
                        })
                        message.error('部分数据上传中断')
                        return;
                    }
                    this.uploadSuccess.call(this,index)
                }
            })
            Uploader.postMessage({
                chunks,md5,upload_key,uploaded,
                stop:false,
                ip:upload_server.ip,
                port:upload_server.port
            })
        }

        const {count,chunks,md5} = result

        // 调用web-worker上传文件
        useWorkerUpload(chunks,uploaded,md5,prepare.upload_key)

    }

    toggleUploadStatus(index,stop){
        let status = '正在上传'
        const Uploader = this.getWorker(index)
        Uploader.postMessage({
            stop
        })
        if(stop){
            status = '已暂停'
        }
        this.updateUploadTask(index,{
            stop,
            status
        })
    }

    reMountUploadInput(){
        this.setState(()=>({
            showUploadInput:false
        }),()=>{
            this.setState(()=>({
                showUploadInput:true
            }))
        })
    }

    uploaderDragLayerOnClose = event => {
        const {state} = this
        Modal.confirm({
            title:'终止上传',
            content:'关闭窗口将终止上传任务，是否继续',
            onOk:()=>{
                state.uploadTask.forEach(el=>{
                    if(el.worker && el.worker instanceof Worker){
                        try{
                            el.worker.terminate()
                        }catch(err){
                            console.error(err)
                        }
                    }
                })
                if(Array.isArray(this.FileChunkHandler)){
                    this.FileChunkHandler = this.FileChunkHandler.filter(el=>{
                        if(el instanceof FileChunk){
                            el.abort();
                        }
                        return false
                    })
                }else{
                    this.FileChunkHandler = []
                }
                this.setState({
                    uploadTask:[],
                    uploadLayerVisible:false
                })
            },
            onCancel:()=>{
                console.log('继续')
            }
        })
    }

    handleToggleCreateFolderInput(){
        this.props.onToggleCreateFolderInput()
    }

    render(){
        const {state} = this
        return (
            <div className="tool-bar">


                <Button type="primary" onClick={this.handleUploadClick.bind(this)} disabled={state.maxSize<=0 || state.chunkItemSize<=0}>
                    <MineIcon type="icon-upload" style={{
                        transform:`scale(1.5)`
                    }} /> 上传
                    {
                        state.showUploadInput?<input multiple ref={this.uploadInputEl} type="file" onChange={this.handleUploader.bind(this)} />:null
                    }

                </Button>

                <Button onClick={this.handleToggleCreateFolderInput.bind(this)}>
                    <Icon type="folder-add" theme="filled" style={{
                        transform:`scale(1.5)`
                    }} /> 新建文件夹
                </Button>

                {
                    this.props.del?(
                        <Button icon="delete" type="primary" onClick={this.props.onDelete}>
                            删除
                        </Button>
                    ):null
                }

                {
                    this.state.uploadLayerVisible?(
                        <DragLayer width="570px" height="370px" mask={false} title="文件上传" open={false} disableScrollY={false} onClose={this.uploaderDragLayerOnClose}>
                            <Uploader task={state.uploadTask} onToggleStatus={this.toggleUploadStatus.bind(this)} />

                        </DragLayer>
                    ):null
                }

            </div>
        )
    }
}

export default ToolBar