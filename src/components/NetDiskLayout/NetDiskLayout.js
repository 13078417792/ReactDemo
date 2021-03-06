import React,{Component} from 'react'
import NetDiskSide from './NetDiskSide'
import './MainLayoutStyle.less'
import {Button,Dropdown,Menu,Modal,Drawer,message} from 'antd'
import ToolBar from './ToolBar'
import FileBread from './FileBread'
import PropTypes from 'prop-types'
import {isFunction} from 'lodash'
import cs from 'classnames'
import Auth from '@util/Auth'
import {isBoolean,isObject} from 'lodash'
import ModifyPassword from '@drawer/ModifyPassword/ModifyPassword'
import {withRouter} from 'react-router'
import {inject,observer} from 'mobx-react'
import MineIcon from '@components/MineIcon'
import DocumentTitle from 'react-document-title'

@inject('stores') @observer
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
        // this.handleMenuClick.bind(this)}
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
        console.log(123)
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
        const {props,state,props:{stores:{UIStore}}} = this
        return (
            <DocumentTitle title='简易网盘'>


                <div className={cs('network-disk-wrapper',props.className,{'side-mask-close':UIStore.net_disk_layout_side_mobile_show})}
                    onMouseDown={e=>{
                        if(UIStore.net_disk_layout_side_mobile_show){
                            e.preventDefault()
                            e.stopPropagation()
                            UIStore.toggleNetDiskLayoutSideMobileStatus()
                        }
                    }}
                >

                    <div className="layout-header">

                        <div className="logo">
                            网盘
                        </div>

                        <div className="mobile-left-part">
                            <Button size={"small"} onClick={()=>{
                                UIStore.toggleNetDiskLayoutSideMobileStatus()
                            }}>
                                <MineIcon type={"icon-menu"} />
                            </Button>
                        </div>

                        <div className="right-part">
                            <Dropdown overlay={this.menu} trigger={['click']}>
                                <Button shape="circle" type="primary" icon="setting" />
                            </Dropdown>

                        </div>

                    </div>

                    <div className="layout-main-container">
                        <div className={cs('left-side',{'mobile-show':UIStore.net_disk_layout_side_mobile_show})}>
                            <NetDiskSide />
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
                        width={document.body.clientWidth>1024?'500px':`${document.body.clientWidth*.8}px`}
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
            </DocumentTitle>
        )
    }
}

export default withRouter(NetDiskLayout)