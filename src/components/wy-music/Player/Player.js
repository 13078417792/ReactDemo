import React,{Component} from 'react'
import {inject,observer} from 'mobx-react'
import PropTypes from 'prop-types'
import cs from 'classnames'
import './PlayerStyle.less'
import {computed,toJS,observable} from 'mobx'
import MineIcon from '@components/MineIcon'
import {Icon,message} from 'antd'
import dayjs from 'dayjs'
import {isString,mapValues,isFunction} from 'lodash'
// import http from '@util/http'
import API from '@util/CloudMusicAPI'
// import ContextMenuWrapper from '@components/ContextMenu/ContextMenuWrapper'
import DrawerMenu from '@components/wy-music/Drawer/DrawerMenuContainer'
import Progress from '@components/wy-music/Progress/Progress'


@inject('stores') @observer
class Player extends Component {

    static propTypes = {
        show:PropTypes.bool,
        style:PropTypes.object,
        className:PropTypes.string,
    }

    static defaultProps = {
        show:true,
        style:{},
        className:''
    }

    state = {
        show_list:false,
        paused:true,
        canplay:false,
        progress:0,
        subscription:false
    }

    // @observable audio = document.createElement('audio')
    // audio_ctx = new AudioContext()

    @observable audio = document.createElement('audio')
    audio_ctx = new AudioContext()
    source = null


    // constructor(props){
    //     super(props)
    // }

    componentDidMount(){
        const {MusicStore} = this.props.stores
        this.initAudio()
        MusicStore.addEvent('setQueue',this.onSetQueue)
        MusicStore.addEvent('toggleSong',this.onToggleSong)
        MusicStore.addEvent('init',this.player_init,this.player_init_fail_handler)
    }

    componentWillUnmount(){
        const {MusicStore} = this.props.stores
        MusicStore.removeEvent('setQueue',this.onSetQueue)
        MusicStore.removeEvent('toggleSong',this.onToggleSong)
        MusicStore.removeEvent('init',this.player_init,this.player_init_fail_handler)
    }

    player_init = id => {
        const {MusicStore} = this.props.stores
        if(id){
            MusicStore.get_song_url(id).then(url=>{
                this.setAudioUrl(url)
            }).catch(err=>{
                message.error(err.message||err)
                // this.next()
            })
        }
    }

    player_init_fail_handler = err => {
        message.error(err.message||err)
    }

    onSetQueue = id => {
        // const {MusicStore} = this.props.stores
        this.setState(()=>({
            canplay:false,
            subscription:true
        }))
        this.pause()
        // const info = MusicStore.getSongInfoByIndex(this.play_index)
        this.getUrl(id).then(({url})=>{
            this.setAudioUrl(url)
        }).catch(err=>{
            message.error('获取歌曲播放信息失败')
        })
    }

    onToggleSong = (id,url) => {
        // const {MusicStore} = this.props.stores
        this.setState(()=>({
            canplay:false,
            subscription:true
        }))
        // this.pause()
        this.setAudioUrl(url)
        // this.play()
        // console.log(info)
    }

    setAudioUrl(url){
        if(!url || !/^http/.test(url)) throw new Error('播放URL不合法')
        this.resetProgress()
        this.audio.src = url
        this.setState({
            canplay:false
        })
    }

    initAudio(){
        const {audio,audio_ctx:ctx} = this
        audio.addEventListener('canplay',()=>{
            this.setState(()=>{
                return {
                    canplay:true
                }
            },()=>{
                const {subscription} = this.state
                if(subscription){
                    this.play()
                    this.setState({
                        subscription:false
                    })

                }
            })
        })
        audio.addEventListener('abort',()=>{

            this.setState({
                canplay:false
            })
        })
        audio.addEventListener('error',err=>{
            console.error('播放音乐时出错',err)
        })

        audio.addEventListener('pause',()=>{
            clearInterval(this.interval_index)
            this.interval_index = null
        })

        audio.addEventListener('ended',()=>{
            this.next()
        })

        audio.crossOrigin = "anonymous"
        const source = ctx.createMediaElementSource(audio)
        this.source = source
        const gain = ctx.createGain()
        source.connect(gain)
        gain.connect(ctx.destination)
    }


    @computed get queue(){
        return toJS(this.props.stores.MusicStore.queue)
    }

