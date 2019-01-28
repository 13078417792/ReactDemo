import React,{Component,Fragment,createRef,cloneElement} from 'react'
import ReactDom from 'react-dom'
import cs from 'classnames'
import {isEmpty,isFunction,isNumber} from 'lodash'
import PropTypes from 'prop-types'
import './ContextMenuStyle.less'
import {Icon} from 'antd'
import ContextMenuItem from './ContextMenuItem'
const width = 130
export default class ContextMenu extends Component{

    width = width;

    static propTypes = {

        // 菜单CSS样式：z-index
        zIndex:PropTypes.number,

        // 菜单列表
        menu:PropTypes.array,

        // 菜单关闭回调
        onClose:PropTypes.func,
        // show:PropTypes.bool,

        // 菜单X轴定位
        positionX:PropTypes.number,

        // 菜单Y轴定位
        positionY:PropTypes.number,

        // 列表层级
        level:PropTypes.number,

        // 菜单距离顶部的距离（根节点不用这个属性）
        initOffsetTop:PropTypes.number,

        // 垂直方向定位是否反向(css position:top->bottom)
        verticalReverse:PropTypes.bool
    }

    static defaultProps = {
        zIndex:50,
        sub:false,
        onClose:function(){},
        menu:[],
        positionX:0,
        positionY:0,
        subPositionX:width*0.98,
        subPositionY:-3,
        level:1,
        initOffsetTop:0,
        verticalReverse:false
    }

    attachClose = true

    rootEle = createRef()

    constructor(props){
        super(props)
        const fontSize = 12
        const styleValue = {
            padding:3,
            height:2*fontSize,
            fontSize
        }
        this.state = {
            menu:[...props.menu],
            subPositionX:props.subPositionX,
            subPositionY:props.subPositionY,
            positionX:props.positionX,
            positionY:props.positionY,
            styleValue,
            height:(function(style){
                // let heightUnit = ''
                // if(!isNumber(style.height)){
                //     heightUnit = style.height.replace(/^[\d\.]*/,'')
                // }
                // return `${parseFloat(style.height)*props.menu.length}${heightUnit}`
                return style.height*props.menu.length
            })(styleValue)
        }
    }

    // 子菜单水平边界超出处理
    subOutRange = () => {
        const {state} = this
        const {positionX} = state
        const level = this.props.level
        const {clientWidth:width} = document.body
        let data = {}
        const distanceX = (width - positionX)
        const maxLevelX = Math.floor(distanceX / this.width)
        const residualX = level%maxLevelX
        // console.log(`maxLevelX:${maxLevelX}`,`level:${level}`,`residualX:${residualX}`)
        if( (maxLevelX<=0 && level%2===0) ||
            (level>maxLevelX && (residualX%2===1 || (maxLevelX===1 && level%2===0))) ){
            data.subPositionX = state.subPositionX*-1.02
        }


        return data
    }

    handleRootMenuRange(){
        let data = {}
        const {positionX,positionY} = this.props
        const {state} = this

        // 第一层菜单的水平边界超出处理

        const {clientWidth:width,clientHeight:height} = document.body

        if(positionX+this.width>width){
            data.positionX = width - this.width
        }


        // 第一层菜单的垂直边界超出处理
        let menuHeight = state.height
        menuHeight = menuHeight+(parseFloat(state.styleValue.padding)+1)*2
        if( positionY+menuHeight > height ){
            data.positionY = positionY - menuHeight
        }
        return data;
    }

    componentDidMount(){
        let data = {}

        if(!this.props.sub){
            document.addEventListener('click',this.onClose,{
                capture:false
            })
            data = Object.assign({},data,this.handleRootMenuRange())
        }else{
            data = Object.assign({},data,this.subOutRange())

        }


        this.setState(data)
    }

    componentWillUnmount(){
        if(!this.props.sub){
            document.removeEventListener('click',this.onClose)
        }
    }

    onClose = () => {
        if(this.attachClose){
            this.props.onClose()
        }
    }

    render(){
        const {props,state} = this
        let style = {
            zIndex:props.zIndex,
            padding:`${state.styleValue.padding}px 0`,
            height:state.height,
            fontSize:state.styleValue.fontSize
        }

        if(!props.sub){
            style = Object.assign({},style,{
                left:state.positionX,
                top:state.positionY
            })
        }else{

            style = Object.assign({},style,{
                left:state.subPositionX,
                top:`${parseInt(state.subPositionY)-1}px`
            })
            if(props.verticalReverse){
                delete style.top
                style.bottom = props.subPositionY-1
            }
        }

        return (
            <ul ref={this.rootEle} className={cs('context-menu',{sub:props.sub})} style={style}>
                {
                    state.menu.map((el,index)=>{
                        return (
                            <ContextMenuItem
                                key={index}
                                positionX={state.positionX}
                                positionY={state.positionY}
                                {...el}
                                level={props.level}
                                parentOffsetTop={props.initOffsetTop}
                                styleValue={state.styleValue}
                            />
                        )
                    })
                }
            </ul>
        )
    }

}
