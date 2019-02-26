import React,{Component} from 'react'
import cs from 'classnames'
import PropTypes from 'prop-types'
import {observer,inject} from 'mobx-react'
import './PlayListStyle.less'
import {withRouter} from 'react-router-dom'
import Common from '../CommonComment'

@inject('stores') @observer
class PlayList extends Component {


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
            <Common type="playlist" id={parseInt(this.props.match.params.id)} />
        )
    }
}

export default withRouter(PlayList)