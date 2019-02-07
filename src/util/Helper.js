import Config from './Config'
import Url from './Url'
import OuterUrl from './OuterUrl'
import {isString} from 'lodash'

function isFmt(data,fmt){
    // return toString.call(data)===`[object ${fmt.ucfirst()}]`
    return toString.call(data)===`[object ${ucfirst(fmt)}]`
}

// String.prototype.ucfirst = function(){
//     if(this.toString().length===0){
//         return ''
//     }
//     let str = this.toString()
//     let rtStr = ''
//     rtStr += str[0].toUpperCase()
//     rtStr += str.slice(1,str.length)
//     return rtStr
// }

// Object.defineProperty(String.prototype,'ucfirst',{
//     enumerable:false,
//     writable:false,
//     value:function(){
//         if(this.toString().length===0){
//             return ''
//         }
//         let str = this.toString()
//         let rtStr = ''
//         rtStr += str[0].toUpperCase()
//         rtStr += str.slice(1,str.length)
//         return rtStr
//     }
// })

function ucfirst(str){
    if(isString(str) && str.length===0){
        return ''
    }
    let rtStr = ''
    rtStr += str[0].toUpperCase()
    rtStr += str.slice(1,str.length)
    return rtStr
}

let Helper = {
    isFmt,
    isFile(file){
        return isFmt(file,'file')
    },
    isArray(data){
        return (Array.isArray && Array.isArray(data)) || isFmt(data,'array')
    },
    isObject(data){
        return isFmt(data,'object')
    },

    isInt(data){
        return isFmt(data,'number') || parseFloat(data)===data
    },

    isString(data){
        return isFmt(data,'string')
    },

    ucfirst(str){
        return ucfirst(str)
    },

    config(name,value){
        if(name===undefined){
            return Config
        }
        if(value===undefined){
            return Config[name]
        }
        Config[name] = value
    },

    getUrl(name){
        if(!name){
            throw new Error('获取链接失败')
        }
        if(!Url[name]){
            throw new Error(`${name}链接无效`)
        }
        return Url[name]
    },
    getOuterUrl(name){
        if(!name){
            throw new Error('获取外链失败')
        }
        if(!OuterUrl[name]){
            throw new Error(`${name}链接无效`)
        }
        return OuterUrl[name]
    }
}

export default Helper