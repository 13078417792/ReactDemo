import './SectionStyle.less'
import React,{Component,cloneElement} from 'react'
import PropTypes from 'prop-types'
import cs from 'classnames'
import {Link} from 'react-router-dom'

class Section extends Component{

    static propTypes = {
        title:PropTypes.string.isRequired,
        icon:PropTypes.element.isRequired,
        more:PropTypes.string,
        className:PropTypes.string,
    }

    static defaultProps = {
        more:'',
        className:''
    }

    Icon = (props) => {
        return cloneElement(this.props.icon,props)
    }


    render(){
        const {props:{title,className,more,children},Icon} = this
        return (
            <div className={cs('music-section',className)}>

                <div className="description-title">
                    <Icon className="icon" />
                    <span>{title}</span>


                    {
                        more?<Link className="more" to={more}>更多></Link>:null
                    }

                </div>

                {children}

            </div>
        )
    }
}

export default Section