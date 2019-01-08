import helper from './Helper'
File.prototype.toBase64 = function(){
    return new Promise((resolve,reject)=>{
        // console.log(this)

        const file = this
        const reader = new FileReader()
        reader.onload = function(){
            resolve(reader.result)
        }

        reader.onerror = function(){
            reject(reader.error)
        }

        reader.readAsDataURL(file)
    })
}

File.prototype.toArrayBuffer = function(){
    return new Promise((resolve,reject)=>{
        // console.log(this)

        const file = this
        const reader = new FileReader()
        reader.onload = function(){
            resolve(reader.result)
        }

        reader.onerror = function(){
            reject(reader.error)
        }

        reader.readAsArrayBuffer(file)
    })
}

File.prototype.toBinary = function(){
    return new Promise((resolve,reject)=>{
        // console.log(this)

        const file = this
        const reader = new FileReader()
        reader.onload = function(){
            resolve(reader.result)
        }

        reader.onerror = function(){
            reject(reader.error)
        }

        reader.readAsText(file)
    })
}

let FileHelper = {

    getDataview(file){
        return new Promise((resolve,reject)=>{
            if(!helper.isFile(file)){
                reject('不是文件类型');
                return;
            }
            try{
                const reader = new FileReader()
                reader.onload = function(){
                    const buffer = reader.result
                    const view = new DataView(buffer)
                    resolve(view)
                }
                reader.onerror = function(){
                    reject(reader.error)
                }
                reader.readAsArrayBuffer(file)
            }catch(e){
                reject(e)
            }

        })

    },

    isJPG(){},

    isPNG(){},

    isGIF(){},

    isMKV(){},

    isRMVB(){},

    isAVI(){},

    isFLV(){},

    isMP4(){},

    isMP3(){},

    isWAV(){},

    toBase(file){
        return new Promise((resolve,reject)=> {
            if (!helper.isFile(file)) {
                reject('不是文件类型');
                return;
            }
            file.toBase64().then(resolve).catch(reject)
        })
    },

    toArrayBuffer(file){
        return new Promise((resolve,reject)=> {
            if (!helper.isFile(file)) {
                reject('不是文件类型');
                return;
            }
            file.toArrayBuffer().then(resolve).catch(reject)
        })
    },

    toBinary(file){
        return new Promise((resolve,reject)=> {
            if (!helper.isFile(file)) {
                reject('不是文件类型');
                return;
            }
            file.toBinary().then(resolve).catch(reject)
        })
    },

    /**
     *
     * @param DataView view
     * @param int start
     * @param int length
     * @returns {Array}
     */
    getFileDataView(view,start,length){
        if(toString.call(view)!=='[object DataView]') return [];
        if(!start) start = 0
        if(!length) length = view.byteLength>0?view.byteLength:0
        if(!helper.isInt(start) || !helper.isInt(length) || start<0) return []
        let result = []

        // console.log(start,length)
        for(let i=start;i<start+length;i++){
            try{
                result.push(view.getUint8(i))
            }catch(e){
                console.log(i)
                console.error(e)
                return;
            }

        }
        return result
    }
}

export default FileHelper