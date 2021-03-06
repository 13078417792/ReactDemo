import React,{Component} from 'react'
import PropTypes from 'prop-types'
import {withRouter} from 'react-router'
import './style.less'


class NotFound extends Component{

    static propTypes = {
        match: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired
    };

    static defaultProps = {
        style:{}
    }

    render(){
        return (
            <div className="not-found" style={this.props.style}>

                <p className="font">
                    404 Not Found
                </p>
            </div>
        )
    }
}


export default withRouter(NotFound)