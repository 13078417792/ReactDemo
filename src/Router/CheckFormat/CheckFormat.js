import React,{Component} from 'react'
import PropTypes from 'prop-types'
import {withRouter} from 'react-router'
import './CheckFormatStyle.less'
import Layout from '../../components/Layout/Layout'
import cs from 'classnames'
import FileHelper from '../../util/File'
import filesize from 'filesize'
import http from '../../util/http'
import {message} from 'antd'

export default withRouter(class CheckFormat extends Component{

    static propTypes = {
        match: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired
    }

    static contextTypes = { theme: PropTypes.object }

    constructor(props){
        super(props)
        this.state = {
            status:false,
            fileName:null,
            fileSize:0,
            fileType:null,
            headerList:FileHeader
        }
        this.getFileExtInfo()

    }

    async getFileExtInfo(){
        try{
            var {data} = await http.post('/tool/file_format/getInfo')
        }catch(e){
            console.error('获取数据失败',e)
            return
        }
        const {info} = data
        console.log(info)

        this.setState({
            headerList:info
        })
    }

    handleOpenFile = e =>{
        const {target} = e
        const {files} = target
        if(files.length===0) return;
        const file = files[0]
        console.log(file)
        this.setState({
            status:true,
            fileName:file.name,
            fileSize:file.size,
            fileType:'正在识别'
        })

        FileHelper.toArrayBuffer(file).then(buffer=>{
            console.log(buffer)
            const view = new DataView(buffer)
            // console.log(view,view.getInt8(0))
            // console.log(FileHelper.getFileDataView(view,0,8))
            let result = this.checkFormat(view)
            console.log(result)
            let type
            if(result===false){
                type = '未知格式'
            }else{
                type = result
            }
            this.setState({
                fileType:type
            })
        }).catch(err=>{
            console.error(err,err.code,err.name,typeof err.message)
            message.error(err.message,5)
            // console.error()
            this.setState({
                fileType:'未知格式'
            })
        })
    }

    // 检查格式
    checkFormat(view){
        let result = false
        const compare = function(data,target) {
            if (data.length !== target.length) return false
            for(let i in data){
                // console.log(data[i],target[i])
                if(data[i]!=target[i]){
                    return false
                }
            }
            return true
        }

        for(let ext in this.state.headerList){
            const info = this.state.headerList[ext]
            // console.log(info)
            const start = info.start || info.header.split(',').map(el=>parseInt(el))
            let end = info.end?info.end.split(',').map(el=>parseInt(el)):[]
            // console.log(info,start,end)
            if( !(Array.isArray(start) && Array.isArray(end)) ) break;
            const currentFileHeader = FileHelper.getFileDataView(view,info.header_index,start.length)
            const currentFileEnd = end.length===0?[]:FileHelper.getFileDataView(view,view.byteLength-end.length,end.length)
            if(compare(currentFileHeader,start) && compare(currentFileEnd,end)){
                result = info.ext
                break;
            }
        }

        return result
    }

    FileInfo() {
        if (!this.state.status) return null;

        return (
            <ul className="file-info">
                <li>
                    文件名：{this.state.fileName}
                </li>
                <li>
                    文件大小：{filesize(this.state.fileSize)}
                </li>
                <li>
                    文件格式：{this.state.fileType}
                </li>
            </ul>
        )
    }


    render(){


        const FileInfo = this.FileInfo.bind(this)
        return (
            <Layout>

                <div>
                    <p>查看文件格式</p>


                    <input type="file" onChange={this.handleOpenFile}/>

                    <FileInfo />
                </div>
            </Layout>
        )
    }
})