// @flow

import {action,observable} from 'mobx'
import {isEmpty} from 'lodash'
import Url from '@util/Url'
import http from '@util/http'

export default class IP {

    @observable home:string = '';
    part = ['home'];

    @action async updateIP(part:string){
        if(isEmpty(part) || !this.part.includes(part)) return Promise.reject('服务器不存在')

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
            return Promise.reject('获取服务器IP失败')
        }
        const {server_ip:ip} = result
        const setResult = this.setIP(part,ip)

        return setResult?Promise.resolve(result.server_ip):Promise.reject('获取数据成功，但设置服务器IP时出现错误')
    }

    @action setIP(part:string,ip:string){
        if(isEmpty(part) || !this.part.includes(part)) return false
        if(isEmpty(ip)) return false
        this[part] = ip
        return true
    }


}