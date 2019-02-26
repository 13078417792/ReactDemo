import React,{Component,Fragment} from 'react'
import {createPortal} from 'react-dom'
import cs from 'classnames'
import PropTypes from 'prop-types'
import './DrawerMenuStyle.less'
import {isFunction} from 'lodash'
import Mask from '@components/Mask/Mask'
import MineIcon from '@components/MineIcon'
import {CSSTransition} from 'react-transition-group'

class DrawerMenu extends Component {

    static propTypes = {
        menu:PropTypes.object.isRequired,
        zIndex:PropTypes.number,
        visible:PropTypes.bool,
        onClose:PropTypes.func,
        onAnimateCloseComplete:PropTypes.func,
    }

    static defaultProps = {
        menu:{},
        zIndex:62,
        visible:false,
        onClose:function(){},
        onAnimateCloseComplete:function(){}
    }

    handleClose = () => {
        this.props.onClose()
    }

    state = {
        visible:false,
        mask_visible:false
    }

    componentDidMount(){
        this.setState({
            visible:true,
            mask_visible:true
        })
    }

    group = props => {
        const {data,group_name} = props
        if(data.length===0) return null
        return (
            <section className={cs('group-menu',{
                [`group-menu__tag-${group_name}`]:!!group_name
            })}>
                {
                    data.map((el,index)=>{
                        return (
                            <div className={cs('menu-item','overflow',{
                                disabled:el.disabled
                            })} key={index} onClick={e=>{
                                e.stopPropagation()
                                if(!isFunction(el.handler) || el.disabled) return;
                                el.handler()
                                this.handleClose()
                            }} >
                                <span>
                                    {el.name}
                                </span>
                            </div>
                        )
                    })
                }
            </section>
        )
    }

    wrap = () => {
        const {props,props:{zIndex,visible},group:Group} = this
        // const {state:{visible,mask_visible}} = this
        const {menu} = props
        const menuData = Object.values(menu)
        const menuKeys = Object.keys(menu)
        return menuData.length===0?null:(
            <Fragment>
                <CSSTransition
                    in={visible}
                    classNames="wy-drawer-menu-status"
                    timeout={300}
                    onExited={this.props.onAnimateCloseComplete}
                >
                    <div
                        className={cs('wy-drawer')}
                        style={{
                            zIndex
                        }}
                    >



                        {
                            menuData.map((el,index)=>{
                                return <Group data={el} group_name={menuKeys[index]} key={index} />
                            })
                        }


                    </div>
                </CSSTransition>
                <Mask onClose={this.handleClose} zIndex={zIndex-1} visible={visible} />
            </Fragment>


        )
    }

    render(){
        const {wrap:Wrap} = this
        return createPortal(<Wrap/>,document.body)

    }

}

export default DrawerMenu