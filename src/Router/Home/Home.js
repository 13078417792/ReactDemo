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
                tag:'edit-picture',
                url:'/edit-picture'
            },
            {
                pic:'/pic/uwp-bg-2.jpg',
                name:'MD5加密',
                tag:'md5',
                url:'/md5'
            },
            {
                pic:'/pic/uwp-bg-2.jpg',
                name:'生成微信聊天页',
                tag:'wechat-talk-screen',
                url:'/wechat-talk-screen'
            },
            {
                pic:'/pic/uwp-bg-2.jpg',
                name:'生成微信朋友圈',
                tag:'wechat-friend-screen',
                url:'/wechat-friend-screen'
            },
            {
                pic:'/pic/uwp-bg-2.jpg',
                name:'查看文件格式',
                tag:'view-file-fmt',
                url:'/view-file-fmt'
            },
            {
                pic:'/pic/uwp-bg-2.jpg',
                name:'简易网盘',
                tag:'network-disk',
                url:'/network-disk'
            },


        ]

        const {theme} = this.context
        console.log(theme)
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
                                        background:theme.acrylicTexture60.background
                                        // background:theme.desktopBackground
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