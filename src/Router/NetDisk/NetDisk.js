import React,{Component,createRef,createClass} from 'react'
import {findDOMNode} from 'react-dom'
import PropTypes from 'prop-types'
import NetDiskLayout from '../../components/NetDiskLayout/NetDiskLayout'
import {withRouter} from 'react-router'
import './NetDiskStyle.less'
import {observer,inject} from 'mobx-react'
import {isNumber,isBoolean,isEmpty} from 'lodash'
import {message,Icon,Input,Button,Form,Modal,Checkbox} from 'antd'
import MineIcon from '@components/MineIcon'
import cs from 'classnames'
import filesize from 'filesize'
import dayjs from 'dayjs'
import http from '@util/http'
import Url from '@util/Url'
import CreateFolderForm from '../../components/NetDiskLayout/CreateFolderForm'
import ContextMenuWrapper from '@components/ContextMenu/ContextMenuWrapper'
import DragLayer from '@components/DragLayer/DragLayer'
import Move from '../../components/NetDiskLayout/Move/Move'
import NameForm from '@components/NetDiskLayout/NameForm/NameForm'


@inject("stores")
@observer
class NetDisk extends Component{

    static propTypes = {
        match: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired
    }

    folderReName = createRef()
    fileRename = createRef()

    state = {
        folderRename:{},
        fileRename:{},
        mkdir:false,
        mkdiring:false,
        column:{
            folder:{
                label:'文件夹',
                width:'60%'
            },
            size:{
                label:'大小',
                    width:'16%'
            },
            time:{
                label:'修改日期',
                    width:'24%'
            }
        },
        lastFolderId:0,
        folderName:'',
        opening:false,
        contextMenuEnable:true,
        folderContextMenuData:[
            {
                label:'打开',
                handler:(id)=>{
                    this.openFolder(id)
                }
            },{
                label:'删除',
                handler:(id)=>{
                    Modal.confirm({
                        title:'删除文件夹',
                        content:'即将删除文件夹，是否继续',
                        onOk:()=>{
                            this.deleteFolder(id)
                        }
                    })
                }
            },{
                label:'重命名',
                handler:id=>{
                    this.setState(({folderRename})=>{
                        for(let i in folderRename){
                            folderRename[i] = false
                        }
                        folderRename[id] = true

                        return {folderRename}
                    })
                }
            },{
                label:'移动到...',
                handler:(id)=>{
                    this.setState({
                        openMove:true,
                        moveLayerId:id,
                        moveLayerIsFile:false
                    })
                }
            }
        ],
        fileContextMenuData:[{
            label:'下载',
            handler:(id,download)=>{
                // console.log(download)
                window.open(download)
            }
        },{
            label:'删除',
            handler:(id)=>{
                Modal.confirm({
                    title:'删除文件',
                    content:'即将删除文件，是否继续',
                    onOk:()=>{
                        this.deleteFile(id)
                    }
                })
            }
        },{
            label:'重命名',
            handler:id=>{
                this.setState(({fileRename})=>{
                    for(let i in fileRename){
                        fileRename[i] = false
                    }
                    fileRename[id] = true

                    return {fileRename}
                })
            }
        },{
            label:'移动到...',
            handler:id=>{
                this.setState({
                    openMove:true,
                    moveLayerId:id,
                    moveLayerIsFile:true
                })
            }
        }],
        openMove:false,
        moveLayerId:0,
        moveLayerIsFile:false,
        fileCheckbox:[],
        folderCheckbox:[]
    }

    constructor(props) {
        super(props)
        // this.currentFolderID = this.props.stores.DiskStore.folderId
        const {stores: {DiskStore}, match, location} = props

        if (match.params.folder_id && !isNaN(match.params.folder_id)) {
            DiskStore.setFolder(match.params.folder_id)
        }

        console.time('初始化网盘列表')
        this.updateCurrentFolderContent(DiskStore.folderId).then(content => {
            console.timeEnd('初始化网盘列表')
            console.log('初始化网盘列表成功')
            this.updateRenameData(content.files, content.folders)
        }).catch(err => {
            message.error('初始化网盘列表失败',err)
            console.timeEnd('初始化网盘列表')
        })
    }



    updateRenameData(files,folders){
        const fileRename = {}
        folders.forEach(el=>{
            fileRename[el.id] = false
        })
        const folderRename = {}
        folders.map(el=>{
            folderRename[el.id] = false
        })
        this.setState({
            fileRename,
            folderRename
        })
    }

