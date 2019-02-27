import './SectionStyle.less'
import React, { Component, cloneElement, Fragment } from 'react'
import PropTypes from 'prop-types'
import cs from 'classnames'
import { Link } from 'react-router-dom'

class Section extends Component {

    static propTypes = {
        title: PropTypes.string.isRequired,
        icon: PropTypes.element,
        more: PropTypes.string,
        className: PropTypes.string,
        suffix: PropTypes.element,
        color: PropTypes.string
    }

    static defaultProps = {
        more: '',
        className: '',
        icon: null,
        suffix: null,
        color: null
    }

    Icon = (props) => {
        const { icon } = this.props
        return icon ? cloneElement(icon, props) : null
    }

    RightPart = props => {
        const { suffix, more } = this.props
        return (
            <Fragment>

                <div className="suffix">
                    {more ? <Link className="more" to={more}>更多></Link> : null}
                    {suffix}
                </div>

            </Fragment>
        )
    }

    render() {
        const { props: { title, className, more, children, color }, Icon, RightPart } = this
        return (
            <div className={cs('music-section', className)}>

                <div className="description-title" style={{
                    color, borderColor: color
                }}>

                    <Icon className="icon" />
                    <span>{title}</span>


                    <RightPart />

                </div>

                {children}

            </div>
        )
    }
}

export default Section