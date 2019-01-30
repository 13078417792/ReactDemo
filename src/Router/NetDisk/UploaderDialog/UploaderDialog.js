import React,{Component} from 'react'
import cs from 'classnames'
import PropTypes from 'prop-types'
import './UploaderDialogStyle.less'
import filesize from 'filesize'
import {Icon} from 'antd'

export default class UploaderDialog extends Component{

    static propTypes = {
        task:PropTypes.array,
        onToggleStatus:PropTypes.func
    }

    static defaultProps = {
        task:[],
        onToggleStatus:function(){}
    }

    toggleStatus(index,status){
        this.props.onToggleStatus(index,status)
    }

    render(){
        const {props} = this
        return (
            <div className="uploader-dialog">

                <ul className={cs('upload-task-list')}>
                    {
                        props.task.map((el,index)=>(
                            <li className="task-item" key={index}>
                                <span className="file-name info overflow" title={el.name}>
                                    {el.name}
                                </span>
                                <span className="file-size info overflow">
                                    {filesize(el.size)}
                                </span>
                                {
                                    el.enableAction?<span className="upload-action info">

                                    {
                                        el.stop?<Icon type="caret-right" onClick={this.toggleStatus.bind(this,index,!el.stop)} style={{
                                            color:'#333'
                                        }} />:<Icon type="pause" style={{
                                            color:'#333'
                                        }}  onClick={this.toggleStatus.bind(this,index,!el.stop)} />
                                    }

                                    </span>:null
                                }

                                {
                                    el.stop?(
                                        <span className="waiting" />
                                        ):(
                                        <span className="progress" style={{
                                            width:`${(el.progress/el.count)*100}%`
                                        }} />
                                    )
                                }




                                <span className="status">
                                    {el.status}
                                </span>
                            </li>
                        ))
                    }
                </ul>

            </div>
        )
    }
}