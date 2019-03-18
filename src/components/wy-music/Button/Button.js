import React,{Component} from 'react'
import PropTypes from 'prop-types'

class Button extends Component(){

    static propTypes = {
        onClick:PropTypes.func
    }

    static defaultProps = {
        onClick:function(){}
    }

    render(){
        return (
            <button>
                {this.props.children}
            </button>
        )
    }

}

export default Button