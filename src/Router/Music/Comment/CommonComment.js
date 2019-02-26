import React,{Component,Fragment} from 'react'
import cs from 'classnames'
import PropTypes from 'prop-types'
import {observer,inject} from 'mobx-react'
import './CommentStyle.less'
import API from '@util/CloudMusicAPI'
import {computed} from 'mobx'
import {message} from 'antd'
import {isEmpty} from 'lodash'
import Helper from '@util/Helper'
import Comment from '@components/wy-music/Comment/Comment'
import Loading from '@components/Loading/Loading'

const {handleErrorMsg} = Helper

@inject('stores') @observer
class PlayList extends Component {


    static propTypes = {
        total:PropTypes.number,
        type:PropTypes.oneOf([
            'playlist','music'
        ]).isRequired,
        id:PropTypes.number.isRequired,
        // avatar:PropTypes.string.isRequired
    }

    static defaultProps = {
        id:0,
        type:'music'
    }

    state = {
        info:{},
        total:0,
        fetching:true
    }

    constructor(props){
        super(props)
        this.fetch_info().then(()=>{
            this.setState({
                fetching:false
            })
        }).catch(err=>{
            message.error(err)
        })
    }

    @computed get api(){
        const api = {
            playlist:'PLAYLIST_DETAIL',
            music:'SONG_DETAIL'
        }
        return api[this.props.type] || ''
    }

    @computed get avatar() {
        const {type} = this.props
        const {info} = this.state
        if (isEmpty(info)) return ''
        if(type==='playlist') return info.playlist.coverImgUrl
        if(type==='music') return info.songs[0].al.picUrl
        return '';
    }

    @computed get name(){
        const {type} = this.props
        const {info} = this.state
        if (isEmpty(info)) return ''
        if(type==='playlist') return info.playlist.name
        if(type==='music') return info.songs[0].name
        return '';
    }

    // 获取歌单/歌曲/mv详情
    fetch_info = () => {
        const {type,id} = this.props
        const {api} = this
        const params = {}
        if(type==='music'){
            params.ids = id
        }else{
            params.id = id
        }
        return API.fetch(api,params).then(result=>{
            if(result.code!==200){
                return Promise.reject(handleErrorMsg(result))
            }
            this.setState(()=>{
                return {
                    info:result
                }
            },()=>{
                return Promise.resolve(this.state.info)
            })
        }).catch(err=>{
            return Promise.reject(handleErrorMsg(err))
        })
    }

    // 歌单来源
    PlayListFrom = props => {
        const {Info,state} = this
        return (
            <Info className="playlist-info-from">

                <p className="by desc">
                    by <span>{isEmpty(state.info)?'':state.info.playlist.creator.nickname}</span>
                </p>
            </Info>
        )
    }

    Info = props => {
        const {Name} = this
        return (
            <div className={cs('info-from',props.className || "")}>
                <Name />
                {props.children}
            </div>
        )
    }

    Name = () => {
        return (
            <h3 className="name overflow">
                {this.name}
            </h3>
        )
    }

    render(){
        const {props,avatar,PlayListFrom,state} = this
        const {type} = props
        return (
            <div className={cs('comment',`${type}-comment`)}>


                <h3 className="total">
                    评论<span className="num">({state.total})</span>
                </h3>

                <div className="info">

                    {
                        state.fetching?(
                                <Loading size={35} border={2} color={'#e4bbbb'} sec_color={'#C72E2E'} style={{
                                    position:'unset',
                                    width:'100%',
                                    height:'100%'
                                }} />
                        ):(
                            <Fragment>
                                <div className="avatar">
                                    {
                                        !!avatar?(
                                            <img src={avatar}/>
                                        ):null
                                    }
                                </div>

                                <div className="right">

                                    {
                                        type==='playlist'?<PlayListFrom/>:null
                                    }

                                </div>
                            </Fragment>
                        )
                    }


                </div>

                <div className="comment-list">

                    <Comment
                        type={this.props.type}
                        id={this.props.id}
                        onFetch={({total})=>{
                            this.setState({
                                total
                            })
                        }}
                    />
                </div>


            </div>
        )
    }
}

export default PlayList