import helper from './Helper'
import md5Worker from '@workers/File/md5.worker'

Blob.prototype.toBase64 = function(){
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

Blob.prototype.toArrayBuffer = function(){
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

Blob.prototype.toBinary = function(){
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
    },

    chunk(file,size){
        // console.log(size)
        if(!helper.isFile(file)) throw new Error('不是文件')
        if(file.size<size) size = file.size
        const chunk_count = Math.ceil(file.size / size)
        let chunks = []

        for(let chunk_index=0;chunk_index<chunk_count;chunk_index++){
            const chunk = file.slice(chunk_index*size,(chunk_index+1)*size)
            chunks.push(chunk)
        }
        // console.log(chunks)

        return new Promise((resolve,reject)=>{
            const worker = new md5Worker()
            worker.onmessage = function(data){
                const {data:md5} = data
                worker.terminate()
                resolve({
                    chunks,
                    chunk_count,
                    size,
                    md5
                })
            }
            worker.onerror = function(error){
                worker.terminate()
                reject(error)
            }
            worker.postMessage(chunks)
        })
    },
}

export default FileHelper