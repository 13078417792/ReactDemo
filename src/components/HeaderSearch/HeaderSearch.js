import React,{Component} from 'react'
import './HeaderSearchStyle.less'
import { Input ,Button,Icon} from 'antd'
import PropTypes from 'prop-types'


export default class HeaderSearch extends Component{

    static propTypes = {
        onSearch:PropTypes.func.isRequired,
        onClear:PropTypes.func.isRequired,
        placeholder:PropTypes.string
    }

    static defaultProps = {
        onSearch:function(){},
        onClear:function(){},
        placeholder:'搜索'
    }

    timeIndex = null

    render(){
        return (
            <div className="header-search">

                <Input placeholder={this.props.placeholder} allowClear onChange={e=>{
                    const value = e.target.value
                    if(!value){
                        this.props.onClear()
                        if(this.timeIndex){
                            clearTimeout(this.timeIndex)
                            this.timeIndex = null
                        }
                        return;
                    }
                    if(this.timeIndex){
                        clearTimeout(this.timeIndex)
                        this.timeIndex = null
                        return;
                    }
                    this.timeIndex = setTimeout(()=>{
                        this.props.onSearch(value)
                        this.timeIndex = null
                    },300)

                }} onPressEnter={e=>{
                    this.props.onSearch(e.target.value)
                }}/>
            </div>
        )
    }
}