    componentWillReceiveProps(props){
        // console.log(props)
        const {stores:{DiskStore},match:{params:{folder_id}}} = props

        if(folder_id && !isNaN(folder_id)){
            DiskStore.setFolder(folder_id)
        }else{
            DiskStore.setFolder(0)
        }

        this.updateCurrentFolderContent(DiskStore.folderId).then(content=>{
            this.setState({
                folderCheckbox:[],
                fileCheckbox:[]
            })
            this.updateRenameData(content.files,content.folders)
        }).catch(err=>{
            message.error(err)
        })
    }

    async deleteFile(id){
        if(!id){
            message.error('删除失败')
            return;
        }
        const hide = message.loading('删除中...',0)
        try{
            var result = await http.post(Url.NetDiskDeleteFile,{
                id
            })
            hide()
        }catch(err){
            hide()
            message.error(err.message || '操作失败')
            return;
        }
        if(!result.success){
            message.error(result.error  || result.msg || '操作失败')
            return;
        }

        message.success('删除成功')
        this.props.stores.DiskStore.getContent(null,true)
    }

    async deleteFolder(id){
        const hide = message.loading('正在删除',0)
        let result
        try{
            result = await http.post(Url.NetDiskRequestDeleteFolder,{
                id
            })
        }catch(err){
            message.error('删除失败')
            hide()
            return;
        }
        if(!result.success){
            message.error('删除失败')
            hide()
            return;
        }

        if(result.has_child || result.has_child_file){
            await (()=>{
                return new Promise((resolve,reject)=>{
                    const modal = Modal.confirm({
                        title:'确认',
                        content:'文件夹不为空，继续删除将同步删除文件夹内所有数据',
                        onOk:()=>{
                            resolve()
                        },
                        onCancel:()=>{
                            hide()
                            reject()
                        }
                    })
                })
            })()
        }

        const {delKey:del_key} = result
        try{
            result = await http.post(Url.NetDiskDeleteFolder,{
                id,
                del_key
            })
        }catch(err){
            message.error('删除失败')
            hide()
            return;
        }
        if(!result.success){
            message.error('删除失败')
            hide()
            return;
        }
        hide()
        const {props:{stores:{DiskStore}}} = this
        DiskStore.getContent(DiskStore.folderId,true)
        message.success('删除成功')
    }

    updateCurrentFolderContent = id => {
        if([null,undefined,'',NaN].includes(id) || isNaN(id) || id<0 ) return Promise.reject('非法数据')
        const hide = message.loading('正在加载数据...',0)
        const {stores:{DiskStore}} = this.props
        // return DiskStore.de
        return DiskStore.getDetail(id).then(async detail=>{
            DiskStore.updatePath(detail.path || [])

            let content
            try{
                content = await DiskStore.getContent(id)
            }catch(err){
                hide()
                return Promise.reject(err)
            }
            hide()
            DiskStore.updateFolders(content.folders)
            DiskStore.updateFiles(content.files)
            return Promise.resolve(content)
        }).catch(err=>{
            hide()
            return Promise.reject(err)
        })
    }

    FolderFileName(props){
        const {state:{column,folderCheckbox,fileCheckbox}} = this
        const buttons = props.button || []
        const {id,isFolder} = props
        const checked = isFolder?folderCheckbox.includes(id):fileCheckbox.includes(id)
        return (
            <div className={cs("part",'part-1','part-folder',props.className || '')} style={{
                width:column.folder.width
            }}>
                <div className="check-on" onClick={e=>{
                    e.stopPropagation()
                    this.toggleContent(id,isFolder)
                }} >
                    <Checkbox checked={checked}/>
                </div>

                <span className="type-icon">
                    {
                        props.mine?<MineIcon type={props.type} />:(<Icon type={props.type}/>)
                    }
                </span>
                <div className="name overflow">
                    {props.children?props.children:'-'}
                </div>

                {
                    buttons.length>0?(
                        <div className="button-group"  onDoubleClick={e=>{e.preventDefault()}}>
                            {
                                buttons.map((el,index)=>{
                                    return (
                                        <Button title={el.title || ''} icon={el.icon} key={index} type="primary" size="small" shape="circle" onClick={e=>{

                                            el.handler && el.handler.call(this,e,...(!!el.args?(Array.isArray(el.args)?el.args:Object.values(el.args)):[]))
                                            e.preventDefault()
                                        }} />
                                    );
                                })
                            }
                        </div>
                    ):null
                }

            </div>
        )
    }

