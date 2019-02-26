import React,{Component} from 'react'
import {withRouter,Link} from 'react-router-dom'
import PropTypes from 'prop-types'
import {inject} from 'mobx-react'
import './RecommendStyle.less'
import API from '@util/CloudMusicAPI'
import Section from '@components/wy-music/Section/Section'
import MineIcon from '@components/MineIcon'
import cs from 'classnames'
import {Icon} from 'antd'

@inject("stores")
class Recommend extends Component {

    static propTypes = {
        match: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired
    }

    state = {
        personalized:[],
        private_content:[],
        new_song:[],
        mv:[],
        dj_program:[]
    }

    constructor(props){
        super(props)
        this.get_personalized()
        this.get_private_content()
        this.get_newsong()
        this.get_mv()
        this.get_di_program()
    }

    get_personalized(){
        API.fetch('personalized',{limit:10}).then(({result})=>{
            this.setState({
                personalized:result
            })
        })
    }

    get_private_content(){
        API.fetch('PERSONALIZED_PRIVATE_CONTENT',{limit:5}).then(({result})=>{
            this.setState({
                private_content:result
            })
        })
    }

    get_newsong(){
        API.fetch('PERSONALIZED_NEW_SONG',{limit:10}).then(({result})=>{
            this.setState({
                new_song:result
            })
        })
    }

    get_mv(){
        API.fetch('PERSONALIZED_MV',{limit:5}).then(({result})=>{
            this.setState({
                mv:result
            })
        })

    }

    get_di_program(){
        API.fetch('PERSONALIZED_DJ_PROGRAM',{limit:6}).then(({result})=>{
            this.setState({
                dj_program:result
            })
        })
    }

    recommend_song_list = props => {
        const {state:{personalized}} = this
        return (
            <div className="person-song-list ty-container">


                <div className="wrap cl">
                    {
                        personalized.map((el,index)=>{
                            return (
                                <Link to={`/music/song-list-detail/${el.id}`} key={index}>
                                    <div className="item" key={index}>

                                        <div className="block">
                                            <img src={el.picUrl} alt={el.name} />
                                            <p className="overflow">
                                                {el.name}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })
                    }
                </div>


            </div>
        )
    }

    render(){
        const {recommend_song_list:RecommendSongList} = this
        const {private_content,new_song,mv,dj_program} = this.state
        return (
            <div className="recommend w1024">

                {/* 推荐歌单 */}
                <Section icon={<MineIcon type="icon-recommend"/>} title="推荐歌单" className="mrg section-recommend-song" more="/songlist">
                    <RecommendSongList />
                </Section>

                {/* 独家放送 */}
                <Section icon={<MineIcon type="icon-music"/>} title="独家放送" className="mrg section-private-content" more="/songlist">

                    <div className="private-content">

                        <div className="wrap cl">
                            {
                                private_content.map((el,index)=>{
                                    return (
                                        <div className="item" key={index}>

                                            <img src={el.picUrl} alt={el.name} />
                                            <p className="overflow">
                                                {el.name}
                                            </p>
                                        </div>
                                    )
                                })
                            }
                        </div>

                    </div>

                </Section>

                {/* 最新音乐 */}
                <Section icon={<MineIcon type="icon-newest" />}  className="mrg section-newest" title="最新音乐" >

                    <div className="newest cl">
                        {
                            new_song.map((el,index)=>{
                                return (
                                    <div className={cs('song-item','cl')} key={index}>
                                        <span className={'index'}>
                                            {`0${index+1}`.slice(-2)}
                                        </span>

                                        <div className="right">
                                            <img src={el.song.album.picUrl} alt=""/>

                                            <div className="info">
                                                <p className="name overflow">
                                                    <span>{el.name}</span>
                                                    {
                                                        el.song.alias.length?(
                                                            <span className="alias">
                                                                ({el.song.alias[0]})
                                                            </span>
                                                        ):null
                                                    }

                                                </p>

                                                <p className="singer">
                                                    {
                                                        el.song.privilege.maxbr===999000?(
                                                            <MineIcon type="icon-sq" style={{
                                                                display:'inline',
                                                                verticalAlign:'middle',
                                                                fontSize:'1.4em',
                                                                marginRight:'5px'
                                                            }} />
                                                        ):null
                                                    }
                                                    {el.song.artists.map(el=>el.name).join('/').replace(/\/$/,'')}
                                                </p>
                                            </div>
                                        </div>

                                    </div>
                                )
                            })
                        }
                    </div>



                </Section>

                {/* 推荐MV */}
                <Section icon={<MineIcon type="icon-mv" />} title="推荐MV" className="mrg section-mv" >

                    <div className="mv">

                        <div className="wrap cl">

                            {
                                mv.map((el,index)=>{
                                    return (
                                        <div className="item" key={index}>

                                            <img src={el.picUrl} alt={el.name} />

                                            <p className="name overflow">{el.name}</p>
                                            <p className="singer overflow">{el.artists.map(el=>el.name).join('/').replace(/\/$/,'')}</p>

                                        </div>
                                    )
                                })
                            }

                        </div>

                    </div>

                </Section>


                {/* 主播电台 */}
                <Section icon={<MineIcon type="icon-radio" />} title="主播电台" className={"mrg section-dj-program"}  >

                    <div className="dj-program cl">

                        {
                            dj_program.map((el,index)=>{
                                return (
                                    <div className="dj-item cl" key={index}>
                                        <div className={'img'}>
                                            <img src={el.picUrl} alt={el.name} />

                                            <div className="play">
                                                <Icon type="caret-right" />
                                            </div>
                                        </div>


                                        <div className="info">
                                            <p className="name overflow"><span>{el.name}</span></p>
                                            <p className="singer overflow"><span>{el.program.radio.name}</span></p>
                                        </div>
                                    </div>
                                )
                            })
                        }


                    </div>

                </Section>


            </div>
        )
    }
}



export default withRouter(Recommend)