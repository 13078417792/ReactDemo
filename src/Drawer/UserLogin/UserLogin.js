import React,{Component} from 'react'
import {observer,inject} from "mobx-react"
import PropTypes from 'prop-types'
import './UserLoginStyle.less'
import {Form,Input,Button,Icon,message} from 'antd'
import Auth from '../../util/Auth'
import {Link} from 'react-router-dom'

const {Item:FormItem} = Form

@inject('stores')
@observer
class UserLogin extends Component{

    static propTypes = {
        onRegister:PropTypes.func,
        onSuccess:PropTypes.func
    }

    static defaultProps = {
        onRegister:function(){},
        onSuccess:function(){},
    }

    constructor(props){
        super(props)
        const {stores} = props
        console.log(stores)
    }

    onSuccess = () => {
        const {props:{onSuccess}} = this
        onSuccess()
    }

    submitForm = event => {
        event.preventDefault()
        const {props} = this
        const {stores:{AccountStatusStore}} = props
        const {form} = props
        form.validateFields(async (errors,values)=>{
            if(errors) return;

            try{
                await Auth.signIn(values)
            }catch(err){
                message.error(err)
                return;
            }
            AccountStatusStore.SignIn()
            message.success('登录成功')
            this.onSuccess()
        })
    }

    emitRegister = event => {
        event.preventDefault()
        const {onRegister} = this.props
        onRegister()
    }

    render(){
        const { getFieldDecorator } = this.props.form
        const {stores} = this.props
        const {AccountStatusStore} = stores
        if(!!AccountStatusStore.isLogin) return null
        return (
            <div className="user-login-drawer">

                <Form className="login-form" onSubmit={this.submitForm}>

                    <FormItem>
                        {
                            getFieldDecorator('username',{
                                rules:[{required:true,message:'请输入用户名'}]
                            })(
                                <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder='用户名'/>
                            )
                        }
                    </FormItem>

                    <FormItem>
                        {
                            getFieldDecorator('password',{
                                rules:[{required:true,message:'请输入密码'}]
                            })(
                                <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder='密码' type={"password"}/>
                            )
                        }
                    </FormItem>

                    <FormItem>
                        <Button type="primary" htmlType="submit" className="login-form-button">
                            登录
                        </Button>

                        <Link className="account-register-link" onClick={this.emitRegister}>去注册</Link>
                    </FormItem>


                </Form>
            </div>
        )
    }
}

export default Form.create({})(UserLogin)