import React,{Component,Fragment,cloneElement} from 'react'
import DrawerMenu from './DrawerMenu'

class DrawerMenuContainer extends Component {

    state = {
        visible:false,
        show:false
    }

    child = () => {
        const {props:{children}} = this
        return cloneElement(children,{
            onContextMenu:e=>{
                e.preventDefault()
                e.stopPropagation()
                this.setState({
                    show:true
                },()=>{
                    this.setState({
                        visible:true
                    })
                })
            }
        })
    }

    render(){
        const {props,child:Child} = this
        const {state:{visible,show}} = this
        return (
            <Fragment>
                <Child/>

                {
                    show?(
                        <DrawerMenu visible={visible} {...props} onClose={()=>{
                            this.setState({
                                visible:false
                            })
                        }} onAnimateCloseComplete={()=>{
                            this.setState({
                                show:false
                            })
                        }} />
                    ):null
                }

            </Fragment>
        )

    }

}

export default DrawerMenuContainer