import React,{Component} from 'react'
import {inject,observer} from 'mobx-react'
import {toJS} from 'mobx'
import './inner-router.less'
import PropTypes from 'prop-types'
import cs from 'classnames'
import {Link,withRouter,Route,Switch} from 'react-router-dom'
import NotFound from '@router/NotFound/NotFound'

@inject("stores") @observer
class InnerRouter extends Component{

    static propTypes = {
        tag:PropTypes.string,
        match: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired
    }

    static defaultProps = {
        tag:''
    }



    state = {
        title : {
            discover:'发现音乐'
        }
    }


    render(){
        const {props,props:{stores:{RouterStore},match},state:{title}} = this
        const {params} = match
        const link = toJS(RouterStore.musicPath[props.tag]) || []
        // console.log(params)
        let RouterGroups = []
        const hasRouter = props.tag && title.hasOwnProperty(props.tag)
        return (
            <div className="inner-router">

                {
                    hasRouter?(
                        <div className="music-router-header">
                            <p className="inner-router-title">{title[props.tag]}</p>

                            <ul className="router-list cl">
                                {
                                    link.map((el,index)=>{
                                        RouterGroups.push(<Route exact path={el.path} key={index} component={el.component} />)
                                        if(!!el.index){
                                            RouterGroups.push(<Route exact path={`/music/${props.tag}`} key={`${index}-index`} component={el.component} />)
                                        }
                                        return (
                                            <li key={index} className={cs({on:el.path===`/music/${props.tag}/${params.sub || ''}`})}>
                                                <Link to={el.path}>
                                                    {el.label}
                                                </Link>
                                            </li>
                                        )
                                    })
                                }
                            </ul>
                        </div>
                    ):null
                }


                <div className="music-router-container">


                    <Switch>
                        {RouterGroups}

                        <Route render={()=>{
                            return <NotFound style={{
                                width:'100%',
                                height:'100%'
                            }} />
                        }} />
                    </Switch>

                    {/*<Route exact path={`/music/${props.tag}`} key={`${index}-index`} component={el.component} />*/}
                </div>


            </div>
        )
    }
}

export default withRouter(InnerRouter)