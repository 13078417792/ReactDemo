import React,{Component} from 'react'
import NetDiskSide from './NetDiskSide'
import './MainLayoutStyle.less'
import {Button,Icon,Dropdown,Menu,Modal,Drawer,message} from 'antd'
import ToolBar from './ToolBar'
import FileBread from './FileBread'
import PropTypes from 'prop-types'
import {isFunction} from 'lodash'
import cs from 'classnames'
import http from '@util/http'
import Url from '@util/Url'
import Auth from '@util/Auth'
import DragLayer from '@components/DragLayer/DragLayer'
import {isBoolean,isObject} from 'lodash'
import ModifyPassword from '@drawer/ModifyPassword/ModifyPassword'
import {withRouter} from 'react-router'
import {inject} from 'mobx-react'



const {Item:{MenuItem}} = Menu

@inject('stores')
class NetDiskLayout extends Component{

    static propTypes = {
        className:PropTypes.string,
        onToggleCreateFolderInput:PropTypes.func,
        match: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired,
        onDelete:PropTypes.func,
        showDel:PropTypes.bool
    }

    static defaultProps = {
        className:'',
        onToggleCreateFolderInput:function(){},
        onDelete:function(){},
        showDel:false
    }

    constructor(props){
        super(props)
        this.state = {
            dropdownVisible:false,
            showPasswordModifyForm:false
        }
        this.menuList = [
            {
                label:'返回首页',
                handler:'backIndex'
            },
            {
                label:'退出登录',
                handler:'logout'
            },{
                label:'修改密码',
                handler:'togglePasswordModifyForm',
                args:[true]
            }
        ]
    }

    backIndex(){
        const {history} = this.props
        history.push('/')
    }

    handleMenuClick({key}) {
        // console.log(key)
        if(!!this.menuList[key] ){
            const item = this.menuList[key]
            if(!item.hasOwnProperty('handler') || !isFunction(this[item.handler]) ) return;
            let args = []
            if(Array.isArray(item.args)){
                args = item.args
            }else if(isObject(item.args)){
                args = Object.values(item.args)
            }
            this[item.handler].call(this,...args)
        }
    }

    logout = () => {
        const {stores:{AccountStatusStore},history} = this.props
        Modal.confirm({
            title: '退出登录',
            content: '即将退出登录，是否继续',
            okText: '确认',
            cancelText: '取消',
            onOk:()=>{
                Auth.signOut().then(()=>{
                    history.replace('/')
                    AccountStatusStore.setStatus(false)
                }).catch(err=>{
                    message.error('操作失败')
                    console.error('退出登录失败:',err)
                })
            }
        })
    }

    menu = () => {
        return (

            <Menu onClick={this.handleMenuClick.bind(this)}>
                {
                   this.menuList.map((el,index)=><Menu.Item key={index}>{el.label}</Menu.Item>)
                }
            </Menu>
        )
    }

    handleToggleCreateFolderInput(){
        this.props.onToggleCreateFolderInput()
    }

    togglePasswordModifyForm = show => {
        if(!isBoolean(show)){
            this.setState(({showPasswordModifyForm})=>({
                showPasswordModifyForm:!showPasswordModifyForm
            }))
        }else{
            this.setState({
                showPasswordModifyForm:show
            })
        }
    }



    render(){
        const {props,state} = this
        return (
            <div className={cs('network-disk-wrapper',props.className)}>

                <div className="layout-header">

                    <div className="logo">
                        网盘
                    </div>

                    <div className="right-part">
                        <Dropdown overlay={this.menu} trigger={['hover']}>
                            <Button shape="circle" type="primary" icon="setting" >

                            </Button>
                        </Dropdown>

                    </div>

                </div>

                <div className="layout-main-container">
                    <div className="left-side">
                        <NetDiskSide>

                        </NetDiskSide>
                    </div>

                    <div className="main-wrapper">

                        <div className="main">

                            <div className="action-container">
                                <ToolBar
                                    onToggleCreateFolderInput={this.handleToggleCreateFolderInput.bind(this)}
                                    onDelete={props.onDelete}
                                    del={props.showDel}
                                />

                                <FileBread />
                            </div>

                            <div className="main-area">
                                {props.children}
                            </div>

                        </div>
                    </div>
                </div>





                <Drawer
                    title="修改密码"
                    width="500px"
                    visible={state.showPasswordModifyForm}
                    closable={true}
                    maskClosable={true}
                    onClose={this.togglePasswordModifyForm.bind(null,false)}
                >
                    {
                        state.showPasswordModifyForm?(
                            <ModifyPassword onSuccess={()=>{
                                this.togglePasswordModifyForm()
                            }} />
                        ):null
                    }
                </Drawer>

            </div>
        )
    }
}

export default withRouter(NetDiskLayout)