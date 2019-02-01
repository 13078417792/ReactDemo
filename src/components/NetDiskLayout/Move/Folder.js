import React,{Component,Fragment} from 'react'
import cs from 'classnames'
import {inject} from 'mobx-react'
import PropTypes from 'prop-types'
import './Folder.less'
import http from '@util/http'
import Url from '@util/Url'
import {message,Icon} from 'antd'
import MineIcon from '@components/MineIcon'
import {cloneDeep} from 'lodash'
import CreateFolderForm from '../CreateFolderForm'

@inject('stores')
class Folder extends Component {

    static propTypes = {
        id:PropTypes.number,
        level:PropTypes.number,
        indent:PropTypes.oneOfType([PropTypes.number,PropTypes.string]),
        onSubCheck:PropTypes.func,
        currentCheckFolderId:PropTypes.number,
        hide:PropTypes.bool,
        onLoadend:PropTypes.func,
        onLoading:PropTypes.func,
        onCloseCreateForm:PropTypes.func,
        onCreateFolderSuccess:PropTypes.func,
        onCreateFolderFail:PropTypes.func,
        createFormEnabled:PropTypes.bool,
        ignore:PropTypes.array,
    }

    static defaultProps = {
        id:0,
        level:1,
        indent:20,
        onSubCheck:function(){},
        currentCheckFolderId:0,
        hide:false,
        onLoadend:function(){},
        onLoading:function(){},
        createFormEnabled:false,
        onCloseCreateForm:function(){},
        onCreateFolderSuccess:function(){},
        onCreateFolderFail:function(){},
        ignore:[]

    }

    constructor(props){
        super(props)
        this.state = {
            indent:`calc( ${!isNaN(props.indent)?`${props.indent}px`:props.indent} * ${props.level-1} )`,
            folders:[],
            oldFolders:[],
            checkSubIndex:null,
            currentCheckFolderId:props.currentCheckFolderId,
            toggleSubPid:0
        }

        this.getFolder()


    }

    componentWillReceiveProps(props){
        // console.log(props.currentCheckFolderId)
        this.setState(state=>{
            let result = {
                currentCheckFolderId:props.currentCheckFolderId
            }

            let folders = state.folders
            if(props.createFormEnabled){
                let index = folders.findIndex(el=>{
                    return el.id===props.currentCheckFolderId
                })
                if(index!==-1){
                    let currentFolderData = folders[index]
                    if(!currentFolderData.has_child){
                        currentFolderData = Object.assign({},currentFolderData,this.getChildNodeInitStatusData(),{
                            expand : true,
                            init : false,
                            has_child:true
                        })

                    }else{
                        currentFolderData = Object.assign({},currentFolderData,{
                            expand : true
                        })
                    }
                    folders[index] = currentFolderData
                    result.folders = folders
                }
            }



            return result
        })
    }

    getChildNodeInitStatusData(){
        return {
            expand : false,
            init : true,
            loading : false,
            childStatus : true,
        }
    }

    getFolder(){
        const {props} = this
        props.onLoading()
        http.post(Url.NetDiskFolderContent,{
            id:props.id,
            exclude_file:1,
            check_child:1,
        }).then(result=>{
            if(!result.success){
                message.error(result.error || result.msg || '读取目录失败')
                props.onLoadend(false)
                return;
            }
            let folders = result.folders.map(el=>{
                if(el.has_child){
                    el = Object.assign({},el,this.getChildNodeInitStatusData())
                }
                return el
            })
            this.setState({
                folders,
                oldFolders:cloneDeep(folders)
            })
            props.onLoadend(true)
        }).catch(err=>{
            message.error('读取目录失败')
            props.onLoadend(false)
        })
    }

    check = id => {
        this.setState({
            currentCheckFolderId:id,
            toggleSubPid:this.props.id
        })
        this.props.onSubCheck(id,this.props.id)
        // this.props.onCloseCreateForm()

    }

    clearCheckStatus = (id,pid) => {
        this.setState({
            currentCheckFolderId:id,
            toggleSubPid:pid
        },()=>{
            this.forceUpdate()
        })
    }

    toggleExpand = index => {
        this.setState(({folders})=>{
            folders[index].expand = !folders[index].expand
            if(folders[index].init){
                folders[index].init = !folders[index].init
            }
            return {
                folders,
                oldFolders:cloneDeep(folders)
            }
        })

    }

