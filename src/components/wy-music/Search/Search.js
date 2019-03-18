import React from 'react'
import "./SearchInputStyle.less"
import PropTypes from 'prop-types'
import cs from 'classnames'
import API from '@util/CloudMusicAPI'
import Helper from '@util/Helper'
import { message, Icon } from 'antd'
import { isFunction, isBoolean } from 'lodash'
import Loading from '@components/Loading/Loading'
import { computed } from 'mobx'

const { handleErrorMsg } = Helper

class SearchInput extends React.Component {

    static propTypes = {
        className: PropTypes.string,
        style: PropTypes.object,
        placeholder: PropTypes.string,
        onChange: PropTypes.func,
        disabledSuggestList: PropTypes.bool
    }

    static defaultProps = {
        className: '',
        style: {},
        placeholder: '',
        onChange: function () { },
        disabledSuggestList: false
    }

    state = {
        value: '',
        showSuggestList: false,
        suggestting: null,
        hots: [],
        suggest: []
    }

    @computed get disabledSuggestList() {
        const { disabledSuggestList } = this.props
        if (!isBoolean(disabledSuggestList)) return true
        return disabledSuggestList
    }

    onChange = ({ target: { value } }) => {
        const { onChange } = this.props
        this.setState({
            suggest: [],
            suggestting: null
        })
        onChange(value)
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.value !== prevState.value) {
            return {
                value: nextProps.value
            }
        }
        return null
    }

    getSnapshotBeforeUpdate(prevProps, prevState) {
        const { state } = this
        if (prevState.value !== state.value) {
            this.fetch()
            return {
                showSuggestList: !!state.value
            }
        }
        return null
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const { state } = this
        if (snapshot) {
            if (snapshot.hasOwnProperty('showSuggestList')) {
                this.setState({
                    showSuggestList: snapshot.showSuggestList
                })
            }
        }
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

    fetch_timeout = null
    fetch = () => {
        const { disabledSuggestList } = this
        if (disabledSuggestList) return;
        if (this.fetch_timeout) {
            clearTimeout(this.fetch_timeout)
            this.fetch_timeout = null
        }
        this.fetch_timeout = setTimeout(() => {
            this.get_suggest()
        }, 300)
    }

    get_suggest() {
        const { disabledSuggestList } = this
        const { value: keywords } = this.state
        if (disabledSuggestList) return;
        if (!keywords) return;
        this.setState({
            suggestting: true
        })
        API.fetch('SEARCH_SUGGEST', {
            keywords, type: 'mobile'
        }).then(({ result: { allMatch: suggest } }) => {
            this.setState({
                suggest: suggest || [],
                suggestting: false
            })
            return Promise.resolve(suggest)
        }).catch(err => {
            this.setState({
                suggestting: false
            })
            message.error(handleErrorMsg(err))
        })

    }

    Suggest = () => {
        const { state, disabledSuggestList } = this
        const { value: keywords, showSuggestList, hots, suggestting, suggest } = state
        return !disabledSuggestList && showSuggestList ? (
            <ul className="suggest-list">
                <li className="keywords">
                    搜索"{keywords}"
                </li>

                {
                    suggest.map((el, index) => {
                        return (
                            <li key={index}>
                                {el.keyword}
                            </li>
                        )
                    })
                }

                {
                    suggestting ? (
                        <li className="loading">
                            <Loading size={20} border={2} position="static" style={{
                                height: '100%',
                                width: '100%'
                            }} />
                        </li>
                    ) : null
                }

                {
                    suggestting === false && suggest.length === 0 ? (
                        <li className="last">无搜索建议</li>
                    ) : null
                }

            </ul>
        ) : null
    }

    render() {
        const { props, state, Suggest } = this
        const { className, style, placeholder } = props
        const { value } = state
        return (
            <div className={cs('wy-search-input', className)}>

                <input type="text" className="input" placeholder={placeholder} onChange={this.onChange} value={value} onFocus={() => {
                    if (!value) return;
                    this.setState({
                        showSuggestList: true
                    })
                }} onBlur={() => {
                    this.setState({
                        showSuggestList: false
                    })
                }} />

                <div className="button-wrap">


                    <button className="search-btn">
                        <Icon type="search" />
                    </button>

                    {
                        !!value ? (
                            <button className="close-btn" onClick={() => {
                                this.props.onChange('')
                            }}>
                                <Icon type="close" />
                            </button>
                        ) : null
                    }



                </div>

                <Suggest />
            </div>
        )
    }

}

export default SearchInput