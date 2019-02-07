import React,{Component} from 'react'
import {createPortal} from 'react-dom'
import ContextMenu from './ContextMenu'
import PropTypes from "prop-types";

export default class ContextMenuDispatch extends Component {


    static propTypes = {
        zIndex:PropTypes.number,
        menu:PropTypes.array,
        onClose:PropTypes.func,
        show:PropTypes.bool,
        positionX:PropTypes.number,
        positionY:PropTypes.number,
        level:PropTypes.number
    }

    static defaultProps = {
        zIndex:50,
        sub:false,
        onClose:function(){},
        menu:[],
        positionX:0,
        positionY:0,
        level:1
    }

    render(){
        const {props} = this

        return props.sub?<ContextMenu {...props} />:createPortal(
            <ContextMenu {...props} />,
            document.body
        )
    }
}