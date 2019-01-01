import React,{Component} from 'react'
import PropTypes from 'prop-types'
import {withRouter} from 'react-router'

class Home extends Component{

    static propTypes = {
        match: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired
    };

    render(){
        return (
            <div>
                Home
            </div>
        )
    }
}

export default withRouter(Home)