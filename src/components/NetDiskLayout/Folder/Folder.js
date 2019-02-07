import React,{Component} from 'react'
import {inject} from 'mobx-react'
import './FolderStyle.less'
import PropTypes from 'prop-types'
import {Icon,message} from 'antd'
import MineIcon from '@components/MineIcon'
import http from '@util/http'
import {cloneDeep} from 'lodash'
import cs from 'classnames'
import NameForm from '@components/NetDiskLayout/NameForm/NameForm'
import Url from '@util/Url'

@inject('stores')
class Folder extends Component{

    static propTypes = {
        target:PropTypes.number.isRequired,
        isFile:PropTypes.bool.isRequired,
        level:PropTypes.number,
        api:PropTypes.string.isRequired,
        pid:PropTypes.number, // 父级文件夹ID
        currentFolder:PropTypes.number, // 选中的文件夹ID
        params:PropTypes.object,
        style:PropTypes.object,
        onLoaded:PropTypes.func,
        onSelect:PropTypes.func,
        create:PropTypes.bool,
        onCloseCreate:PropTypes.func,
        onSuccessCreate:PropTypes.func,
        onFailCreate:PropTypes.func
    }

    static defaultProps = {
        isFile:false,
        level:0,
        pid:-1,
        currentFolder:0,
        params:{},
        style:{},
        onLoaded:function(){},
        onSelect:function(){},
        create:false,
        onCloseCreate:function(){},
        onSuccessCreate:function(){},
        onFailCreate:function(){}
    }

    defaultList = [{
        id:0,
        name:'根目录',
        has_child:true, // 是否有子级
        loading:true, // 是否加载中
        loaded:false, // 是否子级加载完成
        expand:false // 是否展开子级
    }]



    constructor(props){
        super(props)
        this.state = {
            list:[]
        }
    }

    componentDidMount(){
        this.initFolders()
    }

    componentWillReceiveProps(props){
        this.setState(state=>{
            let result = {}
            return result
        })
    }


    // 初始化文件夹列表数据
    initFolders(){
        const {props} = this
        if(props.level===0){
            this.setState({
                list:cloneDeep(this.defaultList)
            })
        }else{
            this.getFolders().then(result=>{
                const {folders:folder_list} = result
                props.onLoaded(props.pid,folder_list)
                let folders = folder_list.map(el=>{
                    el.loading = false
                    el.expand = false
                    return el
                })
                this.setState({
                    list:folders
                })
            }).catch(err=>{
                console.error('获取文件夹内容失败：',err)
            })
        }
    }

    // 获取文件夹列表
    getFolders = async () =>  {
        const {props} = this
        const {api, params,pid} = props
        if (params.hasOwnProperty('id')) {
            delete params.id
        }
        try {
            var result = await http.post(api, Object.assign({}, {
                id:pid
            }, params))
        } catch (err) {
            return Promise.reject(err)
        }
        if (!result.success) return Promise.reject(result.error || result.msg || '操作失败')
        return Promise.resolve(result)
    }

    // 处理展开-隐藏点击按钮组件点击
    handleExpand = folder => {
        // const {props} = this

        this.setState(({list})=>{
            const index = list.indexOf(folder)
            if([null,undefined,-1,''].includes(index)) return;
            folder.expand = !folder.expand
            if(!folder.loading && !folder.loaded)  folder.loading = true
            list[index] = folder
            return {
                list
            }
        })
    }

    // 展开-隐藏点击按钮组件
    ExpandHide = props => {
        const {className,folder} = props
        return folder.has_child || (this.props.create && this.props.currentFolder===props.folder.id)?(
            <span className={cs('icon',className)}
                  style={{
                      left:`${(this.props.level+1)*10}px`
                  }}
                  onClick={e=>{
                      e.stopPropagation()
                      this.handleExpand(folder)
                  }}
            >
                {
                    !!folder.expand?'-':'+'
                }
            </span>
        ):null
    }

    // 子文件夹数据加载完成
    onSubFolderLoaded = id => {
        this.setState(({list})=>{
            let folder = list.find(el=>{
                return el.id===id
            })
            if(folder){
                folder.loaded = true
                folder.loading = false
                folder.expand = true
                let index = list.indexOf(folder)
                if(index!==-1){
                    list[index] = folder
                }
            }
            return {
                list
            }

        })
    }

