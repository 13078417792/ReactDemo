import React,{Component} from 'react'
import PropTypes from 'prop-types'
import {withRouter} from 'react-router'
import cs from 'classnames'
import Layout from '../../components/Layout/Layout'

import './EditPictureStyle.less'

export default withRouter(class EditPicture extends Component{

    static propTypes = {
        match: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired
    }

    static contextTypes = { theme: PropTypes.object }

    constructor(props){
        super(props)
        this.state = {

        }
    }

    /**
     * 截图、水印、文字、透明度、图片叠加
     * @returns {*}
     */
    render(){

        return (
            <Layout>
                <div className="tool-edit-picture">

                    <div className="editor-wrapper">

                        <ul className="tool-bar cl">

                        </ul>

                    </div>
                </div>
            </Layout>
        )
    }

})