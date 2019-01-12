import React,{Component} from 'react'
import './HeaderSearchStyle.less'
import { Input } from 'antd'
const Search = Input.Search


export default class HeaderSearch extends Component{

    render(){
        // console.log(TextBox)
        return (
            <div className="header-search">

                <Search />
            </div>
        )
    }
}