import React,{Component} from 'react'
import PropTypes from 'prop-types'
import Chance from 'chance'

const chance = new Chance();

export default class Lizi extends Component{


    static propTypes = {

        // 粒子数量
        count:PropTypes.number,

        // 粒子/线条颜色
        color:PropTypes.string,

        // 背景颜色
        bgcolor:PropTypes.string,

        zIndex:PropTypes.number
    }

    static defaultProps = {
        count:50,
        color:'#01AAED',
        bgcolor:'#f0f0f0',
        zIndex:-1
    }

    animationIndex = null
    resizeTimeoutIndex = null

    constructor(props){
        super(props)
        this.canvas = React.createRef()

        let maxCount = 80
        if(document.body.clientWidth<1024){
            maxCount = 20
        }

        this.state = {
            config:{
                count:props.count>maxCount?maxCount:props.count,
                color:props.color,
                bgcolor:props.bgcolor,
                size:2,

                // 两点连线的最长距离
                maxLinkDistance:150
            },
            load:false,
            canvasWidth:document.body.clientWidth,
            canvasHeight:document.body.clientHeight,
            pointList:[],
            animationTime:0,
        }

    }

    convertColor(){
        const {state} = this
        const {config:{color}} = state
        const hex = /^#[0-9a-z]/gi
        const dec = /^(rgb|rgba)\(\d{3},\d{3},\d{3}(,0*\.*\d*)\)/
    }

    componentDidMount(){
        const {canvasWidth:width,canvasHeight:height} = this.state
        this.setState({
            load:true
        })
        window.addEventListener('resize',this.computedCanvasSize)

        this.createPoint().then(()=>{
            this.drawPoint()
        }).catch(err=>{
            console.error(err)
        })




    }

    componentWillUnmount(){
        window.removeEventListener('resize',this.computedCanvasSize)
    }

    computedCanvasSize = () => {
        if(this.resizeTimeoutIndex) clearTimeout(this.resizeTimeoutIndex)
        if(this.animationIndex) cancelAnimationFrame(this.animationIndex)
        this.animationIndex = null
        this.resizeTimeoutIndex = setTimeout(()=>{
            this.setState(({pointList,config:{size}})=>{

                return {
                    canvasWidth:document.body.clientWidth,
                    canvasHeight:document.body.clientHeight,
                    pointList:pointList.map(el=>{
                        if(el.positionX>document.body.clientWidth){
                            el.positionX = document.body.clientWidth - (size*3)
                        }else if(el.positionX < (size*3) ){
                            el.positionX = (size*3)
                        }
                        if(el.positionY>document.body.clientHeight){
                            el.positionY = document.body.clientHeight - (size*3)
                        }else if(el.positionY < (size*3) ){
                            el.positionY = (size*3)
                        }
                        return el
                    })
                }
            },this.drawPoint)
            this.resizeTimeoutIndex = null
        },200)

    }

    createAngle(){
        const notAllow = [0,90,180,270,360]
        let num = chance.integer({min:1,max:4})
        let angle = chance.integer({min:20,max:75})*num
        while(notAllow.includes(angle)){
            angle = chance.integer({min:20,max:75})*num
        }
        return angle - 90
    }

    createPoint(){
        return new Promise((resolve,reject)=>{
            const speedRange = {min:8,max:10}
            try{
                let list = []
                const {config:{count,size},canvasWidth:width,canvasHeight:height} = this.state
                for(let i=0;i<count;i++){
                    list.push({
                        positionX:chance.integer({min:size/2,max:width - (size/2)}),
                        positionY:chance.integer({min:size/2,max:height - (size/2)}),
                        angle:this.createAngle(),
                        speedX:chance.floating(speedRange),
                        speedY:chance.floating(speedRange)
                    })
                }
                this.setState({
                    pointList:list
                },resolve)
            }catch(err){
                reject(err)
            }

        })
    }

    drawPoint(){
        const {pointList,config:{size,color,maxLinkDistance},canvasWidth:width,canvasHeight:height} = this.state
        const ctx = this.getContext()
        ctx.clearRect(0,0,width,height)
        ctx.fillStyle = color
        ctx.strokeStyle = color

        pointList.forEach(el=>{
            ctx.beginPath()
            ctx.arc(el.positionX,el.positionY,size/2,0,(Math.PI/180)*360)
            ctx.fill()
            ctx.stroke()
            ctx.closePath()

            pointList.forEach(itemEl=>{
                if(itemEl===el) return;
                const diffX = Math.abs(itemEl.positionX - el.positionX)
                const diffY = Math.abs(itemEl.positionY - el.positionY)
                const distance = Math.sqrt(Math.pow(diffX,2) + Math.pow(diffY,2))
                if(distance<maxLinkDistance){
                    ctx.lineWidth = 1
                    ctx.strokeStyle = color
                    ctx.globalAlpha = (maxLinkDistance-distance)/distance
                    // console.log(ctx.globalAlpha)
                    ctx.beginPath()
                    ctx.moveTo(el.positionX,el.positionY)
                    ctx.lineTo(itemEl.positionX,itemEl.positionY)

                    ctx.stroke()
                    ctx.closePath()
                }
            })
        })
        this.animationIndex = requestAnimationFrame(this.run)

    }

    // 粒子运动
    run = time => {
        // console.log('run',time)
        this.setState(({pointList,config:{size,color},canvasWidth:width,canvasHeight:height,animationTime})=>({
            pointList:pointList.map(el=>{
                if(el.positionX>width || el.positionX<size/2){
                    el.speedX *= -1
                }
                if(el.positionY>height || el.positionY<size/2){
                    el.speedY *= -1
                }
                const t = time - animationTime
                let changeY = Math.tan(Math.PI/180*el.angle)*el.speedY * (t/1000)
                let changeX = el.speedX * (t/1000)
                // console.log(t/1000*el.speed)
                if(!(el.angle>-90 && el.angle<90)) changeX *= -1
                el.positionX += changeX
                el.positionY += changeY

                return el
            }),
            animationTime:time
        }),this.drawPoint)

        // console.log(newPointList)
    }

    getCanvas(){
        return this.canvas.current
    }

    getContext(){
        return this.getCanvas().getContext('2d')
    }

    render(){
        const {state,props} = this
        return (
            <canvas ref={this.canvas} width={state.canvasWidth} height={state.canvasHeight} style={{
                position:'fixed',
                top:0,
                left:0,
                zIndex:props.zIndex,
                backgroundColor:state.config.bgcolor
            }}>

            </canvas>
        )
    }
}