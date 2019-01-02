import React,{Component} from 'react'
import PropTypes from 'prop-types'
import {withRouter} from 'react-router'
import {Link} from 'react-router-dom'
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

    componentDidMount(){
        // alert(`${document.body.clientWidth},${document.body.clientHeight}`)
    }

    render(){
        const tools = [
            {
                pic:'/pic/uwp-bg-2.jpg',
                name:'图片转Base64',
                tag:'pic-to-base64',
                url:'/pic-to-base64'
            },
            {
                pic:'/pic/uwp-bg-2.jpg',
                name:'图片编辑',
                tag:'pic-to-base64',
                url:'/pic-to-base64'
            },
            {
                pic:'/pic/uwp-bg-2.jpg',
                name:'MD5加密',
                tag:'pic-to-base64',
                url:'/pic-to-base64'
            },
            {
                pic:'/pic/uwp-bg-2.jpg',
                name:'生成微信聊天页',
                tag:'pic-to-base64',
                url:'/pic-to-base64'
            },
            {
                pic:'/pic/uwp-bg-2.jpg',
                name:'图片转Base64',
                tag:'pic-to-base64',
                url:'/pic-to-base64'
            },
            {
                pic:'/pic/uwp-bg-2.jpg',
                name:'图片编辑',
                tag:'pic-to-base64',
                url:'/pic-to-base64'
            },
            {
                pic:'/pic/uwp-bg-2.jpg',
                name:'MD5加密',
                tag:'pic-to-base64',
                url:'/pic-to-base64'
            },
            {
                pic:'/pic/uwp-bg-2.jpg',
                name:'生成微信聊天页',
                tag:'pic-to-base64',
                url:'/pic-to-base64'
            },
            {
                pic:'/pic/uwp-bg-2.jpg',
                name:'图片转Base64',
                tag:'pic-to-base64',
                url:'/pic-to-base64'
            },
            {
                pic:'/pic/uwp-bg-2.jpg',
                name:'图片编辑',
                tag:'pic-to-base64',
                url:'/pic-to-base64'
            },
            {
                pic:'/pic/uwp-bg-2.jpg',
                name:'MD5加密',
                tag:'pic-to-base64',
                url:'/pic-to-base64'
            },
            {
                pic:'/pic/uwp-bg-2.jpg',
                name:'生成微信聊天页',
                tag:'pic-to-base64',
                url:'/pic-to-base64'
            },

        ]

        const {theme} = this.context
        return (
            <div className="Home">
                <HeaderSearch></HeaderSearch>

                <div className="tools-list">

                    <div className='tools-list-wrap cl'>
                        {
                            tools.map((el,key)=>{
                                return (

                                    <Link to={{
                                        pathname:el.url
                                    }} className={cs('tool-item',el.tag)} style={{
                                        background:theme.acrylicTexture40.background
                                    }} key={key}>

                                        <div className="pic">
                                            <img src={el.pic} alt=""/>
                                        </div>

                                        <p className="tool-name">{el.name}</p>
                                    </Link>
                                )
                            })
                        }
                    </div>


                </div>
            </div>
        )
    }
}

export default withRouter(Home)