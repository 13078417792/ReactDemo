import React,{Component} from 'react'
import cs from 'classnames'
import FileItem from './FileItem'
import './FileListStyle.less'

class FileList extends Component{

    state = {
        column:[
            {
                tag:'file-name',
                label:'文件名',
            },{
                tag:'filesize',
                label:'大小',
                width:'250px',
            },{
                tag:'date',
                label:'修改日期',
                width:'350px'
            }

        ]
    }

    constructor(props){
        super(props)
    }

    Column(){
        const {column} = this.state
        return (
            <div className="file-list-column">

                {
                    column.map((el,index)=>(
                        <div className={cs('column-item',`column-${el.tag}`)} style={{
                            width:el.width
                        }} key={index}>
                            <span>{el.label}</span>
                        </div>
                    ))
                }

            </div>
        )
    }

    render(){
        const Column = this.Column.bind(this)
        return (
            <div className="file-list">

                <Column />

                <div className="file-list-table-wrapper">

                    <div className="file-list-table">

                    </div>

                </div>


            </div>
        )
    }
}

export default FileList