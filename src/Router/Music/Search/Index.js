import React, { Component } from 'react'
import Section from '@components/wy-music/Section/Section'
import './indexStyle.less'
import Tag from '@components/wy-music/Tag/Tag'
import API from '@util/CloudMusicAPI'
import { message } from 'antd'
import Helper from '@util/Helper'
import { Icon } from 'antd'
import PropTypes from 'prop-types'

const { handleErrorMsg } = Helper

class Index extends Component {

    static propTypes = {
        onCheckedHotSearch: PropTypes.func
    }

    state = {
        hots: [],
        onCheckedHotSearch: function () { }
    }

    constructor(props) {
        super(props)
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

    render() {
        const { state, props } = this
        const { hots } = state
        return (
            <div className="search-page-index">

                <div className="wrap">

                    {/* 热搜 */}
                    <div className="index-section">

                        <Section
                            className="hot-search"
                            title="热门搜索"
                        >
                            {
                                hots.map((el, index) => {
                                    return <Tag className="hot-search-label" label={el.first} key={index} onClick={e => {
                                        e.preventDefault()
                                        e.stopPropagation()

                                        // 触发事件
                                        props.onCheckedHotSearch(el.first)
                                    }} />
                                })
                            }
                        </Section>
                    </div>

                    {/* 搜索历史 */}
                    <div className="index-section">

                        <Section
                            className="search-history"
                            title="搜索历史"
                            suffix={
                                <Icon type="delete" className="delete-icon" />
                            }
                        >

                        </Section>
                    </div>


                </div>

            </div>
        )
    }
}

export default Index