    expandHideBtn = props => {
        return (
            <span className={cs('tree-expand-btn')} title={props.expand?'隐藏':'展开'}
                  onClick={props.onClick||function(){}}
                  style={{
                      left:`calc(1em * ${this.props.level-1})`
                  }}
            >
                {
                    props.expand?'-':'+'
                }
            </span>
        )
    }

    leftButton = props => {
        const {expandHideBtn:ExpandHideBtn} = this
        return (
            <Fragment>
                {
                    props.loading?(
                        <Icon type="loading" style={{
                            fontSize:'.5em',
                            position:'absolute',
                            left:`calc(5px * ${this.props.level-1})`
                            // left:'5px'
                        }}/>
                    ):(
                        <ExpandHideBtn expand={props.expand} onClick={props.onClick} />
                    )
                }

            </Fragment>
        )
    }

    createFolderFail = err => {
        message.error('创建失败')
        console.error(err)
        this.props.onCloseCreateForm()
        this.props.onCreateFolderFail()
    }

    createFolderSuccess = result => {
        message.success('创建成功')
        this.getFolder()
        this.props.onCloseCreateForm()
        this.props.onCreateFolderSuccess()
    }


    render(){
        const {state,props,leftButton:LeftButton} = this
        // console.log(props.children)
        let children = props.children
        if(!children){
            children = []
        }else if(!Array.isArray(children)) {
            children = [children]
        }
        return (
            <ul className={cs('dir-parent')} style={{
                display:props.hide?'none':'block'
            }}>
                {
                    state.folders.map((el,index)=>{
                        if(props.ignore.includes(el.id)){
                            return null
                        }
                        return (
                            <li className={cs('sub',{check:state.currentCheckFolderId===el.id || el.id===state.toggleSubPid})} key={index} onClick={e=>{
                                this.check(el.id)
                                this.toggleExpand(index)
                                e.preventDefault()
                                e.stopPropagation()
                            }}>

                                <div className={cs('item',{on:state.currentCheckFolderId===el.id})} style={{
                                    paddingLeft:state.indent
                                }}>
                                    {
                                        el.has_child?(
                                            <LeftButton loading={el.loading} expand={el.expand}/>
                                        ):null
                                    }

                                    <MineIcon type="icon-folder" className="icon"/>
                                    {el.name}
                                </div>



                                {
                                    el.has_child && !el.init?(
                                        <Folder
                                            id={el.id}
                                            level={props.level+1}
                                            // onSubCheck={this.clearCheckStatus}
                                            onSubCheck={this.props.onSubCheck}
                                            indent={props.indent}
                                            currentCheckFolderId={state.currentCheckFolderId}
                                            hide={!el.expand}
                                            onLoading={()=>{
                                                this.setState(({folders})=>{
                                                    folders[index].loading = true
                                                    return {folders}
                                                })
                                            }}

                                            onLoadend={status=>{
                                                this.setState(({folders})=>{
                                                    folders[index].loading = false
                                                    folders[index].loadStatus = status
                                                    return {folders}
                                                })
                                            }}
                                            createFormEnabled={props.createFormEnabled}
                                            onCloseCreateForm={()=>{
                                                this.setState(({oldFolders})=>{

                                                    return {
                                                        folders:cloneDeep(oldFolders)
                                                    }
                                                })
                                                props.onCloseCreateForm()
                                            }}

                                            onCreateFolderSuccess={props.onCreateFolderSuccess}
                                            onCreateFolderFail={props.onCreateFolderFail}
                                        />
                                    ):null
                                }

                            </li>
                        )
                    })

                }

                {
                    props.createFormEnabled && props.currentCheckFolderId===props.id ? (
                        <li className="sub" onClick={e=>{
                            e.stopPropagation()
                        }} data-current={props.currentCheckFolderId}>

                            <div className="item" style={{
                                paddingLeft:state.indent
                            }}>
                                <MineIcon type="icon-folder" className="icon"/>
                                <CreateFolderForm
                                    api={Url.NetDiskCreateFolder}
                                    params={{
                                        parent:props.currentCheckFolderId
                                    }}
                                    onClose={props.onCloseCreateForm}
                                    onSubmit={this.createFolderSuccess}
                                    onFail={this.createFolderFail}
                                />



                            </div>


                        </li>
                    ) : null
                }
            </ul>
        )
    }

}

export default Folder