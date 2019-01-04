import React,{Component} from 'react'
import cs from 'classnames'
import './LayoutStyle.less'
import PropTypes from 'prop-types'
// import NavigationView from "react-uwp/NavigationView";
import IconButton from "react-uwp/IconButton";


export default class Layout extends Component{

    static contextTypes = { theme: PropTypes.object }

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
        const {theme} = this.context
        // console.log(this.context,theme.acrylicTexture40.background)
        const buttonStyle = {
            height:'3em',
            width:'3em',
            lineHeight:'3em',
            fontSize:'1em'
        }
        return (
            <div className="Layout" style={{
                background:theme.acrylicTexture40.background
            }}>

                {/* 移动端头部 */}
                <div className="mobile-header" style={{
                    // background:theme.acrylicTexture60.background
                    background:'rgba(0,0,0,.1)'
                }}>

                    <div className="menu-rt-btn">
                        <div className="menu-rt-btn-scroll-container" style={{
                            transform:`translateX(${this.state.mobileLeftSide?'-100%':0})`
                        }}>
                            <IconButton style={buttonStyle} hoverStyle={{
                                backgroundColor:'rgba(0,0,0,0)'
                            }} activeStyle={{
                                backgroundColor:'rgba(0,0,0,0)'
                            }} onClick={this.toggleMobileLeftSide.bind(this)}>
                                GlobalNavButton
                            </IconButton>
                            <IconButton style={buttonStyle} hoverStyle={{
                                backgroundColor:'transparent'
                            }} activeStyle={{
                                backgroundColor:'transparent'
                            }} onClick={this.toggleMobileLeftSide.bind(this)}>
                                BackBttnArrow42Legacy
                            </IconButton>

                        </div>
                    </div>

                </div>


                <div id="content">


                    {/*PC默认显示 移动端默认隐藏*/}
                    <div id="left-side-bar" className={cs({expand:this.state.mobileLeftSide})} style={{
                        background:theme.acrylicTexture60.background
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