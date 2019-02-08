import React,{Component} from 'react'
import {Form,message,Input,Button} from 'antd'
import './ModifyPasswordStyle.less'
import Url from '@util/Url'
import http from '@util/http'
import {inject} from 'mobx-react'

@inject('stores')
class ModifyPassword extends Component {

    static defaultProps = {
        onSuccess:function(){},
        onFail:function(){}
    }

    handleSubmit = e => {
        e.preventDefault();
        const {AccountStatusStore} = this.props.stores
        if(!AccountStatusStore.isLogin) {
            message.error('非法操作')
            return;
        }
        this.props.form.validateFields(['old_pwd','password','repeat_password'],{
            first:true
        },(err, values) => {
            if (err) return;
            console.log('Received values of form: ', values);
            http.post(Url.ModifyPassword,values).then(result=>{
                if(!result.success){
                    const error = result.error || result.msg || '操作失败'
                    message.error(error)
                    this.props.onFail(error)
                    return;
                }

                message.success('修改成功')
                this.props.onSuccess()
            }).catch(err=>{
                message.error('修改失败')
                console.error('修改密码时出错',err)
                this.props.onFail(err)
            })
        })
    }
    
    
    render(){
        const {AccountStatusStore} = this.props.stores
        const { getFieldDecorator } = this.props.form;
        return AccountStatusStore.isLogin?(
            <div className="modify-password">
                <Form onSubmit={this.handleSubmit} className="modify-password-form">
                    <Form.Item>
                        {getFieldDecorator('old_pwd', {
                            rules: [{ required: true, message: '必须输入原密码' }],
                            validateFirst:true,
                        })(
                            <Input  type="password" placeholder="原密码" />
                        )}
                    </Form.Item>
                    <Form.Item>
                        {getFieldDecorator('password', {
                            rules: [{ required: true, message: '必须输入新密码' }],
                            validateFirst:true,
                        })(
                            <Input  type="password" placeholder="新密码" />
                        )}
                    </Form.Item>

                    <Form.Item>
                        {getFieldDecorator('repeat_password', {
                            rules: [{ required: true, message: '必须输入确认密码' }],
                            validateFirst:true,
                        })(
                            <Input type="password" placeholder="确认密码" />
                        )}
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={{
                            width:'100%'
                        }}>
                            确认
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        ):(
            <div>
                请先登录
            </div>
        )
    }
    
    
}

export default Form.create({
    name:'modify_password'
})(ModifyPassword)