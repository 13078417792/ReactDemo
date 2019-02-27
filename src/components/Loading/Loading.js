import React, { Component } from 'react'
import './LoadingStyle.less'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { computed } from 'mobx'

@observer
class Loading extends Component {

    static propTypes = {
        style: PropTypes.object,
        className: PropTypes.string,
        size: PropTypes.number,
        border: PropTypes.number,
        color: PropTypes.string,
        position: PropTypes.string
    }

    static defaultProps = {
        style: {},
        className: '',
        size: 50,
        border: 3,
        color: '#e2e2e2',
        sec_color: '#b0b0b0',
        position: ''
    }

    constructor(props) {
        super(props)
        this.container = React.createRef()
        this.parent = React.createRef()
        this.child = React.createRef()
        // const size = 50
        // const border = 3
        this.state = {
            width: 0,
            height: 0,
            // size,
            // border,
            radius: (props.size + props.border * 2) / 2
        }
    }



    componentDidMount() {
        this.setState({
            width: this.container.clientWidth,
            height: this.container.clientHeight
        })
        this.drawOuterCircle.call(this)
        this.drawInnerCircle.call(this)
    }

    // 外圆
    drawOuterCircle() {
        const { state: { radius }, props: { size, border, color }, parent: { current: parent } } = this

        const ctx = parent.getContext('2d')
        ctx.beginPath()
        ctx.strokeStyle = color
        ctx.lineWidth = border
        ctx.arc(radius, radius, size / 2, 0, Math.PI * 2)
        ctx.stroke()
        ctx.closePath()
    }

    // 内圆圆弧
    drawInnerCircle() {
        const { state: { radius }, props: { size, border, sec_color }, child: { current: child } } = this
        const ctx = child.getContext('2d')
        ctx.beginPath()
        ctx.strokeStyle = sec_color
        ctx.lineWidth = border
        ctx.arc(radius, radius, size / 2, Math.PI / 180 * -20, Math.PI / 180 * -90, true)
        ctx.stroke()
        ctx.closePath()
    }

    @computed get style() {
        const { props } = this
        const { style, position } = props
        let mine = {}
        // if (['fixed', 'absolute', 'inherit', 'unset', 'sticky', 'relative', 'static'].includes(position)) {
        //     mine.position = position
        // }
        if (!!position) {
            mine.position = position
        }
        return Object.assign({}, style, mine)
    }

    render() {
        const { props: { size, border }, style } = this
        return (
            <div className="loading-middleware" style={style}>

                <div className="container" ref={this.container} style={{
                    width: `${size + border * 2}px`,
                    height: `${size + border * 2}px`
                }}>

                    <canvas ref={this.parent} className={"parent"} width={`${size + border * 2}px`} height={`${size + border * 2}px`}>

                    </canvas>

                    <canvas ref={this.child} className={"child"} width={`${size + border * 2}px`} height={`${size + border * 2}px`}>

                    </canvas>

                </div>

            </div>
        )
    }
}

export default Loading;