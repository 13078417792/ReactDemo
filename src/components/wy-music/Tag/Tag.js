import React, { Component } from 'react'
import PropTypes from 'prop-types'
import './TagStyle.less'
import { computed } from 'mobx'
import { mapValues } from 'lodash'
import cs from 'classnames'

class Tag extends Component {

    static propTypes = {
        color: PropTypes.string,
        font_color: PropTypes.string,
        label: PropTypes.string.isRequired,
        className: PropTypes.string,
        style: PropTypes.object
    }

    static defaultProps = {
        color: '#CACACB',
        font_color: '#000',
        label: '',
        className: '',
        style: {}
    }

    @computed get event() {
        const { props } = this
        let event = {}
        mapValues(props, function (func, name) {
            if (name.indexOf('on') === 0) event[name] = func
        })

        return event
    }

    render() {
        const { style, className } = this.props
        return (
            <span className={cs('wy-tag', className)} style={style} {...this.event}>
                {this.props.label}
            </span>
        )
    }
}

export default Tag