    @computed get queueArr(){
        return Object.values(this.queue)
    }

    @computed get ids(){
        return this.props.stores.MusicStore.ids
    }

    @computed get current(){
        return this.props.stores.MusicStore.cur_song
    }

    @computed get order(){
        return this.props.stores.MusicStore.order
    }

    play_order = props => {
        const {order} = props
        const {props:{stores:{MusicStore}}} = this
        const arr = ['order-play','single-loop','random','list-loop']
        return <MineIcon onClick={()=>{
            MusicStore.toggle_order()
        }} type={`icon-${arr[order]}`} />
    }

    menu = [{
        label:'从播放列表中移除',
        handler:()=>{
            console.log(123)
        }
    }]
    // menu = []

    getBottomMenu = data => {
        return {
            play_control:[{
                name:'下一首播放'
            }],
            account:[{
                name:'收藏',
                disabled:true
            },{
                name:'评论'
            },{
                name:'下载',
                handler:()=>{
                    message.info(`下载${data.name}`)
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


    play_list = props => {

        const {queue,ids} = this

        return (
            <div className={cs('lay-play-list',{show:this.state.show_list})}>

                <div className="top">
                    <span>
                        播放列表
                    </span>

                    <div className="close" onClick={()=>{
                        this.setState({
                            show_list:false
                        })
                    }}>
                        <MineIcon type="icon-close" />
                    </div>

                </div>

                <div className="list-wrap">

                    <div className="container">

                        {
                            ids && ids.map((id,index)=>{
                                const el = queue[id]
                                return (
                                    <DrawerMenu zIndex={70} key={index}  menu={this.getBottomMenu(el)}>
                                        <section className={cs('song-item',{playing:this.song_id===el.id})} key={index} onDoubleClick={()=>{
                                            // this.props.stores.MusicStore.play(index)
                                            this.props.stores.MusicStore.toggleSong(el.id).catch(err=>{
                                                message.error(err.message || err)
                                            })
                                        }}>
                                            <Icon type="caret-right" className="playing-icon" />
                                            <span className="name overflow">
                                                {el.name}
                                            </span>

                                            <span className="singer overflow">
                                                {el.ar.map(e=>e.name).join('/')}
                                            </span>

                                            <span className="duration">
                                                {dayjs(el.dt).format('mm:ss')}
                                            </span>
                                        </section>
                                    </DrawerMenu>
                                )
                            })
                        }

                    </div>

                </div>


            </div>
        )
    }

    toggle_play_list = () => {
        this.setState(({show_list})=>{
            return {
                show_list:!show_list
            }
        })
    }

    mask = () => {
        return this.state.show_list?(
            <div
                className="close-mask"
                onClick={e=>{
                    e.preventDefault()
                    e.stopPropagation()
                    this.toggle_play_list()
                }}
                onContextMenu={e=>{
                    e.preventDefault()
                }}
            >

            </div>
        ):null
    }

    checkQueueEmpty(show_message=true,callback=function(){}){
        if(this.ids.length===0) {
            this.resetProgress(()=>{
                if(isFunction(callback)) callback()
            })

            if(show_message) message.info('播放队列空')

            return true
        }
        return false
    }

    @computed get ctx_running(){
        return this.audio_ctx.state==='running'
    }

    interval_index = null
    play = () => {
        const {audio,audio_ctx:ctx} = this
        // console.log(audio,[audio])
        if(this.checkQueueEmpty()) return;
        if(!this.state.canplay || !this.audio.src) return;

        if(!audio.currentTime) ctx.resume()
        ctx.resume().then(()=>{
            return this.audio.play()
        }).then(()=>{
            this.setState({
                paused:this.audio.paused
            })
            this.interval_index = setInterval(()=>{
                this.setState(({progress})=>{
                    // progress += 1/this.audio.duration
                    progress = this.audio.currentTime/this.audio.duration
                    if(progress>1) progress = 1
                    return {
                        progress
                    }
                })
            },300)
        }).catch(err=>{
            this.resetProgress()
            console.error(err)
        })

    }

    pause = () => {
        const {audio_ctx:ctx} = this
        clearInterval(this.interval_index)
        this.interval_index = null
        ctx.suspend().then(()=>{
            return this.audio.pause()
        }).then(()=>{
            this.setState({
                paused:this.audio.paused
            })
        }).catch(err=>{
            console.error(err)
        })


    }

    resetProgress = callback => {
        this.pause()
        if(this.interval_index){
            clearInterval(this.interval_index)
            this.interval_index = null
        }
        this.audio.currentTime = 0
        this.setState({
            progress:0
        },isFunction(callback)?callback:function(){})
    }

    getUrl = id =>  {
        return API.fetch('CHECK_MUSIC', {id}).then(({success, message}) => {
            if (!success) return Promise.reject(message)
            return API.fetch('SONG_URL', {id})
        }).then(result => {
            if (result.data.length > 0) return Promise.resolve(result.data[0])
            return Promise.reject('获取歌曲失败')
        }).catch(err=>{
            return Promise.reject(err.message || err)
        })
    }

    @computed get song_id(){
        return this.props.stores.MusicStore.cur_song
    }

    prev = () => {
        const {audio_ctx:ctx} = this
        if(this.checkQueueEmpty()) return;
        this.setState({
            canplay:false,
            subscription:true
        })
        ctx.suspend().then(()=>{
            return this.pause()
        }).catch(err=>{
            console.error('播放上一首一首失败：',err)
        })
        const {MusicStore} = this.props.stores
        // const result = MusicStore.play_prev()
        const result = MusicStore.play_queue_control(false)
        if(result instanceof Error){
            message.error(result.message)
            return;
        }
        if(isString(result)){
            message.error(result)
            return;
        }

        MusicStore.toggleSong(result.id).catch(err=>{
            message.error(err.message || err)
        })
    }

    next = () => {
        const {audio_ctx:ctx} = this
        if(this.checkQueueEmpty()) return;
        this.setState({
            canplay:false,
            subscription:true
        })
        ctx.suspend().then(()=>{
            return this.pause()
        }).catch(err=>{
            console.error('播放下一首失败：',err)
        })
        // this.resetProgress()
        const {MusicStore} = this.props.stores
        const result = MusicStore.play_queue_control(true)
        if(result instanceof Error){
            message.error(result.message)
            return;
        }
        if(isString(result)){
            message.error(result)
            return;
        }

        MusicStore.toggleSong(result.id).catch(err=>{
            message.error(err.message || err)
        })
    }

    play_music(url){
        if(!this.state.paused) this.pause()
        this.setAudioUrl(url)
        this.play()
    }

    render(){
        const {props,ids,queue,current,state,play_order:PlayOrder,play_list:PlayList,mask:Mask} = this
        const {paused,progress,canplay} = state
        // const {MusicStore} = props.stores
        return props.show?(
            <div className={cs('wy-player',props.className)} style={Object.assign({},props.style)}>


                <PlayList/>


                <Mask/>

                <div className="song-image">
                    {
                        ids.length===0 || current===null?<MineIcon type="icon-music" style={{color:'#fff'}} />: <img src={queue[current].al.picUrl} />
                    }
                </div>

                <div className="right">

                    <div className="left-control">
                        <Icon type="step-backward" className="prev" onClick={this.prev} />

                        {
                            paused?(
                                <Icon type="caret-right" className={cs('play',{
                                    'not-allow-play':!canplay
                                })} onClick={this.play} />
                            ):(
                                <MineIcon type="icon-paused" className="play" onClick={this.pause} />
                            )
                        }


                        <Icon type="step-forward" className="next" onClick={this.next} />
                    </div>

                    <div className="progress-wrapper">

                        <Progress progress={progress} onChange={value=>{
                            if(this.checkQueueEmpty()) return;
                            // console.log(value,this.audio.duration)
                            this.audio.currentTime = (this.audio.duration || 0)*value
                            if(this.state.paused) this.play()
                            this.setState({
                                progress:value
                            })
                        }} />

                    </div>

                    <div className="right-control">

                        <span className="mini-control">
                            <PlayOrder order={this.order} />
                        </span>

                        <span className="mini-control play-list" onClick={this.toggle_play_list}>
                            <MineIcon type="icon-music-play-list" />
                            <span className="count">
                                {ids.length}
                            </span>
                        </span>

                    </div>

                </div>

            </div>
        ):null
    }
}

export default Player