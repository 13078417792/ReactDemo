import React,{Component} from 'react'
import './FileBreadStyle.less'
import {observer,inject} from 'mobx-react'
import {Link} from 'react-router-dom'
import {toJS} from 'mobx'

@inject("stores")
@observer
class FileBread extends Component{



    constructor(props){
        super(props)
    }

    path(){
        const {stores:{DiskStore}} = this.props
        if(DiskStore.path.length===0) return null;
        return (
            <div className="inlb path">

                {
                    DiskStore.path.map((el,index)=>{
                        if(index===DiskStore.path.length-1){
                            return (
                                <span key={index}>
                                    {el.name}
                                </span>
                            )
                        }
                        return (
                            <Link key={index} to={`/disk/content/${el.id}`}>
                                {el.name}
                            </Link>
                        )
                    })
                }

            </div>
        )
    }

    render(){
        const {props} = this
        const {stores:{DiskStore}} = props
        const Path = this.path.bind(this)
        const folderPath = toJS(DiskStore.path)
        return (
            <div className="file-bread">

                {
                    folderPath.length>0?(
                        <div className="inlb goback">
                            <Link to={`/disk/content${folderPath.length-2>=0?`/${folderPath[folderPath.length-2].id}`:''}`}>
                                返回上一层
                            </Link>
                        </div>
                    ):null
                }


                <div className="inlb all">
                    {
                        DiskStore.folderId>0?(
                            <Link to={`/disk/content`}>
                                全部文件
                            </Link>
                            ):(
                            <span>
                                全部文件
                            </span>
                        )
                    }
                </div>

                <Path/>

            </div>
        )
    }
}

export default FileBread