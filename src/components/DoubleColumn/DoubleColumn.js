import React,{Component} from 'react'
import PropTypes from 'prop-types'
import cs from 'classnames'
import {mapValues,isFunction} from 'lodash'
import "./DoubleColumnStyle.less"

class DoubleColumn extends Component {

    static propTypes = {
        style:PropTypes.object,
        className:PropTypes.string,
        left:PropTypes.oneOfType([
            PropTypes.func,PropTypes.element
        ]).isRequired,
        right:PropTypes.oneOfType([
            PropTypes.func,PropTypes.element
        ]).isRequired,
        leftWidth:PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number
        ]),
        leftClass:PropTypes.string,
        rightClass:PropTypes.string,
    }

    static defaultProps = {
        style:{},
        className:'',
        leftClass:'',
        rightClass:'',
        leftWidth:null,
        left:null,
        right:null
    }

    getEvent = () => {
        const {props} = this
        let event = {}
        mapValues(props,(func,name)=>{
            if(name.indexOf('on')===0 && isFunction(func)){
                event[name] = func
            }
        })
        return event
    }

    render(){
        const {props} = this
        const {leftWidth,className,style,left:Left,right:Right,leftClass,rightClass} = props
        return (
            <div className={cs('double-column-layout',className)} style={style} {...this.getEvent(props)}>

                <div className={cs('left',leftClass)} style={{
                    width:leftWidth
                }}>
                    {
                        isFunction(Left)?(
                            <Left/>
                        ):Left
                    }
                </div>

                <div className={cs('right',rightClass)}>
                    {
                        isFunction(Right)?(
                            <Right/>
                        ):Right
                    }
                </div>

            </div>
        )
    }
}

export default DoubleColumn