import React,{Component} from 'react'
import PropTypes from 'prop-types'
import {withRouter} from 'react-router'
import './HomeStyle.less'
// import Layout from '../../components/Layout/Layout'
import HeaderSearch from '../../components/HeaderSearch/HeaderSearch'
import cs from 'classnames'

class Home extends Component{

    static propTypes = {
        match: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired
    }

    // static
    static contextTypes = { theme: PropTypes.object }

    constructor(props){
        super(props)
    }

    render(){
        const tools = [
            {
                pic:'/pic/uwp-bg-2.jpg',
                name:'图片转Base64',
                tag:'pic-to-base64',
                url:'/'
            }
        ]

        const {theme} = this.context
        return (
            <div className="Home">
                <HeaderSearch></HeaderSearch>

                <div className="tools-list">

                    {
                        tools.map((el,key)=>{
                            return (

                                <div className={cs('tool-item',el.tag)} style={{
                                    background:theme.acrylicTexture40.background
                                }}>

                                </div>
                            )
                        })
                    }

                </div>
            </div>
        )
    }
}

export default withRouter(Home)