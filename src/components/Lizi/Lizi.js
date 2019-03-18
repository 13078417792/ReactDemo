import React,{Component} from 'react'
import PropTypes from 'prop-types'
import Chance from 'chance'
import {realPixel} from '@util/Helper'

const chance = new Chance();
let size = 2.5;

if(document.body.clientWidth<768){
    size = 4;
}

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

        let maxCount = 150
        if(document.body.clientWidth<768){
            maxCount = 50
        }else if(document.body.clientWidth<1024){
            maxCount = 80
        }

        this.state = {
            config:{
                count:props.count>maxCount?maxCount:props.count,
                color:props.color,
                bgcolor:props.bgcolor,
                size,

                // 两点连线的最长距离
                maxLinkDistance:150
            },
            load:false,
            canvasWidth:0,
            canvasHeight:0,

            // 边缘范围
            edge:[{min:0,max:0},{min:0,max:0}],

            pointList:[],
            animationTime:0,
        }

    }



    componentDidMount(){
        this.setState({
            load:true
        })

        // 根据像素比计算canvas容器的宽高
        let canvasWidth = document.body.clientWidth
        let canvasHeight = document.body.clientHeight
        const ctx = this.getContext()
        canvasWidth = realPixel(canvasWidth,ctx)
        canvasHeight = realPixel(canvasHeight,ctx)
        this.setState({
            canvasWidth,
            canvasHeight,
            edge:[{
                min:size,
                max:canvasWidth - size
            },{
                min:size,
                max:canvasHeight - size
            }],
            size:realPixel(size,ctx)
        },()=>{
            // 计算canvas容器的宽高再监听页面尺寸变化，避免出错
            window.addEventListener('resize',this.computedCanvasSize)
            this.createPoint(true).then(()=>{
                this.drawPoint()
            }).catch(err=>{
                console.error(err)
            })
        })

    }

    componentWillUnmount(){
        cancelAnimationFrame(this.animationIndex)
        window.removeEventListener('resize',this.computedCanvasSize)
    }

    computedCanvasSize = () => {
        if(this.resizeTimeoutIndex) clearTimeout(this.resizeTimeoutIndex)
        if(this.animationIndex) cancelAnimationFrame(this.animationIndex)
        this.animationIndex = null
        this.resizeTimeoutIndex = setTimeout(()=>{
            const ctx = this.getContext()
            this.setState(({pointList,config:{size}})=>{
                const canvasWidth = realPixel(document.body.clientWidth,ctx)
                const canvasHeight = realPixel(document.body.clientHeight,ctx)
                return {
                    canvasWidth,
                    canvasHeight,
                    edge:[{
                        min:size,
                        max:canvasWidth - size
                    },{
                        min:size,
                        max:canvasHeight - size
                    }],
                    pointList:pointList.map(el=>{
                        if(el.positionX>canvasWidth){
                            el.positionX = canvasWidth - (size*3)
                        }else if(el.positionX < (size*3) ){
                            el.positionX = (size*3)
                        }
                        if(el.positionY>canvasHeight){
                            el.positionY = canvasHeight - (size*3)
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

    /**
     * 生成运动角度
     * @returns {number}
     */
    createAngle(){
        const notAllow = [0,90,180,270,360]
        let num = chance.integer({min:1,max:4})
        let angle = chance.integer({min:20,max:75})*num
        while(notAllow.includes(angle)){
            angle = chance.integer({min:20,max:75})*num
        }
        return angle - 90
    }

    /**
     * 创建粒子点数据（位置坐标，运放方向/角度，横向速度，纵向速度）
     * @returns {Promise<any>}
     */
    createPoint(){
        return new Promise((resolve,reject)=>{
            const speedRange = {min:8.5,max:10}
            // const speedRange = {min:0.1,max:0.3}
            try{
                let list = []
                const {config:{count,size},canvasWidth:width,canvasHeight:height} = this.state
                for(let i=0;i<count;i++){
                    const positionX = chance.integer({min:size/2,max:width - (size/2)})
                    const positionY = chance.integer({min:size/2,max:height - (size/2)})
                    list.push({
                        positionX,
                        positionY,
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

    /**
     * 绘制点
     */
    drawPoint(){
        const {pointList,config:{size,color,maxLinkDistance},canvasWidth:width,canvasHeight:height} = this.state
        const ctx = this.getContext()
        ctx.clearRect(0,0,width,height)
        ctx.fillStyle = color
        ctx.strokeStyle = color

        pointList.forEach(el=>{
            ctx.beginPath()
            ctx.arc(el.positionX,el.positionY,size/2,0,(Math.PI/180)*360)
            ctx.globalAlpha = 1
            ctx.fill()
            ctx.stroke()
            ctx.closePath()

            pointList.forEach(itemEl=>{
                if(itemEl===el) return;
                const diffX = Math.abs(itemEl.positionX - el.positionX)
                const diffY = Math.abs(itemEl.positionY - el.positionY)
                const distance = Math.sqrt(Math.pow(diffX,2) + Math.pow(diffY,2))
                if(distance<maxLinkDistance){
                    ctx.lineWidth = realPixel(0.25,this.getContext())
                    ctx.strokeStyle = color

                    ctx.beginPath()
                    ctx.moveTo(el.positionX,el.positionY)
                    let globalAlpha = (maxLinkDistance-distance)/distance
                    if(globalAlpha>1){
                        globalAlpha = 1
                    }else if(globalAlpha<0){
                        globalAlpha = 0
                    }
                    ctx.globalAlpha = globalAlpha
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
        this.setState(({pointList,config:{size,color},canvasWidth:width,canvasHeight:height,animationTime,edge})=>({
            pointList:pointList.map(el=>{
                if(el.positionX>edge[0].max){
                    el.positionX = edge[0].max
                    el.speedX *= -1
                }else if(el.positionX<edge[0].min){
                    el.positionX = edge[0].min
                    el.speedX *= -1
                }
                if(el.positionY>edge[1].max){
                    el.positionY = edge[1].max
                    el.speedY *= -1
                }else if(el.positionY<edge[1].min){
                    el.positionY = edge[1].min
                    el.speedY *= -1
                }
                const t = time - animationTime
                let changeY = el.speedY * (t/1000)
                let changeX = el.speedX * (t/1000)
                if(!(el.angle>-90 && el.angle<90)) changeX *= -1
                el.positionX += changeX
                el.positionY += changeY
                return el
            }),
            animationTime:time
        }),this.drawPoint)

    }

    getCanvas(){
        return this.canvas.current
    }

    getContext(){
        const canvas = this.getCanvas()
        return canvas?canvas.getContext('2d'):null
    }

    render(){
        const {state,state:{canvasWidth,canvasHeight},props} = this
        return (
            <canvas ref={this.canvas} width={canvasWidth} height={canvasHeight} style={{
                position:'fixed',
                top:0,
                left:0,
                zIndex:props.zIndex,
                backgroundColor:state.config.bgcolor,
                width:`${document.body.clientWidth}px`,
                height:`${document.body.clientHeight}px`
                // width:'100vw',
                // height:'100vh'
            }}>

            </canvas>
        )
    }
}