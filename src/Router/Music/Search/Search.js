import React,{Component} from 'react'
import PropTypes from 'prop-types'
import {withRouter} from 'react-router-dom'
import {inject,observer} from 'mobx-react'
import SearchInput from '@components/wy-music/Search/Search'
import "./SearchStyle.less"
import API from '@util/CloudMusicAPI'
import { message } from 'antd'
import Helper from '@util/Helper'
import Tag from '@components/wy-music/Tag/Tag'
import Section from '@components/wy-music/Section/Section'


const { handleErrorMsg } = Helper
@inject('stores') @observer
class Search extends Component {

    static propTypes = {
        match: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired
    }

    state = {
        keywords:'',
        hots:[]
    }

    componentDidMount(){
        this.get_hot()
    }

    get_hot = () => {
        API.fetch('HOT_SEARCH').then(({ result: { hots } }) => {
            this.setState({
                hots
            })
            return Promise.resolve(hots)
        }).catch(err => {
            message.error(handleErrorMsg(err))
        })
    }

    onCheckedTag = label => {
        console.log(label)
    }

    render(){
        const {state} = this
        const {keywords,hots} = state
        return (
            <div className="search-page common-detail">

                <SearchInput
                    className="search"
                    // disabledSuggestList
                    value={keywords}
                    placeholder="搜索音乐、歌手、歌词、用户"
                    onChange={value=>{
                        console.log(value)
                        this.setState({
                            keywords:value
                        })
                    }}
                />

                <div className="help">

                    <div className="wrap">

                        <div className="part-section">
                            <Section title="热门搜索">

                                {
                                    hots.map((el,index)=>{
                                        return <Tag label={el.first} key={index} onClick={this.onCheckedTag.bind(null,el.first)} />
                                    })
                                }

                            </Section>
                        </div>

                        <div className="part-section">
                            <Section title="搜索历史" />
                        </div>


                    </div>
                </div>

            </div>
        )
    }
}


export default withRouter(Search)