    FolderFileSize(props){
        const {state:{column}} = this
        return (
            <div className={cs('part','part-size')} style={{
                width:column.size.width
            }}>
                {props.children?props.children:'-'}
            </div>
        )
    }

    FolderFileUpdateTime(props){
        const {state:{column}} = this
        return (
            <div className={cs('part','part-time')} style={{
                width:column.time.width
            }}>
                {props.children?props.children:'-'}
            </div>
        )
    }

    handleToggleCreateFolderInput(show){
        if(this.state.mkdiring) return;
        this.setState(({mkdir})=>({
            // mkdir:!mkdir
            mkdir:isBoolean(show)?show:(!mkdir)
        }))
    }

    // 新建文件夹成功
    onCreateFolderSuccess(result){
        const {props:{stores:{DiskStore}}} = this
        message.success(result.msg)
        DiskStore.getContent(DiskStore.folderId,true)
        this.setState({
            mkdiring:false
        })
        this.handleToggleCreateFolderInput.call(this,false)
    }

    // 新建文件夹失败
    onCreateFolderFail(err){
        message.error('创建失败')
        console.error(err)
        this.setState({
            mkdiring:false
        })
    }

    onCloseCreateFolderForm(){
        this.handleToggleCreateFolderInput.call(this,false)
    }


    openFolder(id){
        const {state} = this
        if(state.opening) return;
        const {history} = this.props
        history.push(`/disk/content/${id}`)
        // this.setState({
        //     folderCheckbox:[],
        //     fileCheckbox:[]
        // })
        // this.updateCurrentFolderContent(id)
    }

    updateContent = () => {
        const {props:{stores:{DiskStore}}} = this
        DiskStore.getContent(DiskStore.folderId,true).then(()=>{
            this.setState({
                folderCheckbox:[],
                fileCheckbox:[]
            })
        })
    }

    closeFolderRename = id => {
        this.setState(({folderRename})=>({
            folderRename:(function(data,id){
                data[id] = false
                return data
            })(folderRename,id)

        }))
    }

    closeFileRename = id => {
        this.setState(({fileRename})=>({
            fileRename:(function(data,id){
                data[id] = false
                return data
            })(fileRename,id)

        }))
    }

    toggleContent = (id,isFolder) => {
        // if()
        this.setState(({folderCheckbox,fileCheckbox})=>{
            let checkbox = isFolder?folderCheckbox:fileCheckbox
            if(checkbox.includes(id)){
                checkbox.splice(checkbox.indexOf(id),1)
            }else{
                checkbox.push(id)
            }
            return isFolder?{
                folderCheckbox:checkbox
            }:{
                fileCheckbox:checkbox
            }
        })
    }

    batch_delete= () => {
        const {fileCheckbox:file,folderCheckbox:folder} = this.state
        if(isEmpty(file) && isEmpty(folder)){
            message.error('操作失败，没有选择任何文件/文件夹')
            return;
        }
        Modal.confirm({
            title:'批量删除',
            content:'是否确认删除当前选中的文件夹/文件,不可恢复',
            onOk:()=>{

            }
        })
    }

