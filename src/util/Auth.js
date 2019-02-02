import Cookie from 'js-cookie'
import http from './http'
import Url from './Url'
import Storage from 'localforage'

let store = Storage.createInstance({
    name:'Tool',
    storeName:'Auth'
});

export default {
    AuthIDTag:'SessionUID',
    CommonTokenTag:'TokenID',
    getAuthID(){
        return Cookie.get(this.AuthIDTag)
    },
    async getAuthIDAsync(){
        try{
            let value = this.getAuthID()
            if(value){
                return Promise.resolve(value)
            }
            value = await store.getItem(this.AuthIDTag)
            return Promise.resolve(value)
        }catch(err){
            return Promise.reject(err)
        }
    },
    clearAuthID(){
        Cookie.remove(this.AuthIDTag)
        this.clearAuthIDAsync()
    },
    async clearAuthIDAsync(){
        try{
            await store.removeItem(this.AuthIDTag)
            return Promise.resolve()
        }catch(err){
            return Promise.reject(err)
        }
    },
    async setAuthIDAsync(auth){
        try{
            let value = store.setItem(this.AuthIDTag,auth)
            return Promise.resolve(value)
        }catch(err){
            return Promise.reject(err)
        }
    },
    async checkAuthID(){
        const auth = this.getAuthID()
        if(!auth){
            return Promise.reject('未登录')
        }
        try{
            var result = await http.get(Url.CheckAuthID)
        }catch(e){
            return Promise.reject(e.message || e)
        }
        this.setAuthIDAsync(auth)
        return Promise.resolve(result)
    },
    async signIn(data={}){
        let result
        try{
            result = await http.post(Url.SignIn,data)
        }catch(err){
            return Promise.reject(err.message || err)
        }
        if(!result.success) return Promise.reject(result.error || result.msg || '登录失败')

        this.saveAuthID(result.AuthID,result.expires)

        return Promise.resolve(result)

    },
    saveAuthID(id,expires=86400){
        if(!id){
            throw new Error('保存登录信息失败：没有登录信息')
            return
        }
        Cookie.set(this.AuthIDTag,id,{expires:expires/3600/24})
        this.setAuthIDAsync(id)
        console.log('已保存登录信息')
    },

    // 读取本地公共token
    getCommonToken(){
        return Cookie.get(this.CommonTokenTag)
    },

    async getCommonTokenAsync(){
        try{
            let value = this.getCommonToken()
            if(value){
                return Promise.resolve(value)
            }
            value = await store.getItem(this.CommonTokenTag)
            return Promise.resolve(value)
        }catch(err){
            return Promise.reject(err)
        }
    },

    async setCommonTokenAsync(token){
        try{
            let value = store.setItem(this.CommonTokenTag,token)
            return Promise.resolve(value)
        }catch(err){
            return Promise.reject(err)
        }
    },

    // 获取公共token
    async fetchCommonToken(){
        try{
            var result = await http.get(Url.InitToken)
        }catch(e){
            return Promise.reject(e.message || e)
        }
        this.saveCommonToken(result.token,result.expires)
        return Promise.resolve(result)
    },

    async checkCommonToken(){
        const token = this.getCommonToken()
        if(!token){
            return Promise.reject('没有token')
        }
        try{
            var result = await http.get(Url.ValidateToken,{
                params:{
                    [this.CommonTokenTag]:token
                }
            })
        }catch(e){
            return Promise.reject(e.message)
        }
        this.setCommonTokenAsync(token)
        return Promise.resolve(result)
    },

    saveCommonToken(token,expires=259200){
        if(token){
            Cookie.set(this.CommonTokenTag,token,{expires:expires/3600/24})
            this.setCommonTokenAsync(token)
        }

    },

    async SignUp(data){
        let result
        try{
            result = await http.post(Url.SignUp,data)
        }catch(err){
            return  Promise.reject(err.message || err)
        }
        if(result.success){
            return Promise.resolve(result)
        }else{
            return Promise.reject(result.error || result.msg || '操作失败')
        }

    },

    signOut(){

        return http.get(Url.SignOut).then(res=>{

            if(res.success){
                this.clearAuthID()
                return Promise.resolve('操作成功')
            }else{
                return Promise.reject('操作失败')
            }
        }).catch(err=>{
            return Promise.reject('操作失败')
        })

    }
}