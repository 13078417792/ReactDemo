import React,{Component,Fragment} from 'react'
import {withRouter} from 'react-router'
import {Link} from 'react-router-dom'
import {inject} from 'mobx-react'
import Login from '@drawer/UserLogin/UserLogin'
import Register from '@drawer/UserSignUp/UserSignUp'
import {Drawer,message} from 'antd'
import PropTypes from 'prop-types'
import {isString,isEmpty} from 'lodash'
import cs from 'classnames'
import './AuthLinkStyle.less'

const URI = require('urijs')
@inject('stores')
class AuthLink extends Component{

    static propTypes = {
        match: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired,
        to:PropTypes.oneOfType([
            PropTypes.object.isRequired,
            PropTypes.string.isRequired
        ])
    }


    constructor(props){
        super(props)
        this.state = {
            signInDraw:false,
            signUpDraw:false,
            drawerWidth:0,
            setDrawerDelay:null
        }
        this.url = this.handleUrl(props.to)
    }

    componentDidMount(){
        this.setDrawerWidth()
        window.addEventListener('resize', this.setDrawerWidth)
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.setDrawerWidth)
        if(this.hide){
            this.hide()
        }
    }

    setDrawerWidth = () => {
        if (this.state.setDrawerDelay) clearTimeout(this.state.setDrawerDelay)
        setTimeout(() => {
            const {clientWidth} = document.body
            const maxWidth = 600
            let drawerWidth = maxWidth
            if (clientWidth < 1024) {
                drawerWidth = clientWidth * .8
            }
            this.setState({
                drawerWidth,
                setDrawerDelay: null
            })
        }, 100)

    }

    hide = null
    url = ''

    onClick = e => {
        // e.preventDefault()
        const {props} = this
        const {stores:{AccountStatusStore}} = props
        if(AccountStatusStore.initCheckingLogin){
            e.preventDefault()
            return;
        }
        if(!AccountStatusStore.isLogin){
            e.preventDefault()
            message.error('请先登录')
            this.setState({
                signInDraw:true
            })
            return;
        }
    }

    handleUrl(url){
        if(isEmpty(url)) return null
        let handlingPath
        if(isString(url)){
            handlingPath = url
        }else{
            const uri = new URI(url.pathname)
            if(!isEmpty(url.search)){
                uri.addQuery(url.search)
            }
            if(!isEmpty(url.hash)){
                uri.addQuery(url.hash)
            }
            handlingPath = uri.toString()
        }

        return handlingPath
    }


    render(){
        const {props} = this
        const {stores:{AccountStatusStore}} = props
        const cloneProps = (function(props){
            const {to,style,title} = props
            return {
                to,style,title
            }
        })(props)

        return (
            <Fragment>
                <Link {...cloneProps} onClick={e=>{
                    e.stopPropagation()
                    this.onClick(e)
                }} className={cs(props.className,{
                    'not-allow':AccountStatusStore.initCheckingLogin
                })} >
                    {props.children}
                </Link>



                <Drawer
                    title={"登录账户"}
                    visible={this.state.signInDraw && !AccountStatusStore.isLogin && !AccountStatusStore.initCheckingLogin}
                    width={this.state.drawerWidth}
                    onClose={() => {
                        this.setState({
                            signInDraw: false
                        })
                    }}
                >
                    <Login onRegister={() => {
                        this.setState({
                            signUpDraw: true,
                            signInDraw: false
                        })
                    }}

                       onSuccess={() => {
                           this.setState({
                               signUpDraw: false,
                               signInDraw: false
                           })
                           this.props.history.push(this.url)

                       }}
                    />
                </Drawer>

                <Drawer
                    title={"注册账户"}
                    visible={this.state.signUpDraw && !AccountStatusStore.isLogin && !AccountStatusStore.initCheckingLogin}
                    width={this.state.drawerWidth}
                    onClose={() => {
                        this.setState({
                            signUpDraw: false
                        })
                    }}
                >
                    <Register onLogin={() => {
                        this.setState({
                            signUpDraw: false,
                            signInDraw: true
                        })
                    }} onSuccess={() => {
                        this.setState({
                            signUpDraw: false,
                            signInDraw: true
                        })
                    }}/>
                </Drawer>


            </Fragment>
        )
    }
}

export default withRouter(AuthLink)