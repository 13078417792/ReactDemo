import React,{Component} from 'react'
import {inject} from 'mobx-react'
import Folder from '@components/NetDiskLayout/Folder/Folder'
import './MoveCopyStyle.less'
import PropTypes from 'prop-types'
import {Button,message} from 'antd'
import Url from '@util/Url'
import http from '@util/http'

@inject('stores')
class MoveCopy extends Component{

    static propTypes = {
        isFile:PropTypes.bool.isRequired,
        target:PropTypes.number.isRequired,
        onClose:PropTypes.func,
        onSuccess:PropTypes.func,
        copy:PropTypes.bool,
    }

    static defaultProps = {
        isFile:false,
        onClose:function(){},
        onSuccess:function(){},
        copy:false
    }

    constructor(props){
        super(props)
        this.state = {
            folder:0,
            create:false
        }
    }

    action = async ()=>{
        const {props,state} = this
        let url,params
        if(props.isFile){
            url = Url.NetDiskMoveFile
            params = {
                folder_id:state.folder,
                file_id:props.target
            }
        }else{
            url = Url.NetDiskMoveFolder
            params = {
                id:props.target,
                pid:state.currentFolder
            }
        }
        try{
            var result = await http.post(url,params)
        }catch(err){
            message.error('操作失败')
            console.error('移动文件/文件夹失败：',err)
            return Promise.reject(err)
        }
        if(!result.success) return Promise.reject(result.error || result.msg || '操作失败')
        this.props.onSuccess(result)
        return Promise.resolve(result)
    }

    render(){
        const {state,props,props:{stores:{DiskStore}}} = this
        return (
            <div className={'move-copy'}>

                <div className="folder-wrap">

                    <div style={{
                        margin:'1em 0'
                    }}>
                        <Folder
                            target={props.target}
                            isFile={props.isFile}
                            api={Url.NetDiskFolderContent}
                            params={{
                                exclude_file:1,
                                check_child:1
                            }}
                            currentFolder={state.folder}
                            create={state.create}
                            onSelect={id=>{
                                this.setState({
                                    folder:id
                                })
                            }}
                            onCloseCreate={()=>{
                                this.setState({
                                    create:false
                                })
                            }}
                            onSuccessCreate={()=>{
                                DiskStore.getContent(DiskStore.folderId,true)
                            }}
                        />
                    </div>




                </div>

                <div className="bottom">

                    <div className="left">
                        <Button size="small" type="primary" onClick={()=>{
                            this.setState(({create})=>({
                                create:!create
                            }))
                        }}>
                            新建文件夹
                        </Button>
                    </div>

                    <div className="right">
                        <Button size="small" type="primary" onClick={this.action}>
                            确定
                        </Button>

                        <Button size="small" onClick={e=>{
                            this.props.onClose()
                        }}>
                            取消
                        </Button>
                    </div>

                </div>
            </div>
        )
    }

}

export default MoveCopy