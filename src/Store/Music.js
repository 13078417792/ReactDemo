// @flow

import {isObject,isFunction,isNumber,isEmpty,mapValues} from 'lodash'
import forage from 'localforage'
import API from '../util/CloudMusicAPI'

const {order} = API
const {observable,action,toJS,computed} = require('mobx')
const Chance = require('chance');

const chance = new Chance()
forage.config({
    name:'tool',
    storeName:'wy-music'
})

async function getQueue(){
    let queue
    try{
        queue = await forage.getItem('queue')
    }catch(err){
        return Promise.reject(err)
    }
    return queue
}

async function getCurrentPlaySong(){
    let id
    try{
        id = await forage.getItem('current_song')
    }catch(err){
        return Promise.reject(err)
    }
    return Promise.resolve(id)
}

// 顺序播放
const ORDER_LIST = order.ORDER_LIST

// 单曲循环
const ORDER_SINGLE = order.ORDER_SINGLE


// 随机播放
const ORDER_RANDOM = order.ORDER_RANDOM

// 循环播放
const ORDER_LOOP = order.ORDER_LOOP

const order_arr = [ORDER_LIST,ORDER_SINGLE,ORDER_RANDOM,ORDER_LOOP]

function savePlay(data){
    forage.setItem('play_index',data).then(()=>{console.log('保存当前播放歌曲索引成功')}).catch(err=>{console.warn('保存当前播放歌曲索引失败',err)})
}

function saveCurrentSong(data){
    forage.setItem('current_song',data).then(()=>{console.log('保存当前播放歌曲ID成功')}).catch(err=>{console.warn('保存当前播放歌曲ID失败',err)})
}

async function getOrder(){
    let index
    try{
        index = await forage.getItem('play_order')
    }catch(err){
        return Promise.reject(err)
    }
    if(!order_arr.includes(index)) {
        saveOrder(ORDER_LIST)
        return Promise.resolve(ORDER_LIST)
    }
    return Promise.resolve(index)
}

function saveOrder(order){
    forage.setItem('play_order',order).then(()=>{}).catch(err=>{})
}

class Music {

    // 生成的随机播放曲目数量
    static random_count = 5

    // 当前播放歌曲的索引（相对于播放队列）
    @observable play_index = null

    // 播放列表
    @observable list:object<object> = {}

    // 播放顺序
    @observable play_order = ORDER_LIST

    // 当前播放的歌曲ID
    @observable cur_song: number | null | void = null

    // 歌曲ID集合
    @observable id_map:array<number> = []

    // 随机播放数据
    @observable random = {

        // 播放列表（每次生成5条数据，同步存入history数组，播放完毕再生成，如此循环）
        list:[],

        // 历史
        history:[],

        // 当前播放歌曲在历史数组里的索引
        current:0
    }



    constructor(){
        getOrder().then(order=>{
            this.play_order = order
        })

        this.initInfo().then(({id})=>{
            this.triggerEvent('init',id)
            return this.play(id)
        }).catch(err=>{
            this.triggerErrorEvent('init',err.message || err)
        })
    }

    @action initInfo(): Promise<object>{
        return new Promise((resolve,reject)=>{

            getQueue().then(result=>{
                if(!result) result = {}
                this.setQueue(result,false,true)
                return getCurrentPlaySong()
            }).then(id=>{
                const queue = toJS(this.queue)
                id = id || 0
                const result:object = {id,queue}
                this.cur_song = id
                resolve(result)
            }).catch(err=>{
                reject(err)
            })
        })
    }

    @computed get random_history(){
        return toJS(this.random.history)
    }

    @computed get random_song(){
        return toJS(this.random.list)
    }

    @computed get random_current(){
        return this.random.current
    }

    @action reset_random(){
        this.random = {
            list:[],
            history:[],
            current:0
        }
        this.create_random_song()
    }

    /**
     * 生成随机播放曲目（5条）
     * @returns {*}
     */
    @action create_random_song(head:boolean=false){
        const {ids} = this
        if(ids.length===0) return []
        const times = Music.random_count
        let list = []
        for(let i=0;i<times;i++){
            list.push(ids[chance.integer({
                min:0,
                max:ids.length-1
            })])
        }
        this.random.list = list
        if(head){
            this.random.history = [...list].concat(this.random.history)
        }else{
            this.random.history = this.random.history.concat(list)
        }
        // console.log(list,this.random.history,this.random_history)
        return list
    }

