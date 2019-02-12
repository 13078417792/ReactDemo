import React,{Component} from 'react'
// import {Fragment} from 'react-dom'
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

    hump(name,split='-'){
        if(!name) return ''
        return name.split(split).map((el,index)=>{
            if(!el) return ''
            if(index===0) return el
            return `${el[0].toUpperCase()}${el.slice(1)}`

        }).join('')
    }

    NotFound(){
        return (
            <Route render={()=><NotFound style={{
                width:'100%',height:'100%'
            }} />} />
        )
    }

    render(){
        const {props,state,tags,NotFound} = this
        const {stores:{UIStore},match} = props
        const {params} = match
        const tag = this.hump(params.tag || '')

        // 内部路由
        const FirstRouter = toJS(props.stores.RouterStore.musicLayoutRouter)
        const SecondRouter = toJS(props.stores.RouterStore.musicLayoutSecondRouter)
        const hasSecRouter = tag && tags.includes(tag) && SecondRouter.hasOwnProperty(tag)


        return (
                <div className={cs('music-layout',{
                    'icon-side-layout':UIStore.wy_music_side_only_icon,
                    'lock-icon-side':state.lockIconSideWidth
                })}>
                    <div className={cs('music-zone',{'height-overflow-hidden':hasSecRouter || !FirstRouter.hasOwnProperty(tag)})}>


                        <Switch>

                            {
                                hasSecRouter?<MusicInnerRouter tag={tag} />
                                    :!!tag?<NotFound />:(
                                        Object.values(FirstRouter).map((el,index)=>{
                                            return !!el.redirect?(
                                                <Redirect exact from={el.path} to={el.redirect} key={index} />
                                            ):<Route strict exact to={el.path} component={el.component} key={index} />
                                        })
                                    )
                            }

                            <NotFound />


                        </Switch>

                    </div>

                </div>
        )
    }
}

export default withRouter(Layout)