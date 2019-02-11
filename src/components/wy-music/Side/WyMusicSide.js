import React,{Component} from 'react'
import {createPortal} from 'react-dom'
import cs from 'classnames'
import PropTypes from 'prop-types'
import './SideStyle.less'
import MineIcon from '@components/MineIcon'
import {isFunction} from 'lodash'
import {inject,observer} from 'mobx-react'
import {Link} from 'react-router-dom'
import {withRouter} from 'react-router-dom'

@inject("stores") @observer
class Side extends Component {

    static propTypes = {
        match: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired
    }

    list = [
        {icon:'icon-search',label:'搜索',url:'/music/search'},
        {icon:'icon-music',label:'发现音乐',url:'/music/discover/recommend'},
        {icon:'icon-mv',label:'MV',url:'/music/mv'},
        {icon:'icon-history',label:'最近播放',url:'/music/history'},
    ];
    resizeTimeoutIndex = null

    constructor(props){
        super(props)
        this.resizeWidth()
    }

    componentDidMount(){
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
            this.resizeWidth()
        },100)

    }

    resizeWidth(){
        const {props:{stores:{UIStore}}} = this
        UIStore.setStatus('wy_music_side_only_icon',document.body.clientWidth<1024)
    }

    handleClickMenu = () => {
        const {props:{stores:{UIStore}}} = this
        UIStore.toggle('wy_music_side_only_icon')
        this.forceUpdate()
        // console.log(UIStore.wy_music_side_only_icon)
    }

    render(){
        const {props,props:{stores:{UIStore},location},list} = this
        return (
            <ul className={cs('wy-music-side',{hide:!props.show && props.isOuter,icon:UIStore.wy_music_side_only_icon})}>

                <li>
                    <MineIcon  className="side-item-icon" type={'icon-menu'}  onClick={this.handleClickMenu} />
                </li>

                {
                    list.map((el,index)=>{
                        const shortUrlArr = el.url.split('/').filter(el=>!!el)
                        const shortUrl = shortUrlArr.length>=2?`/${shortUrlArr[0]}/${shortUrlArr[1] || ''}`:''
                        return (
                            <li key={index} className={cs({
                                on:shortUrl && location.pathname.indexOf(shortUrl)!==-1
                            })} onClick={()=>{
                                const nameArr = el.icon.split('-')
                                nameArr.shift()
                                const name = nameArr.map(el=>el.length?`${el[0].toLocaleUpperCase()}${el.slice(1)}`:'').join('')
                                const functionName = `handleClick${name}`
                                if(name && this.hasOwnProperty(functionName) && isFunction(this[functionName]) ){
                                    this[functionName].call(this)
                                }
                            }}>
                                <Link to={el.url}>
                                    <MineIcon  className="side-item-icon" type={el.icon} />
                                    <span>
                                    {el.label}
                                </span>
                                </Link>

                            </li>
                        )
                    })
                }

            </ul>
        )
    }
}

class WyMusicSide extends Component {

    static propTypes = {
        isOuter:PropTypes.bool
    }

    static defaultProps = {
        isOuter:false
    }


render(){
    return this.props.isOuter?createPortal(<Side {...this.props} />,document.body):<Side {...this.props} />
}

}

export default withRouter(WyMusicSide)