    @computed get random_song(){
        return toJS(this.random.list)
    }

    @computed get ids(){
        return toJS(this.id_map)
    }

    /**
     * 队列状态
     * @returns {boolean}
     */
    @computed get queue_status():boolean{
        return this.ids.length>0
    }

    /**
     * 播放顺序
     * @returns {number}
     */
    @computed get order(){
        return order_arr.includes(this.play_order)?this.play_order:ORDER_LIST
    }

    /**
     * 切换播放顺序
     */
    @action toggle_order(){
        const current = this.order
        let index = order_arr.indexOf(current)
        // console.log(index,order_arr.length)
        if(index===-1 || index+1>=order_arr.length) {
            index = 0
        }else{
            index+=1
        }
        this.play_order = order_arr[index]
        if(API.order.ORDER_RANDOM===order_arr[index]){
            this.reset_random()
            this.create_random_song()
        }
        saveOrder(order_arr[index])
    }

    /**
     * 设置播放歌曲
     * @param id
     * @returns {*}
     */
    @action play(id:number):boolean|string{
        const check = this.is_song_in_queue(id)
        if(check!==true) return '设置播放歌曲失败'
        // if(!isNumber(id) || !queue.hasOwnProperty(id) || !ids.includes(id) ) return '设置播放歌曲失败'
        this.cur_song = id
        saveCurrentSong(id)
        return true
    }

    /**
     * 从播放列表同步更新播放队列的歌曲ID到新数组
     * @param queue
     * @returns {*[]}
     */
    @action update_id_map(queue:array<object>|object<object>) :array<number>{
        let map = [].concat(
            (Array.isArray(queue)?queue:Object.values(queue)).map(el=>parseInt(el.id))
        )
        this.set_id_map(map)
        return map
    }

    /**
     * 设置播放歌曲的ID集合
     * @param map
     */
    set_id_map(map:array<number>){
        this.id_map = map
    }

    /**
     * 移除播放歌曲ID
     * @param id
     * @returns {boolean}
     */
    remove_id_map(id:number){
        const {id_map:map} = this
        if(!map.includes(id)) return false
        map.splice(map.indexOf(id),1)
        this.set_id_map(map)
        return true
    }

    /**
     * 播放队列
     * @returns {*}
     */
    @computed get queue(): object<object>{
        let {ids,list} = this
        list = toJS(list)
        let queue = {}
        mapValues(list,function(song){
            if(ids.includes(song.id)){
                queue[song.id] = song
            }
        })
        // console.log(list,ids,queue)
        return queue
    }

    /**
     * 歌曲索引是否合法(相对于当前播放队列)
     * @param index
     */
    @action index_ok(index:number) :boolean|string{
        if(this.queue.length===0) return '播放队列空，索引不存在'
        if(!isNumber(index) || index<0 || index+1>=this.queue.length) return '索引不存在'
        return true;

    }

    @action handleSinger(data:array,split:string='/') :string{
        if(!Array.isArray(data)) throw new Error('数据非法')
        return data.map(el=>el.name).join(split)
    }

    /**
     * 切换歌曲
     * @param id 歌曲ID
     * @param trigger 是否触发事件
     */
    @action async toggleSong(id:number,trigger:boolean=true){
        // if(!this.is_song_in_queue(id)) return Promise.reject('播放失败');
        if(this.play(id)!==true) return Promise.reject('播放失败')
        let result
        try{
            result = await API.fetch('CHECK_MUSIC',{id})
            if(!result.success){
                return Promise.reject(result.message)
            }
            result = await this.get_song_url(id)
        }catch(err){
            return Promise.reject(err.message || err || '播放失败')
        }

        this.cur_song = id

        if(trigger) this.triggerEvent('toggleSong',id,result)
    }

    /**
     * 获取歌曲播放url
     * @param id
     * @returns {Promise<*>}
     */
    @action async get_song_url(id:number) :Promise<string>{
        let result
        try{
            const {success,message} = await API.fetch('CHECK_MUSIC',{id})
            if(!success) return Promise.reject(message)
            result = await API.fetch('SONG_URL',{id})
        }catch(err){
            return Promise.reject(err)
        }
        if(result.data.length===0){
            return Promise.reject('获取歌曲URL失败')
        }
        return Promise.resolve(result.data[0].url)
    }

    /**
     * 重置当前播放歌曲
     */
    @action resetPlay(){
        saveCurrentSong(null)
    }


