import React,{Component,Fragment} from 'react'
import {Form,message,Icon,Button,Input} from 'antd'
import PropTypes from 'prop-types'
import './NameFormStyle.less'
import http from '@util/http'

const {Item:FormItem} = Form
class NameForm extends Component{

    static propTypes = {
        show:PropTypes.bool,
        onClose:PropTypes.func,
        initialValue:PropTypes.string,
        isInsert:PropTypes.bool,
        api:PropTypes.string.isRequired,
        params:PropTypes.object,
        field:PropTypes.string,
        onComplete:PropTypes.func,
        onSuccess:PropTypes.func,
        onFail:PropTypes.func,
    }

    static defaultProps = {
        show:false,
        onClose:function(){},
        initialValue:'',
        isInsert:false,
        field:'name',
        params:{},
        onComplete:function(){},
        onSuccess:function(){},
        onFail:function(){}
    }

    submit = e => {
        e.preventDefault()
        const {props} = this
        const {validateFields,getFieldValue,getFieldsError} = props.form
        validateFields((errors,values)=>{
            if(errors){
                // message.error(getFieldsError().name[0])
                props.onFail(getFieldsError().name[0])
                return;
            }
            const post_data = Object.assign({
                [props.field]:getFieldValue('name')
            },props.params)
            http.post(props.api,post_data).then(result=>{

                if(result.success){
                    props.onSuccess(result)
                }else{
                    props.onFail(result.error||result.msg || '操作失败')
                }

                props.onComplete({
                    response:true,
                    result
                })
            }).catch(err=>{

                props.onFail(err)
                props.onComplete({
                    response:false,
                    error:err
                })
            })
        })
    }

    render(){
        const {props} = this
        const {getFieldDecorator} = props.form
        return props.show?(
            <Form layout="inline" onSubmit={this.submit} size="small" className="rename-form">

                <FormItem help="">
                    {
                        getFieldDecorator('name',{
                            initialValue:props.initialValue,
                            validateFirst:true,
                            rules:[{
                                required:true,message:'必须输入文件/文件夹名称'
                            }]
                        })(
                            <Input size="small" />
                        )
                    }
                </FormItem>

                <FormItem>
                    <Button icon="check" htmlType="submit" size="small" />
                    <Button icon="close" onClick={()=>{
                        props.onClose()
                    }} size="small" />
                </FormItem>
            </Form>
        ):null
    }
}

export default Form.create()(NameForm)