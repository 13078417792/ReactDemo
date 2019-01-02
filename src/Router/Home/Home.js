import React,{Component} from 'react'
import PropTypes from 'prop-types'
import {withRouter} from 'react-router'
import './HomeStyle.less'

class Home extends Component{

    static propTypes = {
        match: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired
    };

    render(){
        return (
            <div className="Home">
                Home
            </div>
        )
    }
}

export default withRouter(Home)