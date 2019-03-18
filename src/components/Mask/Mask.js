import React,{Component} from 'react'
import {createPortal} from 'react-dom'
import cs from 'classnames'
import PropTypes from 'prop-types'
import "./MaskStyle.less"
import {computed} from 'mobx'
import {observer} from 'mobx-react'
import {CSSTransition} from 'react-transition-group'

@observer
class Mask extends Component {

    static propTypes = {
        out:PropTypes.bool,
        opacity:PropTypes.number,
        zIndex:PropTypes.number,
        style:PropTypes.object,
        onClose:PropTypes.func,
        full:PropTypes.bool,
        visible:PropTypes.bool
    }

    static defaultProps = {
        out:true,
        opacity:0.5,
        style:{},
        onClose:function(){},
        full:true,
        zIndex:50,
        visible:false
    }

    @computed get opa(){
        const {opacity} = this.props
        return opacity>1?1:(opacity<0?0.5:opacity)
    }

    @computed get style(){
        const {props:{style:propsStyle,full,out,zIndex},opa} = this
        const mineStyle = {}
        if(out || full){
            mineStyle.width = '100vw'
            mineStyle.height = '100vh'
        }
        return Object.assign({},mineStyle,propsStyle,{
            backgroundColor:`rgba(0,0,0,${opa})`,
            zIndex
        })
    }

    @computed get visible(){
        return this.props.visible
    }

    state = {
        style:{}
    }


    handleClose = event => {
        event.preventDefault()
        event.stopPropagation()
        this.props.onClose()
    }


    MaskWrap = () => {
        const {style,visible} = this
        return (
            <CSSTransition
                in={visible}
                classNames="fade"
                timeout={300}
            >
                <div
                    className={cs('mask')}
                    style={style}
                    onMouseDown={this.handleClose}
                    onContextMenu={e=>{
                        e.preventDefault()
                        e.stopPropagation()
                    }}
                />
            </CSSTransition>
        )
    }

    render(){
        const {props:{out},MaskWrap} = this
        return out?createPortal(<MaskWrap/>,document.body):<MaskWrap/>
    }

}

export default Mask