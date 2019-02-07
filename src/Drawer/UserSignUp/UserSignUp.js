import React,{Component} from 'react'
import {observer,inject} from "mobx-react"
import PropTypes from 'prop-types'
import './UserSignUpStyle.less'
import {Form,Input,Button,Icon,message} from 'antd'
import Auth from '../../util/Auth'
import {Link} from 'react-router-dom'

const {Item:FormItem} = Form

@inject('stores')
@observer
class UserSignUp extends Component{

    static propTypes = {
        onLogin:PropTypes.func,
        onSuccess:PropTypes.func
    }

    static defaultProps = {
        onLogin:function(){},
        onSuccess:function(){}
    }

    onSuccess = () => {
        const {onSuccess} = this.props
        onSuccess()
    }

    submitForm = event => {
        event.preventDefault()
        const {props} = this
        const {form} = props
        form.validateFields({
            first:false
        },async (errors,value)=>{
            if(!errors){
                // console.log('submit',value)
                // let result
                try{
                    await Auth.SignUp(value)
                }catch(err){
                    message.error(err)
                    return;
                }
                form.resetFields()
                message.success('注册成功')
                this.onSuccess()
            }
        })
    }

    emitLogin = event => {
        event.preventDefault()
        const {onLogin} = this.props
        onLogin()
    }

    render(){
        const {form} = this.props
        const { getFieldDecorator } = form
        const {stores} = this.props
        const {AccountStatusStore} = stores
        if(!!AccountStatusStore.isLogin) return null
        return (
            <div className="user-signup-drawer">

                <Form className="login-form" onSubmit={this.submitForm}>

                    <FormItem>
                        {
                            getFieldDecorator('username',{
                                rules:[{required:true,message:'请输入用户名'},{
                                    min:5,message:'用户名长度为5-30个字符'
                                },{
                                    max:30,message:'用户名长度为5-30个字符'
                                },{
                                    // pattern:/^[a-z0-9_]+$/gi,message:'允许的字符：大小写英文/数字/下划线'
                                }],
                                validateFirst:true
                            })(
                                <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder='用户名'/>
                            )
                        }
                    </FormItem>

                    <FormItem>
                        {
                            getFieldDecorator('password',{
                                rules:[{required:true,message:'请输入密码'},{
                                    min:8,message:'密码太短，不得少于8个字符'
                                },{
                                    max:30,message:'密码超长，不得多于30个字符'
                                },{
                                    pattern:/^[a-z0-9*.\-%&@#$&+,_]+$/gi,message:'允许的字符：大小写英文/数字,特殊字符：*.-%&@#$&+_,'
                                }],
                                validateFirst:true
                            })(
                                <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder='密码' type={"password"}/>
                            )
                        }
                    </FormItem>

                    <FormItem>
                        {
                            getFieldDecorator('repeat_password',{
                                rules:[{required:true,message:'请再次输入密码'},{
                                    validator:(rule, value, callback)=>{
                                        // console.log(form.getFieldValue('password'))
                                        if(value!==form.getFieldValue('password')){
                                            callback(new Error('两次输入的密码不一致'))
                                        }else{
                                            callback()
                                        }
                                    }
                                }],
                                validateFirst:true
                            })(
                                <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder='重复密码' type={"password"}/>
                            )
                        }
                    </FormItem>

                    <FormItem>
                        <Button type="primary" htmlType="submit" className="login-form-button">
                            注册
                        </Button>

                        <Link  to="" className="account-login-link" onClick={this.emitLogin}>去登录</Link>
                    </FormItem>


                </Form>
            </div>
        )
    }
}

export default Form.create({})(UserSignUp)