import React,{Component} from 'react'
import {withRouter} from 'react-router'
import PropTypes from 'prop-types'
import {inject} from 'mobx-react'
import './SongListStyle.less'

@inject("stores")
class SongList extends Component {

    static propTypes = {
        match: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired
    }

    render(){
        return (
            <div>
                songlist
            </div>
        )
    }
}



export default withRouter(SongList)