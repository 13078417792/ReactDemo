import React,{Component} from 'react'
import cs from 'classnames'
import './LayoutStyle.less'


export default class Layout extends Component{

    constructor(props){
        super(props)
        this.state = {
            mobileLeftSide:false
        }
    }

    toggleMobileLeftSide(){
        this.setState(state => ({mobileLeftSide:!state.mobileLeftSide}) )
    }

    handleContentTouchStart(e){
        // console.log(e)
        if(this.state.mobileLeftSide===true){
            e.stopPropagation()
            this.toggleMobileLeftSide()

        }
    }

    render(){
        // const buttonStyle = {
        //     height:'3em',
        //     width:'3em',
        //     lineHeight:'3em',
        //     fontSize:'1em'
        // }
        return (
            <div className="Layout">

                {/* 移动端头部 */}
                <div className="mobile-header" style={{
                    // background:theme.acrylicTexture60.background
                    background:'rgba(0,0,0,.1)'
                }}>

                    <div className="menu-rt-btn">
                        <div className="menu-rt-btn-scroll-container" style={{
                            transform:`translateX(${this.state.mobileLeftSide?'-100%':0})`
                        }}>

                        </div>
                    </div>

                </div>


                <div id="content">


                    {/*PC默认显示 移动端默认隐藏*/}
                    <div id="left-side-bar" className={cs({expand:this.state.mobileLeftSide})} style={{
                        // background:theme.acrylicTexture60.background
                        background:'rgba(0,0,0,.1)'
                    }}>

                    </div>

                    <div id="right-content-wrap" onTouchStart={this.handleContentTouchStart.bind(this)}>
                        <div className="right-content">
                            {this.props.children}
                        </div>

                    </div>
                </div>
            </div>
        )
    }
}