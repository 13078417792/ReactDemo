import React, {Component} from 'react'
import './style.less'
import {Switch, Route} from "react-router-dom"
import {withRouter} from 'react-router'
import 'antd/dist/antd.css'
import {observer,inject} from 'mobx-react'
import {toJS,computed} from 'mobx'
import Lizi from './components/Lizi/Lizi'
import Loading from '@components/Loading/Loading'
import AsyncComponent from './components/AsyncComponent'
import PropTypes from "prop-types"


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

        // const {stores:{AccountStatusStore:{isLogin,initCheckingLogin}}} = props

        this.state = {}

    }

    @computed get router(){
        const {RouterStore} = this.props.stores
        return Object.values(toJS(RouterStore.list))
    }

    isLoadLizi = () => {
        // return this.props.location.pathname!=='/network-disk'
        return !/^\/disk.*$/.test(this.props.location.pathname)
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

            </div>

        );
    }
}

export default withRouter(App);
