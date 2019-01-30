import React, {Component} from 'react'
import './style.less'
import {BrowserRouter as Router, Switch, Route} from "react-router-dom"
import {withRouter} from 'react-router'
import 'antd/dist/antd.css'
import {observer,inject} from 'mobx-react'
import Lizi from './components/Lizi/Lizi'
import Loading from '@components/Loading/Loading'

import AsyncComponent from './components/AsyncComponent'
import PropTypes from "prop-types"
// import { TransitionGroup, CSSTransition } from "react-transition-group"

function getRoute(name){
    return AsyncComponent(() => import(`./Router/${name}/${name}`))
}

// 路由组件
const Home = AsyncComponent(() => import('./Router/Home/Home'))
const NotFound = AsyncComponent(() => import('./Router/NotFound/NotFound'))

// 路由表
const routerTable = [
    {
        name:'PicToBase',
        path:'/pic-to-base64',
        component:getRoute('PicToBase'),
        needAuth : false
    },{
        name:'CheckFormat',
        path:'/check-format',
        component:getRoute('CheckFormat'),
        needAuth : false
    },{
        name:'NetDisk',
        path:'/network-disk/:folder_id?',
        component:getRoute('NetDisk'),
        needAuth : true
    }
]


@inject('stores') @observer
class App extends Component {

    static propTypes = {
        match: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired
    }

    constructor(props){
        super(props)

        const {stores,location,} = props
        const {AccountStatusStore,UIStore} = stores


        this.state = {
            routerTable
        }

    }

    isLoadLizi = () => {
        // return this.props.location.pathname!=='/network-disk'
        return !/^\/network-disk.*$/.test(this.props.location.pathname)
    }

    render() {
        const {props:{stores:{AccountStatusStore}}} = this
        return (

            <div className="App">
                {
                    this.isLoadLizi()?<Lizi count={80} color={"#b1b1b1"} />:null
                }

                <Switch>
                    <Route exact path="/" component={Home} />
                    {
                        this.state.routerTable.map((el,key)=>{
                            if(!!el.needAuth===false){
                                return <Route exact path={el.path} component={el.component} key={key} />
                            }
                            if(AccountStatusStore.initCheckingLogin){
                                return <Loading/>
                            }
                            return AccountStatusStore.isLogin?<Route exact path={el.path} component={el.component} key={key} />:null
                        })
                    }



                    <Route component={NotFound} />
                </Switch>

            </div>

        );
    }
}

export default withRouter(App);