    @action async getQueuePromise(id:number){
        let queue = toJS(this.queue)
        if(isEmpty(queue)) {
            try{
                queue = await getQueue()
            }catch(err){
                return Promise.reject(err)
            }
        }
        if( isNumber(id) && queue[id] && this.ids.includes(id) ) return Promise.resolve(queue[id])

        return  Promise.resolve(queue)
    }

    /**
     * 设置播放队列（并清除以前的队列）
     * @param list
     * @param auto
     * @param init
     * @returns {boolean}
     */
    @action setQueue(list:object<object>|array<object>,auto:boolean=true,init:boolean=false):boolean{
        if(isEmpty(list)) return false
        forage.setItem('queue',list)
        const ids = this.update_id_map(list)
        if(Array.isArray(list)){
            const _list = list
            list = {}
            _list.forEach(el=>{
                list[el.id] = el
            })
        }
        this.list = list
        const {cur_song} = this
        // console.log(auto,init)
        if(cur_song===null) auto = true
        if(auto){
            const result = this.play(ids[0])
            if(result!==true) return false
        }
        if(!init) this.triggerEvent('setQueue',auto?ids[0]:cur_song)
        return true


    }

    /**
     * 触发事件
     * @param name
     * @param rest
     * @returns {boolean}
     */
    triggerEvent(name:string,...rest:array) :boolean{
        if(!name) return false
        const callbacks = this.event[name]
        if(!Array.isArray(callbacks)) return false
        callbacks.forEach(callback=>{
            if(isFunction(callback)){
                callback(...rest)
            }
        })
        return true
    }

    /**
     * 触发错误事件
     * @param name
     * @param rest
     * @returns {boolean}
     */
    triggerErrorEvent(name:string,...rest:array) :boolean{
        if(!name) return false
        const callbacks = this.error_event[name]
        if(!Array.isArray(callbacks)) return false
        callbacks.forEach(callback=>{
            if(isFunction(callback)){
                callback(...rest)
            }
        })
        return true
    }

    /**
     * 事件列表
     * @type {{}}
     */
    event = {}

    /**
     * 错误事件
     * @type {{}}
     */
    error_event = {}

    /**
     * 添加事件
     * @param name
     * @param callback
     * @param fail
     * @returns {boolean}
     */
    addEvent(name:string,callback:Function,fail:Function) :boolean{
        if(!Array.isArray(this.event[name])) this.event[name] = []
        if(!isFunction(callback)) return false
        this.event[name].push(callback)
        if(isFunction(fail)){
            if(!Array.isArray(this.error_event[name])) this.error_event[name] = []
            this.error_event[name].push(callback)
        }
        return true
    }

    /**
     * 移除事件
     * @param name
     * @param callback
     * @param fail
     * @returns {boolean}
     */
    removeEvent(name:string,callback:Function,fail:Function) :boolean{
        if(!Array.isArray(this.event[name]) || this.event[name].length===0 || !isFunction(callback)) return false
        const callbacks = this.event[name]
        const index = callbacks.indexOf(callback)
        if(index===-1) return false
        callbacks.splice(index,1)

        // fail event handler
        if(Array.isArray(this.error_event[name]) && this.error_event[name].length && isFunction(fail)){
            const fails = this.error_event[name]
            const index = fails.indexOf(fail)
            if (index !== -1) callbacks.splice(index, 1)
        }


        return true
    }

    /**
     * 添加一首歌曲到播放队列头部
     * @param item
     * @returns {boolean}
     */
    @action addQueue(item:object<object>) :boolean{
        const {id} = item
        if(!id) return false
        const {ids:id_map,queue} = this
        if(id_map.includes(id)){
            id_map.splice(id_map.indexOf(id),1)
        }
        id_map.unshift(id)
        if(!queue.hasOwnProperty(id)){
            queue[id] = item
            this.list = queue
        }

        return true;
    }


    /**
     * 下一首播放
     * @param item
     * @returns {boolean}
     */
    @action nextSong(item:object<object>){
        const {id} = item
        if(!id) return false
        let queue = toJS(this.queue)
        let id_map = toJS(this.id_map)
        if(id_map.includes(id)){
            id_map.splice(id_map.indexOf(id),1)
        }
        const index = id_map.indexOf(this.cur_song)
        id_map = [...id_map.slice(0,index),id,...id_map.slice(index)]
        queue[id] = item
        this.set_id_map(id_map)
        this.list = queue
        return true
    }

