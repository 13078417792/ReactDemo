import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'
import './SearchStyle.less'
import { computed } from 'mobx'
import { isBoolean, mapValues, isEmpty } from 'lodash'
import cs from 'classnames'
import { Icon, message } from 'antd'
import API from '@util/CloudMusicAPI'
import Helper from '@util/Helper'
import Loading from '@components/Loading/Loading'

const { API: url } = API
const { handleErrorMsg } = Helper
@inject('stores') @observer
class Search extends Component {

    static propTypes = {
        radius: PropTypes.bool,
        className: PropTypes.string,
        style: PropTypes.object,
        inline: PropTypes.bool,
        placeholder: PropTypes.string,
        keywrods: PropTypes.string,
        onFetchSuggestSuccess: PropTypes.func,
        onChange: PropTypes.func,
        // suggest_api: PropTypes.string,
        // api: PropTypes.string
    }

    static defaultProps = {
        radius: false,
        className: '',
        style: {},
        inline: false,
        placeholder: '',
        keywrods: '',
        onFetchSuggestSuccess: function () { },
        onChange: function () { }
        // suggest_api: url.SEARCH_SUGGEST,
        // api: url.SEARCH
    }

    state = {
        keywords: '',
        showSuggest: false,
        suggest: [],
        suggestting: false,

    }

    @computed get is_radius() {
        const { radius } = this.props
        return isBoolean(radius) ? radius : true
    }

    @computed get event() {
        const { props } = this
        let event = {}
        mapValues(props, (func, name) => {
            if (name.indexOf('on') === 0) {
                event[name] = func
            }
        })
        return event
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        console.log(prevState, nextProps)
        if (prevState.keywords !== nextProps.keywords && prevState.keywords !== null) {
            return {
                keywords: nextProps.keywords
            }
        }
        return null;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const { state } = this
        console.log(state, state.keywords, prevState.keywords)
        if (state.keywords !== prevState.keywords && !!state.keywords) {
            console.log(state.keywords)
            document.addEventListener('mousedown', this.toggleSuggest)
            this.fetch_suggest(state.keywords)
        }
    }

    onChange = ({ target: { value: keywords } }) => {
        this.setState({
            // keywords,
            showSuggest: !!keywords,
            suggest: [],
            suggestting: !!keywords
        })
        this.props.onChange(keywords)

    }

    toggleSuggest = () => {
        this.setState(({ keywords, showSuggest }) => {
            if (!keywords) {
                return;
            }
            if (!showSuggest === false) {
                document.removeEventListener('mousedown', this.toggleSuggest)
            } else {
                document.addEventListener('mousedown', this.toggleSuggest)
            }

            return {
                showSuggest: !showSuggest
            }
        })
    }

    clearKeywords = () => {
        this.setState({
            // keywords: '',
            suggest: []
        })
        this.props.onChange('')
    }

    suggest_timeout = null
    fetch_suggest(keywords) {
        if (this.suggest_timeout) {
            clearTimeout(this.suggest_timeout)
            this.suggest_timeout = null
        }
        this.suggest_timeout = setTimeout(() => {
            API.fetch('SEARCH_SUGGEST', {
                keywords,
                type: 'mobile'
            }).then(({ result }) => {
                const { onFetchSuggestSuccess } = this.props
                let suggest = []
                if (!isEmpty(result) && Array.isArray(result.allMatch)) {
                    suggest = result.allMatch
                }

                this.setState({
                    showSuggest: true,
                    suggest,
                    suggestting: false
                }, onFetchSuggestSuccess.bind(null, suggest))
            }).catch(err => {
                this.setState({
                    suggestting: false,
                    showSuggest: true,
                })
                message.error(handleErrorMsg(err, '请求数据失败'))
            })
        }, 350)
    }

    Suggest = props => {
        const { state } = this
        const { keywords, suggest, suggestting, showSuggest } = state
        return showSuggest && keywords ? (
            <ul className="search-suggest" onMouseDown={e => {
                const { nativeEvent } = e
                nativeEvent.stopImmediatePropagation()
            }}>
                <li className="keywords overflow">
                    搜索"{keywords}"
                    </li>

                {
                    suggestting ? (
                        <li className="loading">
                            <Loading size={15} boder={1} style={{
                                position: 'unset',
                                height: 'auto',
                                width: '100%'
                            }} />
                        </li>
                    ) : null
                }


                {
                    suggest.length ? (
                        suggest.map((el, index) => {
                            return (
                                <li className="overflow" key={index} >
                                    {el.keyword}
                                </li>
                            )

                        })
                    ) : suggestting ? null : <li className="none overflow">无搜索建议</li>
                }
            </ul>
        ) : null
    }

    render() {
        const { is_radius, event, props, state, Suggest } = this
        const { inline, placeholder, className } = props
        const { keywords } = state
        return (
            <div className={cs('search-component', className, {
                radius: is_radius,
                inline: inline
            })} onMouseDown={e => {
                const { nativeEvent } = e
                nativeEvent.stopImmediatePropagation()
            }}>

                <input type="text" className="search-input" placeholder={placeholder} onChange={this.onChange} value={keywords} onFocus={this.toggleSuggest} />


                <Icon type="search" className="search-icon icon" />

                {keywords ? <Icon type="close" className="icon close-icon" onClick={this.clearKeywords} /> : null}


                <Suggest />
            </div>
        )
    }
}


export default Search