    onSelect = id => {
        this.props.onSelect(id)
    }

    onCloseCreate = () => {
        this.props.onCloseCreate()
    }

    async folderDetail(id){
        if(!id) return Promise.reject('文件夹ID空')
        try{
            var result = await http.post(Url.NetDiskFolderDetail,{
                id
            })
        }catch(err){
            return Promise.reject(err)
        }
        if(!result.success) return Promise.reject('文件夹不存在')
        return Promise.resolve({
            detail:result.detail,
            path:result.path
        })

    }

    onSuccessCreate = result => {
        const {props,state} = this
        const folder = state.list.find(el=>el.id===props.currentFolder)
        if(folder){
            console.log('parent')
            folder.has_child = true
            folder.expand = true
            folder.loaded = true

        }
        this.props.onCloseCreate()
        this.props.onSuccessCreate(result)
    }

    onFailCreate = err => {
        message.error('新建文件夹失败')
        console.error('新建文件夹失败：',err)
        this.props.onFailCreate(err)
    }

    render(){
        const {state,props,ExpandHide} = this
        return (
            <ul className={cs('folder-parent',{
                'show-create-folder':props.create && props.pid===props.currentFolder
            })} style={props.style} >

                <li className="create-folder-node">
                    <div className={cs('item')} style={{
                        paddingLeft:`${(props.level+1)*10}px`
                    }}>
                        <MineIcon type={'icon-folder'} className="icon-folder" />

                        <NameForm
                            show={props.create && props.pid===props.currentFolder}
                            api={Url.NetDiskCreateFolder}
                            params={{
                                parent:props.currentFolder
                            }}
                            onClose={this.onCloseCreate}
                            onSuccess={result=>{
                                this.folderDetail(result.folder_id).then(({detail})=>{
                                    this.setState(({list})=>{
                                        let push = {
                                            id:detail.id,
                                            name:detail.name,
                                            pid:detail.pid,
                                            has_child:false,
                                            expand:false,
                                            loaded:false
                                        }
                                        console.log('child',push)
                                        list.unshift(push)
                                        return {list}
                                    },()=>{
                                        this.onSuccessCreate(result)
                                    })
                                })

                            }}
                            onFail={this.onFailCreate}
                        />

                    </div>
                </li>

                {
                    state.list.map((el,index)=>{
                        return el.id!==props.target?(
                            <li key={index} >
                                <div className={cs('item',{checked:props.currentFolder===el.id})} style={{
                                    paddingLeft:`${(props.level+1)*10}px`
                                }} onClick={this.onSelect.bind(null,el.id)}>
                                    {/* 首次加载（异步）时显示loading图标 */}
                                    {
                                        el.loading && !el.loaded?(
                                            <Icon type="loading" className="icon" style={{
                                                left:`${(this.props.level+1)*10}px`
                                            }} />
                                        ):<ExpandHide folder={el} className="expand-hide-icon" />
                                    }

                                    {/* 文件夹图标 */}
                                    <MineIcon type={'icon-folder'} className="icon-folder" />
                                    <span>
                                        {el.name}
                                    </span>
                                </div>



                                {
                                    (el.has_child && (el.loading || el.loaded))
                                    || (props.create && props.currentFolder===el.id)
                                        ?(
                                        <Folder
                                            target={props.target}
                                            isFile={props.isFile}
                                            style={{
                                                display:el.expand?'block':'none'
                                            }}
                                            api={props.api}
                                            level={props.level+1}
                                            pid={el.id}
                                            onLoaded={this.onSubFolderLoaded}
                                            params={props.params}
                                            onSelect={this.onSelect}
                                            currentFolder={props.currentFolder}
                                            create={props.create}
                                            onCloseCreate={props.onCloseCreate}
                                            onSuccessCreate={this.onSuccessCreate}
                                            onFailCreate={props.onFailCreate}
                                        />
                                    ):null
                                }

                            </li>
                        ):null
                    })
                }

            </ul>
        )
    }

}

export default Folder