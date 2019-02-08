import Helper from './Helper'
import Md5Worker from '@workers/File/md5.worker.js'
import ChunkWorker from '@workers/File/chunk.worker.js'


const {isFunction} = require('lodash')

export default class FileChunk {

    static Pool = []






    constructor(){

        this.init()
    }

    init(){


        /**
         * status: stop pause run init
         * stop 停止
         * pause 暂停
         * run 计算中
         * init 未开始
         * @type {string}
         */
        this.status = 'init'

        // 是否可以开始工作
        this.enableStart = false

        // 计算MD5的woeker
        this.worker = null

        // 源文件
        this.file = null

        // 源文件分块后的数据 Array
        this.chunks = null


        // 文件分块的promise
        this.chunkFilePromise = null

        this.chunkWorkerInstance = null

        // 文件MD5
        this.md5Value = null


        this.config = {
            chunkSize:1024
        }
    }

    setConfig(config={}){
        this.config = Object.assign({},this.config,config)
        return this
    }



    // 中止
    abort() {
        if (this.chunkWorkerInstance instanceof Worker){
            if(isFunction(this.chunkWorkerInstance.terminate)){
                this.chunkWorkerInstance.terminate()
            }
            this.worker = null
        }

        if (this.worker instanceof Worker){
            if(isFunction(this.worker.terminate)){
                this.worker.terminate()
            }
            this.worker = null
        }
        console.log('file chunk is abort!')

        return true
    }


    // 放置文件
    setFile(file,size=Math.pow(1024,2)*2) {
        if (!file || !Helper.isFile(file)){
            this.enableStart = false
            throw new Error('不是文件')
        }

        this.file = file
        this.enableStart = true

        if(this.chunkFilePromise===null){
            this.chunkWorkerInstance = new ChunkWorker()

            this.chunkFilePromise = new Promise((resolve,reject)=>{
                this.chunkWorkerInstance.onmessage = ({data:chunks}) => {
                    this.chunks = chunks
                    this.chunkWorkerInstance.terminate()
                    this.chunkWorkerInstance = null
                    resolve(chunks)
                }

                this.chunkWorkerInstance.onerror = err => {
                    this.chunkWorkerInstance.terminate()
                    this.chunkWorkerInstance = null
                    reject(err)
                }

            })

            this.chunkWorkerInstance.postMessage({
                file,
                size
            })
        }


        return this
    }


    // 开始计算
    async md5(){
        if(this.status==='run') return Promise.reject('正在计算中');
        if(this.md5Value) return Promise.resolve(this.md5Value)
        if(!this.enableStart) return Promise.reject('未设置文件')
        if(!this.chunkFilePromise instanceof Promise) return Promise.reject('计算失败：文件未开始分段')
        // if(!Array.isArray(this.chunks) || this.chunks.length===0) return Promise.reject('计算失败：文件未开始分段')
        let chunks
        try{
            chunks = await this.chunkFilePromise
        }catch(err){
            return Promise.reject(err)
        }
        this.chunks = chunks
        if(this.worker===null){
            this.worker = new Md5Worker()
        }
        this.status = 'run'
        this.worker.postMessage(chunks)

        return new Promise((resolve,reject)=>{
            this.worker.onmessage = result=>{
                this.worker.terminate()
                this.worker = null
                this.chunkFilePromise = null
                const {data:md5} = result
                this.md5Value = md5
                this.status = 'stop'
                resolve(md5)
            }
            this.worker.onerror = err => {
                this.worker.terminate()
                this.worker = null
                this.chunkFilePromise = null
                this.status = 'stop'
                reject(err)
            }
        })
    }

    getChunkInfo(){
        if([
            this.chunks,
            this.md5Value,
            this.file
        ].includes(null)) return null
        return {
            chunks:this.chunks,
            chunk_count:this.chunks.length,
            size:this.file.size,
            md5:this.md5Value
        }
    }

    // 暂停
    pause(){

        return true;
    }

    clearFile(){
        this.file = null
        this.chunks = null
    }


}