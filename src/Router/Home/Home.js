import React, {Component,Fragment} from 'react'
import PropTypes from 'prop-types'
import {withRouter} from 'react-router'
import {Link} from 'react-router-dom'
import './HomeStyle.less'
import HeaderSearch from '../../components/HeaderSearch/HeaderSearch'
import cs from 'classnames'
import {observer, inject} from "mobx-react"
import {Drawer, message,Button,Modal} from 'antd'
import AuthLink from '@components/AuthLink/AuthLink'

import UserLogin from '../../Drawer/UserLogin/UserLogin'
import UserSignUp from '../../Drawer/UserSignUp/UserSignUp'
import Auth from '@util/Auth'

@inject("stores")
@observer
class Home extends Component {

    static propTypes = {
        match: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired
    }

    constructor(props) {
        super(props)
        const {stores} = props
        this.state = {
            ShowDragLayer: false,
            showLoginDrawer: false,
            showSignUpDrawer: false,
            drawerWidth: 0,
            delaySetDrawerWidthTimeoutIndex: null,
            handlingPath: null
        }
    }

    componentDidMount() {
        this.setDrawerWidth()
        window.addEventListener('resize', this.setDrawerWidth)
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.setDrawerWidth)
    }

    DragLayerClose = event => {

        this.setState({
            ShowDragLayer: false
        })
    }

    setDrawerWidth = () => {
        if (this.state.delaySetDrawerWidthTimeoutIndex) clearTimeout(this.state.delaySetDrawerWidthTimeoutIndex)
        setTimeout(() => {
            const {clientWidth} = document.body
            const maxWidth = 600
            let drawerWidth = maxWidth
            if (clientWidth < 1024) {
                drawerWidth = clientWidth * .8
            }
            this.setState({
                drawerWidth,
                delaySetDrawerWidthTimeoutIndex: null
            })
        }, 100)

    }

    ToolItem = props => {
        return (
            <Fragment>
                <div className="pic">
                    <img src={props.pic} alt=""/>
                </div>

                <p className="tool-name">{props.name}</p>
            </Fragment>
        )
    }

    // 退出登录
    signOut = () => {
        const {history,stores:{AccountStatusStore}} = this.props
        Modal.confirm({
            title:'退出登录',
            content:'即将退出登录，是否继续',
            onOk:()=>{
                Auth.signOut().then(()=>{
                    history.replace('/')
                    AccountStatusStore.setStatus(false)
                }).catch(err=>{
                    message.error('操作失败')
                    console.error('退出登录失败',err)
                })
            }
        })
    }

    render() {
        const tools = [
            {
                pic: '/pic/uwp-bg-2.jpg',
                name: '图片转Base64',
                tag: 'pic-to-base64',
                url: '/pic-to-base64'
            },
            {
                pic: '/pic/uwp-bg-2.jpg',
                name: 'MD5加密',
                tag: 'md5',
                url: '/md5'
            },
            {
                pic: '/pic/uwp-bg-2.jpg',
                name: '生成微信聊天页',
                tag: 'wechat-talk-screen',
                url: '/wechat-talk-screen'
            },
            {
                pic: '/pic/uwp-bg-2.jpg',
                name: '生成微信朋友圈',
                tag: 'wechat-friend-screen',
                url: '/wechat-friend-screen'
            },
            {
                pic: '/pic/uwp-bg-2.jpg',
                name: '查看文件格式',
                tag: 'check-format',
                url: '/check-format'
            }, {
                pic: '/pic/uwp-bg-2.jpg',
                name: '简易网盘',
                tag: 'network-disk',
                url: '/disk/content',
                needAuth: true
            }

        ]

        const {state,ToolItem} = this
        const {stores} = this.props

        const {AccountStatusStore} = stores
        // console.log(theme)
        return (
            <div className="Home">
                <HeaderSearch/>

                {
                    !AccountStatusStore.isLogin && !AccountStatusStore.initCheckingLogin?(
                        <div className="account-button">

                            <Button size="small" type="primary" onClick={e=>{
                                this.setState({
                                    showLoginDrawer:true
                                })
                            }}>
                                登录
                            </Button>

                        </div>
                    ):null

                }

                {
                    AccountStatusStore.isLogin && !AccountStatusStore.initCheckingLogin?(
                        <div className="account-button">

                            <Button size="small" type="primary" onClick={this.signOut}>
                                退出登录
                            </Button>

                        </div>
                    ):null

                }



                <div className="tools-list">

                    <div className='tools-list-wrap cl'>
                        {
                            tools.map((el, key) => {
                                return !el.needAuth?(

                                    <Link to={{
                                        pathname: el.url
                                    }} className={cs('tool-item', el.tag)} style={{
                                        background: 'rgba(0,0,0,.1)'
                                    }} key={key}>
                                        <ToolItem pic={el.pic} name={el.name} />
                                    </Link>
                                ):(
                                    <AuthLink to={{
                                        pathname: el.url
                                    }} className={cs('tool-item', el.tag)} style={{
                                        background: 'rgba(0,0,0,.1)'
                                    }} key={key}>
                                        <ToolItem pic={el.pic} name={el.name} />
                                    </AuthLink>
                                )
                            })
                        }
                    </div>


                </div>

                <Drawer
                    title={"登录账户"}
                    visible={this.state.showLoginDrawer}
                    width={this.state.drawerWidth}
                    onClose={() => {
                        this.setState({
                            showLoginDrawer: false
                        })
                    }}
                >
                    <UserLogin onRegister={() => {
                        this.setState({
                            showSignUpDrawer: true,
                            showLoginDrawer: false
                        })
                    }}

                               onSuccess={() => {
                                   // let handlingPath = this.state.handlingPath
                                   this.setState({
                                       showSignUpDrawer: false,
                                       showLoginDrawer: false,
                                       handlingPath: null
                                   })
                                   // this.props.history.push(handlingPath)

                               }}
                    />
                </Drawer>

                <Drawer
                    title={"注册账户"}
                    visible={this.state.showSignUpDrawer}
                    width={this.state.drawerWidth}
                    onClose={() => {
                        this.setState({
                            showSignUpDrawer: false
                        })
                    }}
                >
                    <UserSignUp onLogin={() => {
                        this.setState({
                            showSignUpDrawer: false,
                            showLoginDrawer: true
                        })
                    }} onSuccess={() => {
                        this.setState({
                            showSignUpDrawer: false,
                            showLoginDrawer: true
                        })
                    }}/>
                </Drawer>
            </div>
        )
    }
}

export default withRouter(Home)