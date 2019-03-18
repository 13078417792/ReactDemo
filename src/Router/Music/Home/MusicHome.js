import React,{Component} from 'react'
import {withRouter} from 'react-router'
import PropTypes from 'prop-types'
import {inject} from 'mobx-react'
@inject("stores")
class MusicHome extends Component {

    static propTypes = {
        match: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired
    }

    render(){
        return (
            <div></div>
        )
    }
}



export default withRouter(MusicHome)