import React,{Component} from 'react'
import './LoadingStyle.less'
class Loading extends Component{

    constructor(props){
        super(props)
        this.container = React.createRef()
        this.parent = React.createRef()
        this.child = React.createRef()
        const size = 50
        const border = 3
        this.state = {
            width:0,
            height:0,
            size,
            border,
            radius:(size+border*2)/2
        }
    }



    componentDidMount(){
        this.setState({
            width:this.container.clientWidth,
            height:this.container.clientHeight
        })
        this.drawOuterCircle.call(this)
        this.drawInnerCircle.call(this)
    }

    // 外圆
    drawOuterCircle(){
        const {state:{size,radius},parent:{current:parent}} = this

        const ctx = parent.getContext('2d')
        ctx.beginPath()
        ctx.strokeStyle = '#e2e2e2'
        ctx.lineWidth = 5
        ctx.arc(radius,radius,size/2,0,Math.PI * 2)
        ctx.stroke()
        ctx.closePath()
    }

    // 内圆圆弧
    drawInnerCircle(){
        const {state:{size,border,radius},child:{current:child}} = this
        const ctx = child.getContext('2d')
        ctx.beginPath()
        ctx.strokeStyle = '#b0b0b0'
        ctx.lineWidth = border
        ctx.arc(radius,radius,size/2,Math.PI/180*-20,Math.PI/180*-90,true)
        ctx.stroke()
        ctx.closePath()
    }

    render(){
        const {state:{size,border}} = this
        return (
            <div className="loading-middleware">

                <div className="container" ref={this.container} style={{
                    width:`${size+border*2}px`,
                    height:`${size+border*2}px`
                }}>

                    <canvas ref={this.parent} className={"parent"} width={`${size+border*2}px`} height={`${size+border*2}px`}>

                    </canvas>

                    <canvas ref={this.child} className={"child"} width={`${size+border*2}px`} height={`${size+border*2}px`}>

                    </canvas>

                </div>

            </div>
        )
    }
}

export default Loading;