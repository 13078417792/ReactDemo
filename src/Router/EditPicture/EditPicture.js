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

    constructor(props){
        super(props)
        this.state = {

            editCanvasContainerWidth: 0,
            editCanvasContainerHeight:200
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
        el.type = 'file'
        el.accept = 'image/*'
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

    /**
     * 裁剪、水印、文字、透明度、图片叠加
     * @returns {*}
     */

    handleCut(){

    }

    handleRect(){

    }

    handleToolAddPicture(){
        const el = this.fileInputEl
        // console.log(el)
        el.click()
    }

    render(){

        const tools = [{title:'指针',
                icon:'zhizhen',
                // handle:this.handleRect.bind(this)
            },{title:'矩形',
                icon:'square',
                handle:this.handleRect.bind(this)
            },{title:'三角形',
                icon:'triangle',
                // handle:this.handleCut.bind(this)
            },{title:'裁剪',
                icon:'jietu-copy',
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
            },{title:'添加图片',
                icon:'xuanzetupian',
                handle:this.handleToolAddPicture.bind(this)
            }]

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
                                    tools.map((el,key)=>{
                                        return (
                                            <li key={key} className={cs('item-tool','iconfont',`icon-${el.icon}`)} title={el.title} onClick={el.handle || function(){}}>

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