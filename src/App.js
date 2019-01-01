import React, { Component } from 'react'
import './style.less'
import { Theme as UWPThemeProvider, getTheme } from "react-uwp/Theme"
import { BrowserRouter as Router,Switch, Route, Link } from "react-router-dom"

import AsyncComponent from './components/AsyncComponent'
// 路由组件
const Home = AsyncComponent(()=>import('./Router/Home/Home'))

class App extends Component {
  render() {
    return (

      <UWPThemeProvider
        theme={getTheme({
            themeName: "dark", // set custom theme
            accent: "#0078D7", // set accent color
            useFluentDesign: true, // sure you want use new fluent design.
            desktopBackgroundImage: "/pic/uwp-bg-1.jpg" // set global desktop background image
        })}
      >
          <div className="App">

              <Router>

                  <Switch>
                      <Route path="/" component={Home} />
                  </Switch>


              </Router>
          </div>

      </UWPThemeProvider>

    );
  }
}

export default App;
