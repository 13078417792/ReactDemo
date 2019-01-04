import React,{Component} from 'react'
import PropTypes from 'prop-types'
import {withRouter} from 'react-router'
import cs from 'classnames'
import Layout from '../../components/Layout/Layout'
import FileHelper from '../../util/File'

import '../../css/iconfont.less'
import './EditPictureStyle.less'

export default withRouter(class EditPicture extends Component{

    static propTypes = {
        match: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired
    }

    static contextTypes = { theme: PropTypes.object }

    fileInputEl = document.createElement('input')

    constructor(props){
        super(props)
        this.state = {

            editCanvasContainerWidth: 0,
            editCanvasContainerHeight:200,

            status:false,

            picture_position:{
                x:0,
                y:0
            },

            currentEditTool:'move',

            tools:[{title:'打开',
                    icon:'xuanzetupian',
                    handle:this.handleToolAddPicture.bind(this)
                }
                // ,{title:'指针',
                //     icon:'zhizhen',
                //     // handle:this.handleRect.bind(this)
                // }
                ,{title:'矩形',
                icon:'square',
                handle:this.handleRect.bind(this)
            },{title:'三角形',
                icon:'triangle',
                // handle:this.handleCut.bind(this)
            },{title:'裁剪',
                icon:'cut',
                handle:this.handleCut.bind(this)
            },{title:'直线',
                icon:'line',
                // handle:this.handleCut.bind(this)
            },{title:'曲线',
                icon:'curve',
                // handle:this.handleCut.bind(this)
            },{title:'移动',
                icon:'move',
                // handle:this.handleCut.bind(this)
            },{title:'油桶',
                icon:'youqitong',
                // handle:this.handleCut.bind(this)
            }]
        }

    }

    componentDidMount(){
        this.resizeEditCanvasContainer()
        // setTimeout(this.resizeEditCanvasContainer.bind(this),0)
        this.initEditorAddPictureToolInputElement()
    }

    initEditorAddPictureToolInputElement(){
        let el
        if(!this.fileInputEl instanceof Element){
            el = document.createElement('input')
            this.fileInputEl = el
        }else{
            el = this.fileInputEl
        }
        el.removeEventListener('change',this.openPicture.bind(this))
        el.addEventListener('change',this.openPicture.bind(this))
        el.type = 'file'
        el.accept = 'image/*'
    }

    // 打开
    openPicture(event){
        const target = event.target
        if(target.files.length===0) return;
        const file = target.files[0]
        console.log(file)
        file.toBase64().then(base=>{
            console.log(base)
            const img = document.createElement('img')
            img.onload = ()=>{
                const ctx = this.getContext()
                console.log(img.width,img.height)
                console.log(img)
                ctx.clearRect(0,0,this.state.editCanvasContainerWidth,this.state.editCanvasContainerHeight)
                let position = [0,0]

                // 图片尺寸比编辑框尺寸小->居中显示
                if(img.width<this.state.editCanvasContainerWidth){
                    let translate = (this.state.editCanvasContainerWidth - img.width) / 2
                    position[0] = translate
                }

                if(img.height<this.state.editCanvasContainerHeight){
                    let translate = (this.state.editCanvasContainerHeight - img.height) / 2
                    position[1] = translate
                }
                this.setState({
                    picture_position:{x:position[0],y:position[1]}
                })
                ctx.drawImage(img,...position)
                this.setState({
                    status:true
                })
                // ctx.drawImage(img,...Object.values(this.state.picture_position))
            }
            img.src = base

        }).catch(err=>{
            console.error(err)
            this.setState({
                status:false
            })
        })
    }

    async fullScreen(){
        const el = this.refs.editor
    }

    resizeEditCanvasContainer(){
        const el = this.refs.editWrapper
        this.setState({
            editCanvasContainerWidth:el.clientWidth,
            editCanvasContainerHeight:el.clientHeight
        })
    }

    getCanvasEl(){
        return this.refs.canvas || null
    }

    getContext(){
        const el = this.getCanvasEl()
        console.log(el)
        return el.getContext('2d')
    }

    handleCut(){

    }

    handleRect(){
        // this.toggleCurrentTool()
    }

    handleToolAddPicture(){
        const el = this.fileInputEl
        // console.log(el)
        el.click()
    }

    // 白名单工具
    whiteTool = [
        'xuanzetupian'
    ]

    toolDisabled(toolName){
        return !this.whiteTool.includes(toolName) && !this.state.status
    }

    toggleCurrentTool(toolName){
        for(let index=0;index<this.state.tools.length;index++){
            if(this.state.tools[index].icon===toolName){
                this.setState({
                    currentEditTool:toolName
                })
                return;
            }
        }
    }

    render(){

        return (
            <Layout>
                <div className="tool-edit-picture">
                    <p>
                        在线图片编辑
                    </p>

                    <div className="editor-wrapper" ref="editor">

                        <div className="tool-bar-wrapper">

                            <ul className="tool-bar cl">
                                {
                                    this.state.tools.map((el,key)=>{
                                        return (
                                            <li key={key} className={cs('item-tool','iconfont',`icon-${el.icon}`,{
                                                disabled:this.toolDisabled(el.icon),
                                                on:this.state.currentEditTool===el.icon && !this.toolDisabled(el.icon)
                                            })} title={el.title}
                                                onClick={!this.toolDisabled(el.icon) && !!el.handle?el.handle:function(){}}
                                            >

                                            </li>
                                        )
                                    })
                                }
                            </ul>
                        </div>



                        <div className="edit" ref="editWrapper">

                            <canvas ref="canvas" width={this.state.editCanvasContainerWidth} height={this.state.editCanvasContainerHeight}>

                            </canvas>

                        </div>

                    </div>
                </div>
            </Layout>
        )
    }

})