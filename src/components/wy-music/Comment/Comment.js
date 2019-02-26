import React,{Component,Fragment} from 'react'
import cs from 'classnames'
import PropTypes from 'prop-types'
import API from '@util/CloudMusicAPI'
import {computed} from 'mobx'
import {observer,inject} from 'mobx-react'
import './CommentStyle.less'
import {message,Avatar,Icon,Pagination} from 'antd'
import Helper from '@util/Helper'
import DoubleColumn from '@components/DoubleColumn/DoubleColumn'
import dayjs from 'dayjs'
import Loading from '@components/Loading/Loading'

@inject('stores') @observer
class Comment extends Component {

    static propTypes = {
        type:PropTypes.oneOf([
            'playlist','music'
        ]).isRequired,
        id:PropTypes.number.isRequired,
        api:PropTypes.string,
        params:PropTypes.object,
        count:PropTypes.number,
        onFetch:PropTypes.func
    }

    static defaultProps = {
        api:'',
        id:0,
        params:{},
        count:20,
        onFetch:function(){}
    }

    state = {
        current_page:1,
        page:1,
        hotComments:[],
        comments:[],
        total:0,
        fetching:true,
    }

    constructor(props){
        super(props)
        this.fetch().then(({hotComments,comments,total})=>{
            const page = Math.ceil(total/props.count)
            this.setState({
                page,
                hotComments,comments,total,
                fetching:false
            })
            props.onFetch({hotComments,comments,total})
        }).catch(err=>{
            message.error(Helper.handleErrorMsg(err))
            this.setState({
                fetching:false
            })
        })
    }

    @computed get params(){
        let {params,id,count} = this.props
        params.id = id
        params.limit = count
        return params
    }

    @computed get api(){
        if(this.props.api) return this.props.api
        const api = {
            playlist:'COMMENT_PLAYLIST',
            music:'COMMENT_MUSIC'
        }
        return api[this.props.type]
    }

    fetch(){
        const {params,api,props:{count},state:{current_page}} = this
        let query = Object.assign({},params,{
            offset:(current_page-1)*count
        })
        return API.fetch(api,query).then(result=>{
            if(result.code!==200) return Promise.reject('请求失败')
            const {hotComments,comments,total} = result
            return Promise.resolve({
                hotComments:Array.isArray(hotComments)?hotComments:[],
                comments,
                total
            })
        }).catch(err=>{
            return Promise.reject(err);
        })
    }

    Content = props => {
        const {Content} = this
        const {reply,user,content,isReply} = props
        let hasReply = false
        return (
            <span className={cs('content-wrap')}>
                <span className="user" >
                    {!!isReply?'@':''}{user}
                </span>:&nbsp;

                {
                    reply?(
                        <Fragment>
                            回复
                            <span className="user" >
                                @{reply.user.nickname}
                            </span>:&nbsp;
                        </Fragment>
                    ):null
                }

                <span className="content">
                    {content}
                </span>
                {
                    reply?(
                        <div className="child-content">
                            <Content
                                isReply={true}
                                user={reply.user.nickname}
                                content={reply.content}
                            />
                        </div>
                    ):null
                }


            </span>
        )
    }

    CommentItemBottom = props => {
        const {time,likedCount,liked} = props
        return (
            <div className="bottom">

                <span className="time">
                    {dayjs(time).format('MM月DD日')}
                </span>

                <div className="fr">

                    {/* 点赞量 */}
                    <span className="liked">
                        <Icon className={cs('icon-like',{
                            'icon-liked':liked
                        })} type="like" />（{likedCount}）
                    </span>

                </div>

            </div>
        )
    }

    CommentItem = props => {
        const {Content,CommentItemBottom} = this
        const {user,content,time,likedCount,liked,avatar,reply} = props
        return (
            <section className="comment-item cl">

                <Avatar className={'avatar'} src={avatar} size={35} />

                <div className="right-part">
                    <Content
                        reply={Array.isArray(reply) && reply.length?reply[0]:null}
                        user={user}
                        content={content}
                    />

                    <CommentItemBottom time={time} likedCount={likedCount} liked={liked} />

                </div>

            </section>
        )
    }

    Part = props => {
        const {CommentItem} = this
        let {comments} = props
        if(!Array.isArray(comments)) comments = []
        return (
            <div className="comment-part">

                <p className="title-head">{props.title || ''}</p>


                <div className="content">

                    {
                        comments.map((el,index)=>{
                            return (
                                <CommentItem
                                    key={index}
                                    user={el.user.nickname}
                                    userId={el.user.userId}
                                    content={el.content}
                                    time={el.time}
                                    likedCount={el.likedCount}
                                    avatar={el.user.avatarUrl}
                                    liked={el.liked}
                                    reply={el.beReplied}
                                />
                            )
                        })
                    }

                </div>
            </div>
        )
    }

    onChangePage = page => {
        this.setState({
            current_page:page,
            fetching:true
        },()=>{
            this.fetch().then(({hotComments,comments,total})=>{
                this.setState({
                    page,
                    hotComments,comments,total,
                    fetching:false
                })
                this.props.onFetch({hotComments,comments,total})
            })
        })

    }

    All = () => {
        const {state,Part,props} = this
        const {hotComments:hot,comments,total,current_page} = state
        const {count} = props

        return (
            <Fragment>
                {
                    hot.length?(
                        <Part
                            title="精彩评论"
                            comments={hot}
                        />
                    ):null
                }

                {
                    comments.length?(
                        <Part title="最新评论" comments={comments} />
                    ):null
                }

                {
                    total && total>count ?(
                        <Pagination className={"page"}
                                    total={total}
                                    pageSize={count}
                                    size="small"
                                    showQuickJumper
                                    hideOnSinglePage={true}
                                    current={current_page}
                                    onChange={this.onChangePage}
                        />
                    ):null
                }
            </Fragment>
        )
    }

    render(){
        const {state,Part,All} = this
        const {fetching} = state
        return (
            <div className="comment-component">

                {
                    fetching?(
                        <Loading size={35} border={2} color={'#e4bbbb'} sec_color={'#C72E2E'} style={{
                            position:'absolute',
                            width:'100%',
                            height:'300px'
                        }} />
                    ):<All/>
                }



            </div>
        )

    }
}

export default Comment