import React,{Component} from 'react'
import PropTypes from 'prop-types'
import {withRouter} from 'react-router'
import cs from 'classnames'
import Layout from '../../components/Layout/Layout'

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

            resizeTimeoutIndex:null,

            picture_position:{
                x:0,
                y:0
            },

            drawSize:{
                width:0,
                height:0
            },

            scale:1,

            currentEditTool:'move',

            tools:[{title:'打开',
                icon:'xuanzetupian',
                handle:this.handleToolAddPicture.bind(this)
            },{title:'保存',
                icon:'save',
                // handle:this.handleCut.bind(this)
            },{title:'预览',
                icon:'preview',
                // handle:this.handleCut.bind(this)
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
            }],

            // 操作记录
            record:[

            ],

            // 记录指针
            recordPoint:null
        }

    }

    componentDidMount(){
        document.addEventListener('keydown',this.preventCtrlS)

        window.addEventListener('resize',this.onResize)
        // this.resizeEditCanvasContainer()
        setTimeout(this.resizeEditCanvasContainer.bind(this),0)
        this.initEditorAddPictureToolInputElement()

        this.bufferImageEl.addEventListener('load',this.showPicture)
    }

    componentWillUnmount(){
        window.removeEventListener('resize',this.onResize)
        document.removeEventListener('keydown',this.preventCtrlS)
        this.bufferImageEl.removeEventListener('load',this.showPicture)
    }

    // 屏蔽保存事件
    preventCtrlS = e => {
        const {keyCode,ctrlKey} = e
        if(keyCode===83 && ctrlKey){
            e.preventDefault()
            console.log('保存')
        }
    }


    onResize = e => {
        // this.backupCanvas()
        clearTimeout(this.resizeTimeoutIndex)
        this.resizeTimeoutIndex = setTimeout(()=>{
            this.resizeEditCanvasContainer()
            this.showPicture(this.bufferImageEl)
            // this.restoreCanvasBackup()
        },300)


    }

    initEditorAddPictureToolInputElement(){
        let el
        if(!this.fileInputEl instanceof Element){
            el = document.createElement('input')
            this.fileInputEl = el
        }else{
            el = this.fileInputEl
        }
        el.removeEventListener('change',this.openPicture)
        el.addEventListener('change',this.openPicture)
        el.type = 'file'
        el.accept = 'image/*'
    }

    // 添加操作记录
    recording(data){
        this.setState(({record})=>{
            // let newVal = new Array(record)
            let newVal = [...record,data]
            // newVal.push(data)
            return {
                record:newVal,
                recordPoint:newVal.length-1
            }
        })
    }

    // 打开
    openPicture = event => {
        const target = event.target
        if(target.files.length===0) return;
        const file = target.files[0]
        console.log(file)
        file.toBase64().then(base=>{
            console.log(base)
            const img = this.bufferImageEl
            img.src = base

        }).catch(err=>{
            console.error(err)
            this.setState({
                status:false
            })
        })
    }

    /**
     * 显示图片
     * @param target img onload 对象 || img元素对象 || Canvas元素对象
     */
    showPicture = event => {
        let img,recording = true
        if(event instanceof Event){
            img = event.target
        }else if(event instanceof HTMLImageElement || event instanceof HTMLCanvasElement){
            img = event
            recording = false
        }else{
            throw new Error('无效数据')
            // return;
        }

        const ctx = this.getContext()
        const vaildSize = {
            width:this.state.editCanvasContainerWidth * 0.9,
            height:this.state.editCanvasContainerHeight * 0.9
        }

        let drawSize = {
            width:img.width,
            height:img.height
        }

        const sizeScale = img.width / img.height

        if(img.width > vaildSize.width){
            drawSize.width = vaildSize.width
            drawSize.height = drawSize.width / sizeScale
        }else if(img.height > vaildSize.height){
            drawSize.height = vaildSize.height
            drawSize.width = drawSize.height * sizeScale
        }
        this.setState({drawSize})

        let position = {
            x:(this.state.editCanvasContainerWidth - drawSize.width) / 2,
            y:(this.state.editCanvasContainerHeight - drawSize.height) / 2
        }

        ctx.clearRect(0,0,this.state.editCanvasContainerWidth,this.state.editCanvasContainerHeight)
        ctx.drawImage(img,...Object.values(position),...Object.values(drawSize))
        if(recording){
            this.recording({
                position:[...Object.values(position)],
                size:[...Object.values(drawSize)],
                imageData:ctx.getImageData(...Object.values(position),...Object.values(drawSize))
            })
        }
        this.setState({
            status:true
        })

    }



    async fullScreen(){
        // const el = this.refs.editor
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
                break;
            }
        }
    }

    // 处理缩放
    handleEditWrapperWheel(e){
        console.log(e)
        const {deltaY} = e
        console.log(deltaY)
        if(deltaY<0){
            this.setState(({scale})=>{
                let newScale = scale
                if(scale<3){
                    newScale = scale+.1
                }
                return {
                    scale:newScale
                }
            })
        }else{
            this.setState(({scale})=>{
                let newScale = scale
                if(scale>0.2){
                    newScale = scale-.1
                }
                return {
                    scale:newScale
                }
            })
        }
    }

    render(){

        return (
            <Layout>
                <div className="tool-edit-picture">
                    <p>
                        简易图片编辑
                    </p>

                    <div className="editor-wrapper" ref="editor" >

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