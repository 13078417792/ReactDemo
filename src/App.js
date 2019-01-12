import React, {Component} from 'react'
import './style.less'
import {BrowserRouter as Router, Switch, Route} from "react-router-dom"
import 'antd/dist/antd.css'
import Auth from './util/Auth'
import {observer,inject} from 'mobx-react'
import {computed,autorun,reaction} from 'mobx'
import Helper from './util/Helper'

import AsyncComponent from './components/AsyncComponent'

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
        component:getRoute('PicToBase')
    },{
        name:'CheckFormat',
        path:'/check-format',
        component:getRoute('CheckFormat')
    }
]


@inject('stores') @observer
class App extends Component {


    constructor(props){
        super(props)

        const {stores} = props
        const {AccountStatusStore} = stores

        this.state = {
            routerTable:routerTable.map(el=>{
                el.loadable = true
                return el
            })
        }

        reaction(()=>AccountStatusStore.isLogin,isLogin=>{
            const NetDiskRoute = {
                name:'NetDisk',
                path:'/network-disk',
                component:getRoute('NetDisk'),
                loadable:isLogin
            }
            if(isLogin){
                this.setState(({routerTable})=>{
                    // console.log(routerTable.concat(NetDiskRoute))
                    return {
                        routerTable:routerTable.concat(NetDiskRoute)
                    }
                })
            }else{
                this.setState(({routerTable})=>{
                    routerTable.slice(routerTable.indexOf(NetDiskRoute),1)
                    return {
                        routerTable:routerTable
                    }
                })
            }

        })
    }

    render() {
        console.log(Helper.config('backgroundImage'))
        return (

            <div className="App" style={{
                backgroundImage:`url(${Helper.config('backgroundImage')})`
            }}>
                <Router>

                    <Switch>
                        <Route exact path="/" component={Home} />
                        {
                            this.state.routerTable.map((el,key)=>{
                                console.log(el.path,el.loadable)
                                return el.loadable?<Route exact path={el.path} component={el.component} key={key} />:null
                            })
                        }



                        <Route component={NotFound} />
                    </Switch>


                </Router>
            </div>

        );
    }
}

export default App;
