import React,{Component,createRef} from 'react'
import "./ProgressStyle.less"
import PropTypes from 'prop-types'
import cs from "classnames"

class Progress extends Component {

    static propTypes = {
        onChange:PropTypes.func,
        run:PropTypes.number,
        stop:PropTypes.bool,
        progress:PropTypes.number,
    }

    static defaultProps = {
        onChange:function(){},
        run:60,
        stop:true,
        progress:0
    }

    state = {
        progress_played:0,
        progress_played_percent:0
    }

    wrapper = createRef()

    getSnapshotBeforeUpdate(props){
        let state = {}
        // console.log(props,this.props)
        // if(props.progress!==this.props.progress || props.progress!==this.state.progress_played_percent){
        if(props.progress!==this.state.progress_played_percent){
            // console.log(props,this.props)
            state.progress_played = this.props.progress*this.wrapper_width()
            state.progress_played_percent = this.props.progress
            return state
        }
        return null

    }

    componentDidUpdate(prevProps, prevState, snapshot){
        const {state} = this
        if(snapshot===null){
            return;
        }
        if (state.progress_played_percent!==snapshot.progress_played_percent) {
            this.setState(snapshot)
        }
    }


    componentDidMount(){
        // console.log(this.wrapper_width())
        this.setState({
            progress_played:this.props.progress*this.wrapper_width()
        })
        window.addEventListener('resize',this.resize)
    }

    componentWillUnmount(){
        window.removeEventListener('resize',this.resize)
    }

    resize = () => {
        const width = this.wrapper_width()
        this.setState(({progress_played_percent})=>({
            wrapper_width:width,
            progress_played:width*progress_played_percent
        }))
    }

    wrapper_width(){
        let {wrapper} = this
        if(!wrapper || !wrapper.current){
            return 0;
        }
        wrapper = wrapper.current
        return wrapper.clientWidth || 0
    }

    ProgressPoint = props => {
        let progress_init_x
        const onDrag = props.onDrag || function(){}
        const dragProgress = event => {
            event.preventDefault()
            event.stopPropagation()
            document.onselectstart = null
            document.addEventListener('mouseup',()=>{
                progress_init_x = null
                document.removeEventListener('mousemove',dragProgress)
            })
            const x = event.pageX===null?event.x:event.pageX

            onDrag(x - progress_init_x)
        }
        return (
            <span className={cs('wy-progress-point',props.className || '')}
                  style={props.style || {}}
                  onMouseDown={e=>{
                      e.preventDefault()
                      e.stopPropagation()
                      document.onselectstart = function(){return false}
                      progress_init_x = e.pageX
                      document.addEventListener('mousemove',dragProgress)
                  }}
                  onClick={e=>{
                      e.preventDefault()
                      e.stopPropagation()
                  }}
            >
                <i className="inner" />
            </span>
        )
    }



    render(){
        const {props} = this
        const {ProgressPoint} = this
        const {progress_played} = this.state
        const wrapper_width = this.wrapper_width()
        return (
            <div className={cs('wy-progress',props.className || '')}
                 style={Object.assign({

                 },props.style || {})}
                 ref={this.wrapper}
                 onClick={(e)=>{
                     const {nativeEvent} = e
                     const x = nativeEvent.layerX
                     const percent = x/this.wrapper_width()
                     props.onChange(percent)
                     this.setState({
                         progress_played:x,
                         progress_played_percent:percent
                     })
                 }}
            >
                <ProgressPoint className={'point'} onDrag={x=>{
                    this.setState(()=>{
                        x += progress_played
                        if(x<=0){
                            x = 0
                        }else if(x>=wrapper_width){
                            x = wrapper_width
                        }
                        props.onChange(x/wrapper_width)
                        return {
                            progress_played:x,
                            progress_played_percent:x/wrapper_width
                        }
                    })
                }} style={{
                    left:this.state.progress_played
                }} />

                <div className="played" style={{
                    width:progress_played
                }} />

            </div>
        )
    }
}

export default Progress