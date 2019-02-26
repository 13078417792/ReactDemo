import React,{Component} from 'react'
import PropTypes from 'prop-types'
import {observer,inject} from 'mobx-react'
import {withRouter} from 'react-router-dom'
import Common from '../CommonComment'

@inject('stores') @observer
class Music extends Component {


    static propTypes = {
        match: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired
    }

    state = {
        count:0
    }


    render(){
        return (
            <Common type="music" id={parseInt(this.props.match.params.id)} />
        )
    }
}

export default withRouter(Music)