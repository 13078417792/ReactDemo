import React, {Component} from 'react'
import './style.less'
import {Theme as UWPThemeProvider, getTheme} from "react-uwp/Theme"
import {BrowserRouter as Router, Switch, Route} from "react-router-dom"

import AsyncComponent from './components/AsyncComponent'

function getRoute(name){
    return AsyncComponent(() => import(`./Router/${name}/${name}`))
}

// 路由组件
const Home = AsyncComponent(() => import('./Router/Home/Home'))
const NotFound = AsyncComponent(() => import('./Router/NotFound/NotFound'))
// const PicToBase = AsyncComponent(() => import('./Router/PicToBase/PicToBase'))
const PicToBase = getRoute('PicToBase')

function getDark(){
    return getTheme({
        themeName: "dark", // set custom theme
        accent: "#0078D7", // set accent color
        useFluentDesign: true, // sure you want use new fluent design.
        desktopBackgroundImage: "/pic/uwp-bg-8.jpg" // set global desktop background image
    })
}

function getLight(){
    return getTheme({
        themeName: "light", // set custom theme
        accent: "#0078D7", // set accent color
        useFluentDesign: true, // sure you want use new fluent design.
        desktopBackgroundImage: "/pic/uwp-bg-8.jpg" // set global desktop background image
    })
}

class App extends Component {

    constructor(props){
        super(props)
    }

    render() {
        return (

            <UWPThemeProvider
                theme={getLight()}
            >
                <div className="App">

                    <Router>

                        <Switch>
                            <Route exact path="/" component={Home}/>
                            <Route exact path="/pic-to-base64" component={PicToBase} />

                            <Route component={NotFound} />
                        </Switch>


                    </Router>
                </div>

            </UWPThemeProvider>

        );
    }
}

export default App;
