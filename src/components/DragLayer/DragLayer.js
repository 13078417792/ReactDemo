import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import cs from 'classnames'
import './DragLayerStyle.less'
import CommonData from '../CommonData'

const mainColor = '#ccc'
const secColor = '#0078D7'


export default class DragLayer extends Component {

    static propTypes = {
        open: PropTypes.bool,
        mask: PropTypes.bool,
        maskOpacity: PropTypes.number,
        onClose: PropTypes.func,
        width: PropTypes.string,
        height: PropTypes.string,
        title:PropTypes.string,
        disableScrollX:PropTypes.bool,
        disableScrollY:PropTypes.bool,
        zIndex:PropTypes.number,
    }

    static defaultProps = {
        open: false,
        mask: true,
        maskOpacity: .3,
        width: '250px',
        height: '130px',
        title:'新建窗口',
        onClose: function () {
        },
        disableScrollX:true,
        disableScrollY:true,
        zIndex:CommonData.dialog.add_zIndex()
    }

    // 关闭窗口的动画结束事件
    closeAnimationEnd = event => {
        const {onClose} = this.props
        this.setState({
            closeAnimation:false
        },onClose.bind(null,event))

    }

    emitClose = event => {
        event.stopPropagation()
        this.props.onClose()
        // onClose(event)
        // this.setState({
        //     closeAnimation:true
        // })
    }

    stopButtonEvent(event) {
        event.stopPropagation()
    }

    constructor(props) {
        super(props)
        this.state = {
            initPosition: {
                x: null,
                y: null
            },
            oldPosition: {
                x: 0,
                y: 0
            },
            position: {
                x: 0,
                y: 0
            },
            maxOffset: {
                left: null,
                top: null
            },
            dialogEl:null,
            // mask_zIndex:CommonData.dialog.add_zIndex(),
            // dialog_zIndex:CommonData.dialog.add_zIndex(),
            mask_zIndex:props.zIndex,
            dialog_zIndex:props.zIndex+1,
            closeAnimation:false
        }

    }