    /**
     * 获取歌曲信息
     * @param id 歌曲ID
     * @returns {*}
     */
    @action getSongInfoByIndex(id:number):object<any>{
        if(this.id_map.length===0) throw new Error('播放队列空,无法获取歌曲信息')
        const map = toJS(this.id_map)
        const queue = toJS(this.queue)
        if(!isNumber(id) || id<0 || !map.includes(id) || !queue.hasOwnProperty(id)) throw new Error('播放队列不存在此歌曲')

        return {
            id,
            detail:queue[id]
        }
    }


    /**
     * 当前歌曲是否播放队列中的第一首
     * @returns {boolean}
     */
    @computed get is_first(){
        const {ids,cur_song} = this
        if(ids.length===0) return true
        if(!ids.includes(cur_song)) return false
        return ids.indexOf(cur_song)===0
    }

    /**
     * 当前歌曲是否播放队列中的最后一首
     * @returns {boolean}
     */
    @computed get is_end(){
        const {ids,cur_song} = this
        if(ids.length===0) return true
        if(!ids.includes(cur_song)) return false
        return ids.indexOf(cur_song)===ids.length-1
    }


    /**
     * 播放队列控制（上一首/下一首）
     * @param next true:下一首   false:上一首
     * @returns string|{}
     */
    @action play_queue_control(next:boolean) {
        if (![true, false].includes(next)) return '操作失败'
        const {ids,queue,order,cur_song:current} = this
        const n = next?1:0
        const dispatch = {
            [API.order.ORDER_LIST]:()=>{
                console.log('顺序播放')
                // 顺序播放
                const check = [this.is_first,this.is_end]
                const desc = ['第一首','最后一首']
                if(check[n]) return `已经是${desc[n]}歌曲了`

                const id = next?ids[ids.indexOf(current)+1]:ids[ids.indexOf(current)-1]
                if(!ids.includes(id) || !queue.hasOwnProperty(id)) return '歌曲不存在'
                const detail = queue[id]
                return {id,detail}

            },[API.order.ORDER_SINGLE]:()=>{
                console.log('单曲循环')
                // 单曲循环
                const {cur_song:id} = this
                if(!ids.includes(id) || !queue.hasOwnProperty(id)) return '歌曲不存在'
                return {id,detail:queue[id]}
            },[API.order.ORDER_RANDOM]:()=> {
                console.log('随机播放')
                // 随机播放
                const index = chance.integer({min:0,max:this.ids.length-1})
                const id = this.ids[index]
                return {
                    id:id,
                    detail:this.queue[id]
                }
            },[API.order.ORDER_LOOP]:()=>{
                console.log('列表循环')
                // 列表循环
                const func = [()=>{
                    if(this.is_first){
                        return {
                            id:ids[ids.length-1],
                            detail:queue[ids[ids.length-1]]
                        }
                    }
                    // console.log(ids.length,ids.indexOf(current))
                    const id = ids[ids.indexOf(current)-1]
                    return {
                        id,
                        detail:queue[id]
                    }
                },()=>{
                    if(this.is_end){
                        return {
                            id:ids[0],
                            detail:queue[ids[0]]
                        }
                    }
                    const id = ids[ids.indexOf(current)+1]
                    return {
                        id,
                        detail:queue[id]
                    }
                }]
                return func[n]()
            }
        }
        if(!dispatch.hasOwnProperty(order)) throw new Error('操作失败')
        const result = dispatch[order]()
        this.play(result.id)
        // this.cur_song =
        return result
        // return func[n]()
    }

    /**
     * 清空播放队列
     */
    @action clearQueue(){
        this.list = {}
        this.id_map = []
        forage.setItem('queue',{})
        this.resetPlay()
    }

    /**
     * 歌曲是否存在于播放队列中
     * @param id
     * @returns {*|boolean}
     */
    @action is_song_in_queue(id:number){
        const {ids,queue} = this
        return isNumber(id) && id!==0 && ids.includes(id) && queue.hasOwnProperty(id)
    }

    /**
     * 移除播放队列中某歌曲
     * @param id
     * @returns {boolean}
     */
    @action removeQueue(id:number){
        let {queue} = this
        if(!this.is_song_in_queue(id)) return false
        delete queue[id]
        return this.setQueue(queue)
    }

}

export default Music