import React,{Component} from 'react'
import './HeaderSearchStyle.less'
import {AutoSuggestBox} from 'react-uwp'


export default class HeaderSearch extends Component{

    render(){
        // console.log(TextBox)
        return (
            <div className="header-search">
                <AutoSuggestBox style={{
                    transform:'translateX(-50%)',
                    marginLeft:'50%'
                }} focusStyle={{
                    backgroundColor:'rgba(0,0,0,0)'
                }} />
            </div>
        )
    }
}