import React, { Component, Fragment } from 'react'
import cs from 'classnames'
import PropTypes from 'prop-types'
import { observer, inject } from 'mobx-react'
import './CommentStyle.less'
import API from '@util/CloudMusicAPI'
import { computed } from 'mobx'
import { message } from 'antd'
import { isEmpty } from 'lodash'
import Helper from '@util/Helper'
import Comment from '@components/wy-music/Comment/Comment'
// import Loading from '@components/Loading/Loading'
import Loading from '@components/wy-music/Loading'

const { handleErrorMsg } = Helper

@inject('stores') @observer
class PlayList extends Component {


    static propTypes = {
        total: PropTypes.number,
        type: PropTypes.oneOf([
            'playlist', 'music'
        ]).isRequired,
        id: PropTypes.number.isRequired,
        // avatar:PropTypes.string.isRequired
    }

    static defaultProps = {
        id: 0,
        type: 'music'
    }

    state = {
        info: {},
        total: 0,
        fetching: true
    }

    constructor(props) {
        super(props)
        this.fetch_info().then(() => {
            this.setState({
                fetching: false
            })
        }).catch(err => {
            message.error(err)
        })
    }

    @computed get api() {
        const api = {
            playlist: 'PLAYLIST_DETAIL',
            music: 'SONG_DETAIL'
        }
        return api[this.props.type] || ''
    }

    @computed get avatar() {
        const { type, id } = this.props
        const { info } = this.state
        // console.log(id, info)
        if (isEmpty(info)) return ''
        if (type === 'playlist') return info.playlist.coverImgUrl
        if (type === 'music') return info.al.picUrl
        return '';
    }

    @computed get name() {
        const { type } = this.props
        const { info } = this.state
        if (isEmpty(info)) return ''
        if (type === 'playlist') return info.playlist.name
        if (type === 'music') return info.name
        return '';
    }

    componentDidCatch(err) {
        message.error(Helper.handleErrorMsg(err))
    }

    // 获取歌单/歌曲/mv详情
    fetch_info = () => {
        const { type, id } = this.props
        const { api } = this
        const params = {}
        if (type === 'music') {
            params.ids = id
        } else {
            params.id = id
        }
        return API.fetch(api, params).then(result => {
            if (result.code !== 200) {
                return Promise.reject(handleErrorMsg(result))
            }
            this.setState(() => {
                return {
                    info: (function (data) {
                        if (type === 'music') {
                            if (data.songs.length === 0) throw new Error('歌曲不存在')
                            return data.songs[0]
                        }
                        if (type === 'playlist') return data
                        return {}
                    })(result)
                }
            }, () => {
                return Promise.resolve(this.state.info)
            })
        }).catch(err => {
            return Promise.reject(handleErrorMsg(err))
        })
    }

    // 歌单来源
    PlayListFrom = props => {
        const { Info, state } = this
        return (
            <Info className="playlist-info-from">

                <p className="by desc">
                    by <span>{isEmpty(state.info) ? '' : state.info.playlist.creator.nickname}</span>
                </p>
            </Info>
        )
    }

    MusicFrom = props => {
        const { Info, state: { info } } = this
        // const song = info.songs[0]
        return (
            <Info className="playlist-info-from">

                <p className="desc album">
                    专辑：{info.al.name}
                </p>

                <p className="desc singer">
                    歌手：{info.ar.map(el => el.name).join('/')}
                </p>
            </Info>
        )
    }

    Info = props => {
        const { Name } = this
        return (
            <div className={cs('info-from', props.className || "")}>
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

    render() {
        const { props, avatar, PlayListFrom, MusicFrom, state } = this
        const { type } = props
        return (
            <div className={cs('comment', `${type}-comment`)}>


                <h3 className="total">
                    评论<span className="num">({state.total})</span>
                </h3>

                <div className="info">

                    {
                        state.fetching ? (
                            // <Loading size={35} border={2} color={'#e4bbbb'} sec_color={'#C72E2E'} style={{
                            //     position: 'unset',
                            //     width: '100%',
                            //     height: '100%'
                            // }} />
                            <Loading position="unset" style={{
                                width: '100%',
                                height: '100%'
                            }} />
                        ) : (
                                <Fragment>
                                    <div className="avatar">
                                        {
                                            !!avatar ? (
                                                <img src={avatar} />
                                            ) : null
                                        }
                                    </div>

                                    <div className="right">

                                        {
                                            type === 'playlist' ? <PlayListFrom /> : (
                                                type === 'music' ? <MusicFrom /> : null
                                            )
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
                        onFetch={({ total }) => {
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