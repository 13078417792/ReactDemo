import React,{Component,Fragment,cloneElement} from 'react'
import {isEmpty} from 'lodash'
import PropTypes from 'prop-types'
import Dispatch from './ContextMenuDispatch'


class ContextMenuWrapper extends Component{

    static currentOpenComponent = new Set([])

    static propTypes = {
        zIndex:PropTypes.number,
        menu:PropTypes.array,
        sub:PropTypes.bool,
        args:PropTypes.array,
        // onClose:PropTypes.func
    }

    static defaultProps = {
        zIndex:50,
        sub:false,
        // onClose:function(){},
        args:[],
        menu:[],
        // menu:[{
        //     label:'删除',
        // },{
        //     label:'下载',
        //     handler:(e,...rest)=>{
        //         console.log(1)
        //     },
        //     args:[],
        //     sep:false,
        //     child:[{
        //         label:'下载1',
        //         handler:(e,...rest)=>{
        //             console.log(Date.now())
        //         },
        //         args:[],
        //         sep:false,
        //     }]
        // }]
    }

    constructor(props){
        super(props)

        this.state = {
            menu:[...props.menu],
            show:false,
            position:{
                x:0,
                y:0
            }
        }
    }

    eventList = [
        'click',
        // 'mousedown',
        // 'touchstart',
    ];

    globalToggle = () => {
        this.setState({
            show:false
        },()=>{
            ContextMenuWrapper.currentOpenComponent.delete(this)
        })

    }

    componentDidMount(){
        // this.eventList.forEach(event=>{
        //     document.addEventListener(event,this.globalToggle,false)
        // })
    }

    componentWillUnmount(){
        this.eventList.forEach(event=>{
            document.removeEventListener(event,this.globalToggle)
        })
    }

    onContextMenu = e => {
        const {clientX,clientY} = e

        if(!isEmpty(ContextMenuWrapper.currentOpenComponent)){
            ContextMenuWrapper.currentOpenComponent.forEach(el=>{
                el.setState({
                    show:false
                })
            })
            ContextMenuWrapper.currentOpenComponent.clear()
        }

        setTimeout(()=>{
            this.setState({
                show:true,
                position:{
                    x:clientX,
                    y:clientY
                }
            },()=>{
                ContextMenuWrapper.currentOpenComponent.add(this)
            })
        },0)




        e.preventDefault()
    }

    onClose = () => {
        this.globalToggle()
    }

    render(){
        const {props,state} = this

        return (
            <Fragment>
                {
                    cloneElement(props.children,{
                            onContextMenu:this.onContextMenu
                        }
                    )
                }

                {
                    state.show && state.menu.length>0?<Dispatch onClose={this.onClose}
                                            menu={props.menu}
                                            sub={props.sub}
                                            zIndex={props.zIndex}
                                            // show={state.show}
                                            positionX={state.position.x}
                                            positionY={state.position.y}
                                            args={props.args}
                                />:null
                }
            </Fragment>
        )

    }

}
// ContextMenuWrapper.prototype.hasOpen = false

export default ContextMenuWrapper