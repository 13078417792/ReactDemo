// @flow

import {action,observable} from 'mobx'
import {isEmpty} from 'lodash'
import Url from '@util/Url'
import http from '@util/http'

export default class IP {

    @observable home:object = {
        ip:'',
        port:''
    };
    part = ['home'];


    constructor(){
        this.update()
        this.autoUpdate(60000)
    }

    update(){
        this.part.forEach(el=>{
            this.updateIP(el)
        })
    }

    autoUpdate(time:number){
        if(isEmpty(time)) time = 60*1000*2
        setInterval(()=>{
            this.part.forEach(el=>{
                this.updateIP(el)
            })
        },time)
    }

    @action async updateIP(part:string){
        if(isEmpty(part) || !this.part.includes(part)) return Promise.reject(`${part}服务器不存在`)

        try{
            var result = await http.get(Url.ServiceIP,{
                params:{
                    part
                }
            })
        }catch(err){
            return Promise.reject(err)
        }

        if(!result.success){
            return Promise.reject(`${part}获取服务器IP失败`)
        }
        const {server_ip:ip,port} = result
        const setResult = this.setIP(part,ip,port)
        console.log(`${part}服务器IP:${ip},端口:${port}`)
        return setResult?Promise.resolve(result.server_ip):Promise.reject(`获取${part}服务器IP成功(${ip})，但设置服务器IP时出现错误`)
    }

    @action setIP(part:string,ip:string,port:number){
        if(isEmpty(part) || !this.part.includes(part)) return false
        if(isEmpty(ip)) return false
        this[part] = {
            ip,port
        }
        return true
    }


}