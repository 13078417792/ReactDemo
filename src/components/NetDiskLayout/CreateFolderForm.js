import React,{Component} from 'react'
// import cs from 'classnames'
import {message,Input,Button,Form} from 'antd'
import PropTypes from 'prop-types'
import http from '@util/http'

export default Form.create()(class CreateFolderForm extends Component{


    static propTypes = {
        onSubmit:PropTypes.func,
        onClose:PropTypes.func,
        onFail:PropTypes.func,
        api:PropTypes.string.isRequired,
        folderField:PropTypes.string,
        params:PropTypes.object
    }

    static defaultProps = {
        onSubmit:function(){},
        onFail:function(){},
        onClose:function(){},
        params:{},
        folderField:'name',

    }

    handleSubmit = e => {
        const {getFieldValue} = this.props.form
        e.preventDefault()
        const hide = message.loading('正在创建...')
        // this.props.onSubmit(getFieldValue('name'))
        this.submit(getFieldValue('name')).then(result=>{
            hide()
            this.props.onSubmit(result)
        }).catch(err=>{
            hide()
            this.props.onFail(err)
        })
    }

    submit = async name => {
        const {props} = this
        const {params,api} = props
        let data = {
            [props.folderField]:name
        }
        if(!params.hasOwnProperty('parent')) return Promise.reject('缺少parent字段')
        if(params.hasOwnProperty(props.folderField)) delete params[props.folderField]
        data = Object.assign({},data,params)

        try{
            var result = await http.post(api,data)
        }catch(err){
            return Promise.reject(err)
        }
        if(!result.success) return Promise.reject(result.error || result.msg || '操作失败')
        return Promise.resolve(result)
    }


    render(){
        const {getFieldDecorator} = this.props.form
        return (
            <Form layout="inline" style={{
                display:'flex',
                justifyContent:'flex-start',
                alignItem:'center'
            }} onSubmit={this.handleSubmit}>
                <Form.Item>
                    {
                        getFieldDecorator('name')(
                            <Input size="small" />
                        )
                    }
                </Form.Item>

                <Form.Item>

                    <Button icon="check" size="small" htmlType="submit"  style={{
                        margin:'0 5px 0 -10px'
                    }} />
                    <Button icon="close" size="small" onClick={e=>this.props.onClose()} />
                </Form.Item>
            </Form>
        )
    }
})