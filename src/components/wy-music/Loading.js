import React,{Component} from 'react'
import Loading from '@components/Loading/Loading'
import PropTypes from 'prop-types'

export default class WyLoading extends Component{

    static propTypes = {
        style:PropTypes.object
    }

    static defaultProps = {
        style:{}
    }

    render(){
        const {props} = this
        return <Loading size={35} border={2} color={'#e4bbbb'} sec_color={'#C72E2E'}  style={props.style} {...props} />
    }
}