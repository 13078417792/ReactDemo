import React,{Component} from 'react'
import cs from 'classnames'
import {toJS} from 'mobx'
import {inject,observer} from 'mobx-react'
import './music-layout.less'
import {Switch, Route,Redirect} from "react-router-dom"
import {withRouter} from 'react-router'
import PropTypes from "prop-types"
import MusicInnerRouter from '@router/Music/InnerRouter/InnerRouter'
// import AsyncComponent from '@components/AsyncComponent'
import NotFound from '@router/NotFound/NotFound'

// const NotFound = AsyncComponent(() => import('@router/NotFound/NotFound'))
@inject("stores") @observer
class Layout extends Component{


    state = {
        lockIconSideWidth:false
    }
    resizeTimeoutIndex = null

    static propTypes = {
        match: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired
    }

    tags = ['discover']


    componentDidMount(){
        this.resizeWidth()
        window.addEventListener('resize',this.resize.bind(this))
    }

    componentWillUnmount(){
        window.removeEventListener('resize',this.resize.bind(this))
    }

    resize(){
        if(this.resizeTimeoutIndex){
            clearTimeout(this.resizeTimeoutIndex)
            this.resizeTimeoutIndex = null
        }
        this.resizeTimeoutIndex = setTimeout(()=>{
            this.resizeWidth(this)
        },100)

    }

    resizeWidth(){
        this.setState({
            lockIconSideWidth:document.body.clientWidth<1024
        })
    }

    render(){
        const {props,state,tags} = this
        const {stores:{UIStore},match} = props
        const {params} = match
        const tag = params.tag || 'home'
        const FirstRouter = toJS(props.stores.RouterStore.music)
        const SecondRouter = toJS(props.stores.RouterStore.musicPath)
        const hasSecRouter = tags.includes(tag) && SecondRouter.hasOwnProperty(tag)
        return (
                <div className={cs('music-layout',{
                    'icon-side-layout':UIStore.wy_music_side_only_icon,
                    'lock-icon-side':state.lockIconSideWidth
                })}>
                    <div className={cs('music-zone',{'height-overflow-hidden':hasSecRouter || !FirstRouter.hasOwnProperty(tag)})}>


                        <Switch>

                            {
                                hasSecRouter ? tags.map((el,index)=>{
                                    return <MusicInnerRouter tag={el} key={index} />
                                }):(
                                    FirstRouter.hasOwnProperty(tag)?(
                                        FirstRouter[tag].redirect?<Redirect from={FirstRouter[tag].path} to={FirstRouter[tag].redirect} />:
                                        <Route exact to={FirstRouter[tag].path} component={FirstRouter[tag].component} />
                                    ):<Route render={()=><NotFound style={{
                                        width:'100%',height:'100%'
                                    }} />} />
                                )
                            }

                        </Switch>

                    </div>

                </div>
        )
    }
}

export default withRouter(Layout)