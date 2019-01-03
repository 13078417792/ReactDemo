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
    }
}

export default FileHelper