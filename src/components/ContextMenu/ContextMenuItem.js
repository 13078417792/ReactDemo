import React,{Component,Fragment,createRef,cloneElement} from 'react'
import cs from 'classnames'
import {isEmpty,isFunction,isNumber} from 'lodash'
import PropTypes from 'prop-types'
import {Icon} from 'antd'
import ContextMenu from './ContextMenu'

export default class ContextMenuItem extends Component {


    width = 130;

    static propTypes = {
        // zIndex:PropTypes.number,
        menu:PropTypes.array,
        positionX:PropTypes.number,
        positionY:PropTypes.number,
        level:PropTypes.number,
        // onClick:PropTypes.func,
        parentOffsetTop:PropTypes.number,
        styleValue:PropTypes.object
    }

    static defaultProps = {
        sub:false,
        menu:[],
        positionX:0,
        positionY:0,
        level:1,
        parentOffsetTop:0,
        styleValue:{}
    }

    constructor(props){
        super(props)
        const styleValue = {
            padding:3,
            height:'2em',
            fontSize:12
        }
        this.state = {
            menu:[...props.menu],
            subPositionX:'98%',
            subPositionY:'-3px',
            positionX:props.positionX,
            positionY:props.positionY,
            styleValue,
            height:(function(style){
                let heightUnit = ''
                if(!isNumber(style.height)){
                    heightUnit = style.height.replace(/^[\d\.]*/,'')
                }
                return `${parseFloat(style.height)*props.menu.length}${heightUnit}`
            })(styleValue),
            offsetTop:props.parentOffsetTop,
            verticalReverse:false
        }
    }

    onClick = e => {
        let stopClose = true
        const {props} = this
        if(isEmpty(props.child)){
            if(isFunction(props.handler)){
                const args = Array.isArray(props.args)?[...props.args]:[]
                props.handler(e,...args)
            }
            stopClose = false
        }
        if(stopClose){
            e.nativeEvent.stopImmediatePropagation()
        }
    }

    getTotalHeight(count=0){
        const {props} = this
        const styleValue = props.styleValue

        return (styleValue.height*count)+((styleValue.padding+1)*2)

    }

    handleMouseEnter = e => {
        // console.log(e)
        // console.log([e.currentTarget])
        const {props} = this
        if(Array.isArray(props.child) && props.child.length>0){
            const el = e.currentTarget
            console.log([el],props)
            let offsetTop = el.offsetTop + el.offsetParent.offsetTop + 1
            // console.log(offsetTop)
            offsetTop += props.parentOffsetTop
            console.log(props,offsetTop)
            const {clientHeight:height} = document.body
            const verticalReverse = this.getTotalHeight(props.child.length) > height - offsetTop
            this.setState({
                offsetTop:offsetTop,
                verticalReverse
            })
        }
    }

    render(){
        const {state,props} = this
        return (
            <li className={cs('context-menu-item')} style={{
                height:state.styleValue.height,
                lineHeight:state.styleValue.height
            }}
                onMouseEnter={this.handleMouseEnter}
            >
                <span className={cs('label','overflow',{'has-pad':Array.isArray(props.child) && props.child.length>0})}
                      onClick={this.onClick}
                >
                    {props.label}
                </span>


                {
                    Array.isArray(props.child) && props.child.length>0?(
                        <Fragment>
                            <ContextMenu
                                level={props.level+1}
                                menu={props.child}
                                sub={true}
                                positionX={props.positionX}
                                positionY={props.positionY}
                                initOffsetTop={state.offsetTop}
                                verticalReverse={state.verticalReverse}
                            />

                            <Icon className="right-arrow" size="small" type="caret-right" />

                        </Fragment>

                    ):null
                }
            </li>
        )
    }
}