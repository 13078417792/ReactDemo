import React,{Component,Fragment,createRef} from 'react'
import PropTypes from 'prop-types'
import {inject,observer} from 'mobx-react'
import API from '@util/CloudMusicAPI'
import cs from 'classnames'
import {withRouter,Link} from 'react-router-dom'
import './DetailStyle.less'
import Loading from '@components/Loading/Loading'
import {Button,Avatar,Icon,message} from 'antd'
import dayjs from 'dayjs'
import MineIcon from '@components/MineIcon'
import DrawerMenu from '@components/wy-music/Drawer/DrawerMenuContainer'
import http from '@util/http'
import {computed} from 'mobx'
import Helper from '@util/Helper'

@inject('stores') @observer
class SongListDetail extends Component {

    static propTypes = {
        match: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired
    }

    state = {
        list:[],
        info:{},
        creator:{},
        privileges:[],
        loaded:false,
        hideDesc:true,
        showHideDescIcon:false,
        searchResult:null,
        searching:false
    }

    desc = createRef()

    constructor(props){
        super(props)
        this.detail()
    }

    intro_loaded = false
    componentDidUpdate(){
        if(!this.intro_loaded){
            if(this.intro_desc && this.intro_desc.offsetHeight>28){
                this.intro_loaded = true
                this.setState({
                    showHideDescIcon:true
                })
            }
        }
    }

    componentDidCatch(err){
        message.error(Helper.handleErrorMsg(err,'未知错误'))
    }

    @computed get intro_desc(){
        return this.desc.current
    }



    Loading = () => {
        const {state} = this
        return state.loaded?null:(
            <div className="loading">
                <Loading size={35} border={2} style={{
                    position:'unset'
                }} />
            </div>
        )
    }

    detail(){
        API.fetch('PLAYLIST_DETAIL',{id:this.props.match.params.id}).then(result=>{
            this.setState({
                list:result.playlist.tracks,
                creator:result.playlist.creator,
                privileges:result.privileges,
                loaded:true,
                info:(function(detail){
                    const field = ['creator','tracks']
                    field.forEach(el=>{
                        delete detail[el]
                    })
                    return detail
                })(result.playlist),
            })
            // console.log(result)
        })
    }

    Button = (props) => {
        return (
            <Button size={"small"} className="wy-music-playlist-detail-page-btn" {...props}>
                {props.children}
            </Button>
        )
    }

    showNumber(count){
        return count>999?'999+':count
    }


    button_group = props => {
        const {Button,state:{info},showNumber} = this
        return (
            <div className={cs('button-group',props.className || '')}>

                <Button icon="folder-add" disabled>
                    收藏({showNumber(info.subscribedCount)})
                </Button>

                <Button icon={"message"} onClick={e=>{
                    e.stopPropagation()
                    e.preventDefault()
                    this.props.history.push(`/music/comment/playlist/${this.props.match.params.id}`)
                }}>
                    评论({showNumber(info.commentCount)})
                </Button>

                <Button icon={"share-alt"}>
                    分享({showNumber(info.shareCount)})
                </Button>
            </div>
        )
    }

    playAll = () => {
        const {MusicStore} = this.props.stores
        MusicStore.setQueue(this.state.list,true)
    }

    onSearchTimeout = null
    onSearch = ({target:{value}}) => {
        // console.log(value)
        if(this.onSearchTimeout){
            clearTimeout(this.onSearchTimeout)
            this.onSearchTimeout = null
        }
        if(!value){
            this.setState({
                searchResult:null,
                searching:false
            })
            return;
        }
        this.setState({
            searching:true
        })
        const {list} = this.state
        this.onSearchTimeout = setTimeout(()=>{
            const result = list.filter(el=>{
                const val = value.toLowerCase()
                return el.name.toLowerCase().indexOf(val)!==-1 ||
                    el.alia.some(alia=>alia.toLowerCase().indexOf(val)!==-1) ||
                    el.al.name.toLowerCase().indexOf(val)!==-1 ||
                    el.ar.some(ar=>ar.name.toLowerCase().indexOf(val)!==-1)
            })
            // console.log(result)
            this.setState({
                searching:false,
                searchResult:result
            })
        },500)
    }

    bar = props => {
        const {state:{info}} = this
        return (
            <div className="tool-bar">

                <div className="button cl">
                    <button className="tool-item" onClick={this.playAll}>
                        <div className="cc">
                            <MineIcon type={'icon-play-2'} style={{color:'#DF3B3B'}} />
                            <span>播放全部({info.trackCount})</span>
                        </div>
                    </button>

                    <button className="tool-item">
                        <div className="cc">
                            <MineIcon type={'icon-multi-select'} />
                            <span>选择</span>
                        </div>

                    </button>
                </div>

                <div className="search">
                    <input type="text" placeholder="搜索歌单歌曲" onChange={this.onSearch} />
                </div>


            </div>
        )
    }

    Icon = props => {
        return <MineIcon {...props} />
    }

    like = () => {

    }