    componentDidMount() {
        window.addEventListener('resize', this.initState)
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.initState)
        // console.log('销毁dialog！')
    }

    initState = event => {
        this.setState({
            initPosition: {
                x: null,
                y: null
            },
            oldPosition: {
                x: 0,
                y: 0
            },
            position: {
                x: 0,
                y: 0
            },
            maxOffset: {
                left: null,
                top: null
            },
            dialogEl:null
        })
    }

    mask = props => {
        const parentProps = this.props
        const stop = e => {
            e.stopPropagation()
        }

        const defaultOpacity = .3
        const opacity = parentProps.maskOpacity > 1 ? defaultOpacity : (parentProps.maskOpacity < 0 ? defaultOpacity : parentProps.maskOpacity)

        return (
            <div className={cs("dialog--drag-layer--mask",{"close-animation":this.state.closeAnimation})} style={{
                backgroundColor: `rgba(0,0,0,${opacity})`,
                zIndex:this.state.mask_zIndex
            }}
                 onWheel={stop}
                 onMouseDown={stop}
                 onMouseMove={stop}
                 onMouseUp={stop}
                 onTouchStart={stop}
                 onTouchMove={stop}
                 onTouchEnd={stop}
                 onClick={stop}

                 onAnimationEnd={this.closeAnimationEnd}
            >
                {props.children}
            </div>
        )
    }


    // 拖动
    move(clientX, clientY, event) {
        this.setState(({initPosition, position, oldPosition,dialogEl}) => {

            let result = {
                position: {
                    x: clientX - initPosition.x + oldPosition.x,
                    y: clientY - initPosition.y + oldPosition.y,
                }
            }

            const target = dialogEl

            const {clientWidth: targetWidth, clientHeight: targetHeight} = target
            const {clientWidth, clientHeight} = document.body
            const maxOffsetLeft = (clientWidth - targetWidth) / 2
            const maxOffsetTop = (clientHeight - targetHeight) / 2

            // console.log(target)

            if (Math.abs(result.position.x) > maxOffsetLeft) {
                result.position.x = maxOffsetLeft * (result.position.x < 0 && result.position.x !== 0 ? -1 : 1)
            }

            if (Math.abs(result.position.y) > maxOffsetTop) {
                result.position.y = maxOffsetTop * (result.position.y < 0 && result.position.y !== 0 ? -1 : 1)
            }


            return result
        })
    }

    // 拖动开始
    moveStart(clientX, clientY) {
        document.onselect = e => false
        this.setState({
            initPosition: {
                x: clientX,
                y: clientY
            }
        })
    }

    // 拖动完成
    moveEnd() {
        document.onselect = null
        this.setState(({position}) => ({
            initPosition: {
                x: null,
                y: null
            },
            oldPosition: {
                x: position.x,
                y: position.y
            }
        }))
    }

    // PC端
    onMouseDown = event => {
        event.stopPropagation()
        this.handle_zIndexAdd()
        document.addEventListener('mousemove', this.onMouseMove)
        document.addEventListener('mouseup', this.onMouseUp)
        const {clientX, clientY,nativeEvent} = event
        this.setState({
            dialogEl:nativeEvent.path[1]
        },this.moveStart.bind(this, clientX, clientY))
    }

    onMouseMove = event => {
        event.stopPropagation()
        const {target, clientX, clientY} = event
        this.move.call(this, clientX, clientY, event)
    }

    onMouseUp = event => {
        event.stopPropagation()
        document.removeEventListener('mousemove', this.onMouseMove)
        document.removeEventListener('mouseup', this.onMouseUp)
        this.moveEnd.call(this)
    }

    // 移动端
    handleDragTouchStart = event => {
        event.stopPropagation()
        this.handle_zIndexAdd()
        document.addEventListener('touchmove', this.handleDragTouchMove)
        document.addEventListener('touchend', this.handleDragTouchEnd)
        const {touches,nativeEvent} = event
        if (touches.length !== 1) return;
        const touch = touches[0]
        const {clientX, clientY} = touch
        this.setState({
            dialogEl:nativeEvent.path[1]
        },this.moveStart.bind(this,clientX, clientY))

    }

    handleDragTouchMove = event => {
        event.stopPropagation()
        const {target, touches} = event
        const touch = touches[0]
        const {clientX, clientY} = touch
        this.move(clientX, clientY, event)
    }

    handleDragTouchEnd = event => {
        event.stopPropagation()
        document.removeEventListener('touchmove', this.handleDragTouchMove)
        document.removeEventListener('touchend', this.handleDragTouchEnd)
        this.moveEnd()
    }

    dialog = () => {
        const {props} = this
        // console.log(this.state.closeAnimation,props)
        let style = {
            border: `1px solid ${secColor}`,
            borderTop: 0,
            transform: `translate(${this.state.position.x}px,${this.state.position.y}px)`,
            zIndex:this.state.dialog_zIndex
        }

        return (
            <dialog className={cs('dialog--drag-layer',{"close-animation":this.state.closeAnimation && !props.mask})} style={style}

                    onMouseDown={this.handle_zIndexAdd}
            >


                <div className="dialog-layer-title" style={{
                    backgroundColor: secColor
                }}
                     onMouseDown={this.onMouseDown}
                     onTouchStart={this.handleDragTouchStart}
                >
                    <span>{props.title}</span>
                    <div className="button">
                        <span className="layui-icon layui-icon-close"
                              onClick={this.stopButtonEvent}
                              onTouchStart={this.stopButtonEvent}
                              onTouchMove={this.stopButtonEvent}
                              onTouchEnd={this.stopButtonEvent}
                              onMouseDown={this.emitClose}
                              // onMouseDown={this.stopButtonEvent}
                              onMouseMove={this.stopButtonEvent}
                              onMouseUp={this.stopButtonEvent}>

                        </span>
                    </div>
                </div>
                <div className="dialog-layer-content" style={{
                    width: props.width,
                    height: props.height,
                    overflowX:props.disableScrollX?'hidden':'auto',
                    overflowY:props.disableScrollY?'hidden':'auto'
                }}>
                    {props.children}
                </div>
            </dialog>
        )
    }

    handle_zIndexAdd = event => {
        if(event instanceof Event){
            event.stopPropagation()
        }
        // console.log('add zindex')
        if(CommonData.dialog.gt_zIndex(this.state.dialog_zIndex)){
            this.setState({
                mask_zIndex:CommonData.dialog.add_zIndex(),
                dialog_zIndex:CommonData.dialog.add_zIndex()
            })
        }
    }

    render() {
        const {props} = this
        // if (!props.open) return null
        const Dialog = this.dialog

        let View
        if (props.mask) {
            const Mask = this.mask
            View = (
                <Mask>
                    <Dialog>

                    </Dialog>
                </Mask>
            )
        } else {
            View = (
                <Dialog>

                </Dialog>
            )
        }
        return ReactDOM.createPortal(View, document.body)
    }
}