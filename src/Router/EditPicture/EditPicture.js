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

    bufferImageEl = document.createElement('img')



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
            },{title:'画笔',
                icon:'pen',
                // handle:this.handleCut.bind(this)
            },{title:'画笔粗细',
                icon:'thickness',
                // handle:this.handleCut.bind(this)
            },{title:'矩形',
                icon:'square',
                handle:this.handleRect.bind(this)
            },{title:'三角形',
                icon:'triangle',
                // handle:this.handleCut.bind(this)
            },{title:'圆圈',
                icon:'draw-circle',
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
            },{title:'文字颜色',
                icon:'font-color',
                // handle:this.handleCut.bind(this)
            },{title:'文字底色',
                icon:'font-background',
                // handle:this.handleCut.bind(this)
            },{title:'文字',
                icon:'font',
                // handle:this.handleCut.bind(this)
            },{title:'加大文字尺寸',
                icon:'font-scale-up',
                // handle:this.handleCut.bind(this)
            },{title:'缩小文字尺寸',
                icon:'font-scale-down',
                // handle:this.handleCut.bind(this)
            },{title:'旋转',
                icon:'rotate',
                // handle:this.handleCut.bind(this)
            },{title:'放大',
                icon:'scale-up',
                // handle:this.handleCut.bind(this)
            },{title:'缩小',
                icon:'scale-down',
                // handle:this.handleCut.bind(this)
            },{title:'模糊',
                icon:'blur',
                // handle:this.handleCut.bind(this)
            },{title:'保存',
                icon:'save',
                // handle:this.handleCut.bind(this)
            },{title:'预览',
                icon:'preview',
                // handle:this.handleCut.bind(this)
            }]
        }

    }

    componentDidMount(){
        window.addEventListener('resize',this.onResize)
        this.resizeEditCanvasContainer()
        setTimeout(this.resizeEditCanvasContainer.bind(this),0)
        this.initEditorAddPictureToolInputElement()
    }

    componentWillUnmount(){
        window.removeEventListener('resize',this.onResize)
    }


    onResize = e => {
        this.resizeEditCanvasContainer()
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
            // const img = document.createElement('img')
            const img = this.bufferImageEl
            const self = this
            img.onload = function(){
                console.log(this)
                const ctx = self.getContext()
                console.log('open picture width:',this.width,'height:',this.height)
                ctx.clearRect(0,0,self.state.editCanvasContainerWidth,self.state.editCanvasContainerHeight)
                let position = [0,0]

                // 图片尺寸比编辑框尺寸小->居中显示
                if(img.width<self.state.editCanvasContainerWidth){
                    let translate = (self.state.editCanvasContainerWidth - img.width) / 2
                    position[0] = translate
                }

                if(img.height<self.state.editCanvasContainerHeight){
                    let translate = (self.state.editCanvasContainerHeight - img.height) / 2
                    position[1] = translate
                }
                self.setState({
                    picture_position:{x:position[0],y:position[1]}
                })
                ctx.drawImage(img,...position,img.width,img.height)
                self.setState({
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
                        简易图片编辑
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