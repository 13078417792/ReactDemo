import React, {Component, Fragment} from 'react'
import PropTypes from 'prop-types'
import {withRouter} from 'react-router'
import {Link} from 'react-router-dom'
import './HomeStyle.less'
import HeaderSearch from '../../components/HeaderSearch/HeaderSearch'
import cs from 'classnames'
import {observer, inject} from "mobx-react"
import {Drawer, message, Button, Modal,Empty } from 'antd'
import AuthLink from '@components/AuthLink/AuthLink'

import UserLogin from '../../Drawer/UserLogin/UserLogin'
import UserSignUp from '../../Drawer/UserSignUp/UserSignUp'
import Auth from '@util/Auth'
import MineIcon from '@components/MineIcon'

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
        this.state = {
            ShowDragLayer: false,
            showLoginDrawer: false,
            showSignUpDrawer: false,
            drawerWidth: 0,
            delaySetDrawerWidthTimeoutIndex: null,
            handlingPath: null,
            tools:[{
                pic: '/pic/uwp-bg-2.jpg',
                icon:'icon-imgtobase',
                name: '图片转Base64',
                tag: 'pic-to-base64',
                url: '/pic-to-base64'
            }, {
                pic: '/pic/uwp-bg-2.jpg',
                icon:'icon-file-format',
                name: '查看文件格式',
                tag: 'check-format',
                url: '/check-format'
            }, {
                pic: '/pic/uwp-bg-2.jpg',
                icon:'icon-net-disk',
                name: '简易网盘',
                tag: 'network-disk',
                url: '/disk/content',
                needAuth: true
            }, {
                pic: '/pic/uwp-bg-2.jpg',
                icon:'icon-music-2',
                name: '音乐播放器',
                tag: 'music',
                url: '/music',
                needAuth: false
            }],
            search:false,
            searchResult:[]
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

    // 退出登录
    signOut = () => {
        const {history, stores: {AccountStatusStore}} = this.props
        Modal.confirm({
            title: '退出登录',
            content: '即将退出登录，是否继续',
            onOk: () => {
                Auth.signOut().then(() => {
                    history.replace('/')
                    AccountStatusStore.setStatus(false)
                }).catch(err => {
                    message.error('操作失败')
                    console.error('退出登录失败', err)
                })
            }
        })
    }

    Icon = props => {
        return <MineIcon {...props} />
    }

    ToolItem = props => {
        const {Icon} = this
        const {data} = props
        return (
            <Fragment>
                <Icon type={data.icon} />
                <p data-icon={data.icon} className="tool-name">{props.name}</p>

            </Fragment>
        )
    }

    onSearch = keywords => {
        // return;
        if(!keywords){
            this.setState({
                search:false,
                searchResult:[]
            })
            return;
        }
        const {state:{tools}} = this
        const regexp = RegExp(`^.*${keywords}.*$`,'ig')
        let searchResult = tools.filter(el=>regexp.test(el.name) || regexp.test(el.tag))
        this.setState({
            search:true,
            searchResult
        })
        // console.log(keywords)
    }

    ToolSection = props => {
        const {ToolItem} = this
        const {data} = props
        return !data.needAuth ? (

            <Link style={{
                backgroundColor:props.color
            }} to={{
                pathname: data.url
            }} className={cs('tool-item', data.tag)}>
                <ToolItem data={data} name={data.name} />
            </Link>
        ) : (
            <AuthLink style={{
                backgroundColor:props.color
            }} to={{
                pathname: data.url
            }} className={cs('tool-item', data.tag)}>
                <ToolItem data={data} name={data.name} />
            </AuthLink>
        )
    }

    render() {
        const {state} = this
        const {tools,search,searchResult} = state

        const {ToolSection} = this
        const {stores} = this.props

        const {AccountStatusStore,UIStore:{color:bgColor}} = stores
        let color = Object.values(bgColor)
        color.pop()
        return (
            <div className="Home">
                <HeaderSearch placeholder="搜索DEMO" onClear={()=>{
                    this.setState({
                        search:false,
                        searchResult:[]
                    })
                }} onSearch={this.onSearch} />

                {
                    !AccountStatusStore.isLogin && !AccountStatusStore.initCheckingLogin ? (
                        <div className="account-button">

                            <Button size="small" type="primary" onClick={e => {
                                this.setState({
                                    showLoginDrawer: true
                                })
                            }}>
                                登录
                            </Button>

                        </div>
                    ) : null

                }

                {
                    AccountStatusStore.isLogin && !AccountStatusStore.initCheckingLogin ? (
                        <div className="account-button">

                            <Button size="small" type="primary" onClick={this.signOut}>
                                退出登录
                            </Button>

                        </div>
                    ) : null

                }


                <div className="tools-list">

                    <div className='tools-list-wrap cl'>
                        {/*{*/}
                            {/*tools.map((el, key) => {*/}
                                {/*return !el.needAuth ? (*/}

                                    {/*<Link style={{*/}
                                        {/*backgroundColor:color[key%color.length]*/}
                                    {/*}} to={{*/}
                                        {/*pathname: el.url*/}
                                    {/*}} className={cs('tool-item', el.tag)} key={key}>*/}
                                        {/*<ToolItem data={el} pic={el.pic} name={el.name} />*/}
                                    {/*</Link>*/}
                                {/*) : (*/}
                                    {/*<AuthLink style={{*/}
                                        {/*backgroundColor:color[key%color.length]*/}
                                    {/*}} to={{*/}
                                        {/*pathname: el.url*/}
                                    {/*}} className={cs('tool-item', el.tag)}  key={key}>*/}
                                        {/*<ToolItem data={el} pic={el.pic} name={el.name} />*/}
                                    {/*</AuthLink>*/}
                                {/*)*/}
                            {/*})*/}
                        {/*}*/}

                        {
                            search?(
                                searchResult.length>0?
                                    searchResult.map((el,index)=><ToolSection color={color[index%color.length]} data={el} key={index} />):(<Empty/>)
                            ):tools.map((el,index)=><ToolSection color={color[index%color.length]} data={el} key={index} />)
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