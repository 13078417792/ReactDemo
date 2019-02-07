import React,{Component} from 'react'
import PropTypes from 'prop-types'
import cs from 'classnames'
import {Icon} from 'antd'
import './NetDiskSideStyle.less'
import {withRouter} from 'react-router'
import {Link} from 'react-router-dom'
import {toJS,computed} from 'mobx'
import {inject} from 'mobx-react'

@inject('stores')
class NetDiskSide extends Component{

    static propTypes = {
        className:PropTypes.string,
        match: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired
    }

    static defaultProps = {
        className:''
    }

    state = {
        menu:[
            {
                label:'全部文件',
                url:'/disk/content',
                icon:'file',
            },{
                label:'回收站',
                url:'/disk/rubbish',
                icon:'delete'
            }
        ],
        dom:[]
    }

    @computed get router(){
        const store = this.props.stores.RouterStore.list
        return Object.values(toJS(store))
    }

    Side = (data,level=1) => {
        const {match} = this.props
        if(!data) return null;
        let list = data.map((el,index)=>{
            let item = [
                (
                    <li key={index} style={{
                        paddingLeft:`${level*1}em`,
                    }} className={cs({
                        on:match.path.indexOf(el.url)===0
                    })}
                    >
                        <Link to={el.url}>
                            {
                                el.icon?(
                                    <span className="layout-side-item-icon">
                                        <Icon type={el.icon}></Icon>
                                    </span>
                                ):null
                            }
                            <span className="label">
                                {el.label}
                            </span>
                        </Link>
                    </li>
                )
            ]
            if(el.child){
                const Side = this.Side.bind(this,el.child,level+1)
                item.push(<ul key={`${index}0`}>
                    <Side />
                </ul>)
            }
            return item
        })
        return list
    }

    render(){
        const {props} = this
        const {menu} = this.state
        const Side = this.Side.call(this,menu)
        return (
            <div className={cs('network-disk-side',props.className)}>

                <ul>
                    {
                        Side.map(el=>el)
                    }
                </ul>
            </div>
        )
    }
}

export default withRouter(NetDiskSide)