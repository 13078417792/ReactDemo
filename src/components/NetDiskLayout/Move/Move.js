import React,{Component} from 'react'
import cs from 'classnames'
import {message,Button} from 'antd'
import PropTypes from 'prop-types'
import {inject} from 'mobx-react'
import './Move.less'
import Folder from './Folder'
import Url from '@util/Url'
import http from '@util/http'

@inject("stores")
class Move extends Component{

    static propTypes = {
        id:PropTypes.number.isRequired,
        isFile:PropTypes.bool.isRequired,
        onClose:PropTypes.func,
        onSuccess:PropTypes.func,
        onFail:PropTypes.func
    }

    static defaultProps = {
        // idFile:true
        onClose:function(){},
        onSuccess:function(){},
        onFail:function(){}
    }


    buttonSize = 'small'

    constructor(props){
        super(props)
        this.state = {
            currentCheckFolder:0,
            createFormEnabled:false
        }
    }

    onSubCheck = id => {
        this.setState({
            currentCheckFolder:id,
            createFormEnabled:false
        })
    }

    async move(root=false){
        const {props} = this
        const hide = message.loading('请稍等...')
        try{
            var result = props.isFile?await http.post(Url.NetDiskMoveFile,{
                folder_id:root?0:this.state.currentCheckFolder,
                file_id:this.props.id
            }):await http.post(Url.NetDiskMoveFolder,{
                pid:root?0:this.state.currentCheckFolder,
                id:this.props.id
            })
            hide()
        }catch(err){
            hide()
            message.error('操作失败')
            console.error(`移动文件${!props.isFile?'夹':''}失败：`,err)
            this.props.onFail(err)
            return;
        }
        if(!result.success){
            const error = result.error || result.msg || '操作失败'
            message.error(error)
            this.props.onFail(error)
            return;
        }
        message.success(result.msg || '操作成功')
        this.props.onSuccess(result)
    }

    render(){
        const {state,props} = this
        const {stores:{DiskStore}} = props
        return (
            <div className={cs('file-folder-move')}>

                <div className="folder-wrap">
                    <div className="folder">

                        <Button type="primary" disabled={state.currentCheckFolder===0} size={this.buttonSize} style={{
                            marginBottom:'1em'
                        }} onClick={()=>{
                            this.setState({
                                currentCheckFolder:0,
                                createFormEnabled:false
                            })
                        }}>
                            切换到根目录
                        </Button>

                        <Folder indent={"1em"} onSubCheck={this.onSubCheck}
                                currentCheckFolderId={state.currentCheckFolder}
                                createFormEnabled={state.createFormEnabled}
                                onCloseCreateForm={()=>{
                                    this.setState({
                                        createFormEnabled:false
                                    })
                                }}
                                ignore={props.isFile?[]:[props.id]}
                                onCreateFolderSuccess={()=>{
                                    DiskStore.getContent(state.currentCheckFolder,true)
                                }}
                        />

                    </div>
                </div>


                <div className="bottom-button-zone">
                    <div className="left">
                        <Button size={this.buttonSize} onClick={e=>{
                            this.setState(()=>{
                                return {
                                    createFormEnabled:true
                                }
                            })
                            e.preventDefault()
                            e.stopPropagation()
                        }}>
                            新建文件夹
                        </Button>

                        {
                            state.currentCheckFolder!==0?(
                                <Button size={this.buttonSize} type="primary" onClick={e=>{
                                    this.setState(()=>{
                                        return {
                                            currentCheckFolder:0,
                                            createFormEnabled:true
                                        }
                                    })
                                    e.preventDefault()
                                    e.stopPropagation()
                                }}>
                                    新建二级根目录
                                </Button>
                            ):null
                        }

                    </div>


                    <div className="right">
                        {
                            state.currentCheckFolder!==0?(
                                <Button size={this.buttonSize} type="primary" onClick={()=>{
                                    this.move(true)
                                }}>
                                    移动到根目录
                                </Button>
                            ):null
                        }

                        <Button size={this.buttonSize} type="primary" onClick={this.move.bind(this,false)}>
                            确定
                        </Button>

                        <Button size={this.buttonSize} onClick={this.props.onClose}>
                            取消
                        </Button>
                    </div>
                </div>
            </div>
        )
    }


}

export default Move;