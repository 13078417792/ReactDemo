// @flow
import Auth from '../util/Auth'
const {observable,action} = require('mobx')

// 定时检查登录状态的时间间隔
const CHECK_AUTH_TIME = 1000*60*5

// const CHECK_AUTH_TIME = 5000

export default class AccountStatus {

    @observable isLogin:boolean = false;
    @observable initCheckingLogin:boolean = true;
    @observable checkingAuth:boolean = false;
    @observable AuthID:string = '';
    @observable Token:string = '';

    constructor(){
        this.checkCommonToken()
        this.onTimeCheckCommonToken()

        this.initAuthAndToken()

        this.checkAuth()
        this.onTimeCheckAuth()
        this.AuthID = Auth.getAuthID()
        this.Token = Auth.getCommonToken()
    }

    initAuthAndToken(){
        this.AuthID = Auth.getAuthID()
    }

    async checkCommonToken(){
        try{
            var {success} = await Auth.checkCommonToken()
        }catch(err){
            console.error(err)
            var {token} = await Auth.fetchCommonToken()
            this.Token = token
            return;
        }
        if(success) return;

        var {token} = await Auth.fetchCommonToken()
        // console.log(success,token)
        this.Token = token
    }

    // 定时检查普通token
    onTimeCheckCommonToken(){
        setInterval(()=>{
            this.checkCommonToken()
        },CHECK_AUTH_TIME)
    }

    // 定时检查登录状态
    onTimeCheckAuth(){
        setInterval(()=>{
            this.checkAuth()
        },CHECK_AUTH_TIME)
    }

    checkAuth(){
        this.checkingAuth = true
        const oldStatus = this.isLogin
        Auth.checkAuthID().then(result=>{
            this.isLogin = !!result.success
            if(!result.success){
                Auth.clearAuthID()
                this.setStatus(false)
                if(oldStatus){
                    window.location.href = '/'
                }
            }
            this.checkingAuth = false
            this.initCheckingLogin = false
        }).catch(err=>{
            this.isLogin = false
            this.AuthID = ''
            Auth.clearAuthID()
            this.setStatus(false)
            console.error(err)
            this.checkingAuth = false
            this.initCheckingLogin = false
            if(oldStatus){
                window.location.href = '/'
            }
        })
    }

    @action SignIn(){
        this.isLogin = true
        this.AuthID = Auth.getAuthID()
    }

    @action setStatus(status:boolean){
        this.isLogin = !!status
        this.AuthID = null
    }

    @action toggleStatus(){
        this.isLogin = !this.isLogin
        if(!this.isLogin){
            this.AuthID = null
        }
    }


}