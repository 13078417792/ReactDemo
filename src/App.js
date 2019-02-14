import React, {Component} from 'react'
import './style.less'
import {Switch, Route} from "react-router-dom"
import {withRouter} from 'react-router'
import 'antd/dist/antd.css'
import {observer,inject} from 'mobx-react'
import {toJS,computed} from 'mobx'
// import Lizi from './components/Lizi/Lizi'
import Loading from '@components/Loading/Loading'
import AsyncComponent from './components/AsyncComponent'
import PropTypes from "prop-types"
import MineIcon from '@components/MineIcon'
import cs from 'classnames'
import MusicSide from '@components/wy-music/Side/WyMusicSide'
import MusicLayout from '@router/Music/Layout/Layout'
import MusicInnerRouter from '@router/Music/InnerRouter/InnerRouter'
import WyPlayer from '@components/wy-music/Player/Player'
// import AsyncComponent from '@components/AsyncComponent'

// 路由组件
const Home = AsyncComponent(() => import('./Router/Home/Home'))
const NotFound = AsyncComponent(() => import('./Router/NotFound/NotFound'))


@inject('stores') @observer
class App extends Component {

    static propTypes = {
        match: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired
    }

    constructor(props){
        super(props)

        // const {UIStore} = props.stores
        // UIStore.setStatus('wy_music_player',false)

        this.state = {}



    }

    layout = {
        music:{
            component:MusicLayout,
            tag:['discover'],
            children:props=>{
                const tags = this.layout.music.tag
                if(!props.tag || !tags.includes(props.tag)) throw new Error('音乐布局组件tag属性不存在')
                return (
                    <MusicInnerRouter tag={props.tag} >
                        {props.children}
                    </MusicInnerRouter>
                )
            }
        }
    }

    @computed get router(){
        const {RouterStore} = this.props.stores
        return Object.values(toJS(RouterStore.list))
    }

    isLoadLizi = () => {
        // return this.props.location.pathname!=='/network-disk'
        return !/^\/disk.*$/.test(this.props.location.pathname)
    }

    hideWyMusicButton = () => {
        this.props.stores.UIStore.toggle('wy_music_side')
    }

    render() {
        const {props:{stores:{AccountStatusStore,UIStore},location}} = this
        // const {state} = this
        // console.log(location)
        return (

            <div className={cs('App',{'player-show':UIStore.wy_music_player})}>
                <div className="App-container">


                    <Switch>
                        <Route exact path="/" component={Home} />


                        {
                            this.router.map((el,key)=>{
                                if(!!el.needAuth===false){
                                    return <Route exact path={el.path} component={el.component} key={key} />
                                }
                                if(AccountStatusStore.initCheckingLogin){
                                    return <Loading key={key}/>
                                }
                                return AccountStatusStore.isLogin?<Route exact path={el.path} component={el.component} key={key} />:null
                            })
                        }



                        <Route component={NotFound} />
                    </Switch>

                    <button className={cs('wy-music',{hide:/^\/music/.test(location.pathname)})} onClick={this.hideWyMusicButton}>
                        <MineIcon type="icon-musiccloud" />
                    </button>

                    <MusicSide isOuter={!/^\/music/.test(location.pathname)} />

                    <WyPlayer show={UIStore.wy_music_player} className={cs('bottom-music-player')} style={{
                        zIndex:60
                    }} />

                </div>

            </div>

        );
    }
}

export default withRouter(App);