    song = props => {
        const {Icon} = this
        return (
            <div className="song cl" onDoubleClick={()=>{
                const {MusicStore} = this.props.stores
                const {list} = this.state
                try{
                    MusicStore.setQueue(list)
                    MusicStore.toggleSong(props.id).catch(err=>{
                        message.error(err.message || err)
                    })
                }catch(err){
                    message.error(err.message || err)
                }
            }}
                onContextMenu={props.onContextMenu || null}
            >
                <span className="index">
                    {props.index.length===1?`0${props.index}`.slice(-2):props.index}
                </span>

                <div className="song-info">

                    <span className="song-title">
                        {props.title}

                            {
                                props.alia.length>0?(
                                    <span className="alia">
                                        ({props.alia[0]})
                                    </span>
                                ):null
                            }

                    </span>

                    <span className="singer">
                        {
                            props.singer.map(el=>el.name).join('/')
                        }
                    </span>

                    <span className="album">
                        {props.album.name}
                    </span>

                    <span className="duration">
                        {props.duration}
                    </span>

                    {
                        props.sq || props.hq?(
                            <span className="bt">
                                {
                                    props.sq?<Icon type="icon-sq" />:<Icon type="icon-hq" />
                                }
                            </span>
                        ):null
                    }


                </div>

            </div>
        )
    }

    expandDesc = hide => {
        this.setState({
            hideDesc:hide
        })
    }


    intro = ()=> {
        const {state:{info,creator,hideDesc,showHideDescIcon},button_group:ButtonGroup} = this
        return (
            <div className="intro cl">

                <div className="img">
                    <img src={info.coverImgUrl} alt={info.name} />

                </div>

                <div className="right">

                    <p className="name overflow">
                        {info.name}
                    </p>

                    <div className="creator">
                        <Avatar className="avatar" size={30} src={creator.avatarUrl} />
                        <span className="nickname">{creator.nickname}</span>
                        <span className="time">{dayjs(info.createTime).format('YYYY-MM-DD')}创建</span>
                    </div>

                    <ButtonGroup className="head-part-button-group" />

                    <div className="info">
                        <p>
                            标签: <span> {info.tags.join('/')} </span>
                        </p>
                        <p className={cs({height:hideDesc})}>
                            介绍:
                            <span className={cs('desc')} ref={this.desc}>
                                {info.description}
                            </span>
                            {
                                showHideDescIcon?
                                    (hideDesc?<Icon type="caret-down" theme="filled" className="expand-hide" onClick={this.expandDesc.bind(null,false)} />:<Icon type="caret-up" theme="filled" className="expand-hide"  onClick={this.expandDesc.bind(null,true)} />):
                                    null

                            }
                        </p>
                    </div>


                </div>

            </div>


        )
    }

    getBottomMenu = data => {
        return {
            play_control:[{
                name:'下一首播放',
                handler:()=>{
                    const {MusicStore} = this.props.stores
                    MusicStore.addQueue(data)
                }
            }],
            account:[{
                name:'收藏',
                disabled:true
            },{
                name:'评论',
                handler:()=>{
                    this.props.history.push(`/music/comment/playlist/${this.props.match.params.id}`)
                }
            },{
                name:'下载',
                handler:()=>{
                    // message.info(`下载${data.name}`)
                    const {MusicStore} = this.props.stores
                    MusicStore.get_song_url(data.id).then(url=>{
                        return http.get(url,{
                            responseType:'blob'
                        })
                    }).then(response=>{
                        const url = URL.createObjectURL(response);
                        const element = document.createElement('a')
                        element.href = url
                        element.download = `${MusicStore.handleSinger(data.ar,',')} - ${data.name}`
                        // element.setAttribute('download',`${MusicStore.handleSinger(data.ar,',')} - ${data.name}`)
                        element.click()
                    }).catch(err=>{
                        message.error(`获取下载地址失败`)
                    })
                }
            },{
                name:'分享',
                disabled:true
            }],
            about:[{
                name:`歌手`
            },{
                name:'专辑'
            }]
        }
    }

    render(){
        const {Loading:MineLoading,state:{loaded,list,privileges,searching,searchResult},intro:Intro,button_group:ButtonGroup,bar:Bar,song:Song} = this
        // console.log(privileges)
        let songs = searchResult===null?list:searchResult
        return (
            <div className={cs('song-list-detail','common-detail')}>

                <span className="title">歌单</span>

                <MineLoading/>

                {
                    loaded?(
                        <Fragment>

                            <Intro />

                            <ButtonGroup className="middle-part-button-group" />


                            <Bar />

                            <div className="list">
                                {
                                    searching?(
                                        <Loading size={30} border={1} style={{
                                            position:'absolute',
                                            width:'100%',
                                            height:'500px'
                                        }} />
                                    ):songs.map((el,index)=>{
                                        return (
                                            <DrawerMenu key={index} menu={this.getBottomMenu(el)}
                                                zIndex={70}
                                            >

                                                <Song
                                                      data={el}
                                                      id={el.id}
                                                      index={(index+1).toString()}
                                                      title={el.name}
                                                      alia={el.alia}
                                                      singer={el.ar.map(el=>({id:el.id,name:el.name}))}
                                                      album={el.al}
                                                      duration={dayjs(el.dt).format('mm:ss')}
                                                      sq={privileges[index].maxbr>441000}
                                                      hq={privileges[index].maxbr>192000}
                                                />
                                            </DrawerMenu>
                                        )
                                    })
                                }

                            </div>

                        </Fragment>
                    ):null
                }

            </div>
        )
    }
}

export default withRouter(SongListDetail)