    render(){
        const {state,state:{column,mkdir,fileCheckbox,folderCheckbox}} = this
        const {props:{stores:{DiskStore:{folders,files,folderId}}}} = this
        const {props:{stores}} = this

        const FolderFileName = this.FolderFileName.bind(this)
        const FolderFileSize = this.FolderFileSize.bind(this)
        const FolderFileUpdateTime = this.FolderFileUpdateTime.bind(this)



        return (
            <NetDiskLayout
                className={"wd"}
                onToggleCreateFolderInput={this.handleToggleCreateFolderInput.bind(this)}
                showDel={!!(fileCheckbox.length || folderCheckbox.length)}
                onDelete={this.batch_delete}
            >
                <div className="dir-file-wrapper cl">

                    <div className="field-column">

                        {
                            Object.values(column).map((el,index)=>{
                                return (
                                    <div className="column-item" key={index} style={{
                                        width:el.width
                                    }}>
                                        {
                                            index===0?(
                                                <Checkbox className={'toggle-check-all'} />
                                            ):null
                                        }
                                        <span>
                                            {el.label}
                                        </span>
                                    </div>
                                )
                            })
                        }
                    </div>

                    <ul className="dir-file">
                        {
                            mkdir?(
                                <li className="item">
                                    <FolderFileName mine={true} type="icon-folder" >


                                        <CreateFolderForm
                                            api={Url.NetDiskCreateFolder}
                                            params={{
                                                parent:stores.DiskStore.folderId
                                            }}
                                            onSubmit={this.onCreateFolderSuccess.bind(this)}
                                            onClose={this.onCloseCreateFolderForm.bind(this)}
                                            onFail={this.onCreateFolderFail.bind(this)}/>


                                    </FolderFileName>

                                    <FolderFileSize />

                                    <FolderFileUpdateTime />
                                </li>

                            ):null
                        }

                        {
                            folders.map((el,index)=>{
                                return (
                                    <ContextMenuWrapper  key={index} menu={state.folderContextMenuData} args={[el.id]}>
                                        <li className={cs('item',{check:state.folderCheckbox.includes(el.id)})} onDoubleClick={e=>{
                                            let ref = this.folderReName.current
                                            if(ref){
                                                if(!(ref instanceof Element)){
                                                    ref = findDOMNode(ref)
                                                }
                                                if(e.nativeEvent.path.includes(ref)){
                                                    return;
                                                }
                                            }
                                            this.openFolder.call(this,el.id)
                                        }}>
                                            <FolderFileName isFolder={true} mine={true} type="icon-folder" id={el.id}>


                                                {
                                                    state.folderRename[el.id]?(
                                                        <NameForm
                                                            ref={this.folderReName}
                                                            initialValue={el.name}
                                                            show={!!state.folderRename[el.id]}
                                                            api={Url.NetDiskFolderUpdate}
                                                            params={{id:el.id}}
                                                            onClose={()=>{
                                                                this.closeFolderRename(el.id)
                                                            }}
                                                            onSuccess={()=>{
                                                                this.closeFolderRename(el.id)
                                                                this.updateCurrentFolderContent(folderId)
                                                            }}
                                                            onFail={err=>{
                                                                message.error(err.message || err)
                                                            }}
                                                        />
                                                    ):el.name
                                                }
                                            </FolderFileName>

                                            <FolderFileSize />

                                            <FolderFileUpdateTime>
                                                {dayjs.unix(el.update_time).format('YYYY-MM-DD HH:mm')}
                                            </FolderFileUpdateTime>
                                        </li>
                                    </ContextMenuWrapper>
                                )
                            })
                        }

                        {
                            files.map((el,index)=>{
                                return el.is_merge?
                                    (
                                        <ContextMenuWrapper  key={index} menu={state.fileContextMenuData} args={[el.id,el.download]}>
                                            <li className={cs('item',{check:state.fileCheckbox.includes(el.id)})} key={index}>
                                                <FolderFileName isFolder={false} id={el.id} mine={false} type="file" button={[
                                                    {
                                                        icon:'download',
                                                        title:'下载',
                                                        handler:(e,id)=>{
                                                            window.open(el.download)
                                                        },
                                                        args:[el.id]
                                                    }
                                                ]}>
                                                    {
                                                        state.fileRename[el.id]?(
                                                            <NameForm
                                                                initialValue={el.name}
                                                                show={!!state.fileRename[el.id]}
                                                                api={Url.NetDiskFileRename}
                                                                params={{id:el.id}}
                                                                onClose={()=>{
                                                                    this.closeFileRename(el.id)
                                                                }}
                                                                onSuccess={()=>{
                                                                    this.closeFileRename(el.id)
                                                                    this.updateCurrentFolderContent(folderId)
                                                                }}
                                                                onFail={err=>{
                                                                    message.error(err.message || err)
                                                                }}
                                                            />

                                                        ):el.name
                                                    }
                                                </FolderFileName>

                                                <FolderFileSize>
                                                    {filesize(el.size)}
                                                </FolderFileSize>

                                                <FolderFileUpdateTime>
                                                    {dayjs.unix(el.time).format('YYYY-MM-DD HH:mm')}
                                                </FolderFileUpdateTime>
                                            </li>
                                        </ContextMenuWrapper>
                                ):null
                            })
                        }

                    </ul>

                </div>

                {
                    state.openMove?<DragLayer width="600px" height="410px" title={"移动到"} onClose={() => {
                        this.setState({
                            openMove: false
                        })
                    }}>

                        <Move
                            id={state.moveLayerId}
                            isFile={state.moveLayerIsFile}
                            onClose={()=>{
                                this.setState({
                                    openMove: false
                                })
                            }}
                            onSuccess={()=>{
                                this.updateContent()
                                this.setState({
                                    openMove: false
                                })
                            }}


                        />
                    </DragLayer>:null
                }
            </NetDiskLayout>

        )
    }
}

export default withRouter(NetDisk)