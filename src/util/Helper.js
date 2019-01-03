function isFmt(data,fmt){
    return toString.call(data)===`[object ${fmt.ucfirst()}]`
}

String.prototype.ucfirst = function(){
    if(this.toString().length===0){
        return ''
    }
    let str = this.toString()
    let rtStr = ''
    rtStr += str[0].toUpperCase()
    rtStr += str.slice(1,str.length)
    return rtStr
}

let Helper = {
    isFmt,
    isFile(file){
        // return toString.call(file)==='[object File]'
        return isFmt(file,'file')
    },
    isArray(data){
        // return (Array.isArray && Array.isArray(data)) || toString.call(data)==='[object Array]'
        return (Array.isArray && Array.isArray(data)) || isFmt(data,'array')
    },
    isObject(data){
        // return toString.call(data)==='[object Object]'
        return isFmt(data,'object')
    },

    isInt(data){
        return isFmt(data,'number') || parseFloat(data)==data
    },

    isString(data){
        return isFmt(data,'string')
    },

    ucfirst(str){
        return str.ucfirst()
    }
}

export default Helper