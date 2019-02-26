import http from './http'
// import SparkMD5 from 'spark-md5'
const ORDER_LIST = 0

// 单曲循环
const ORDER_SINGLE = 1


// 随机播放
const ORDER_RANDOM = 2

// 循环播放
const ORDER_LOOP = 3
export default {
    base_url:'http://apimusic.presstime.cn',
    API:{
        RELATED_PLAY_LIST:'/related/playlist',
        personalized:'/personalized',
        PERSONALIZED_PRIVATE_CONTENT:'/personalized/privatecontent',
        PERSONALIZED_NEW_SONG:'/personalized/newsong',
        PERSONALIZED_MV:'/personalized/mv',
        PERSONALIZED_DJ_PROGRAM:'/personalized/djprogram',

        // 歌单详情
        PLAYLIST_DETAIL:'/playlist/detail',

        // 音乐是否可用
        CHECK_MUSIC:'/check/music',

        // 歌曲播放链接
        SONG_URL:'/song/url',

        // 搜索
        SEARCH:'/search',

        // 热搜
        HOT_SEARCH:'/search/hot',

        // 歌单评论
        COMMENT_PLAYLIST:'/comment/playlist',

        // 歌曲评论
        COMMENT_MUSIC:'/comment/music',

        // 歌曲详情
        SONG_DETAIL:'/song/detail'
    },
    order:{ORDER_LIST,ORDER_SINGLE,ORDER_RANDOM,ORDER_LOOP},
    order_label:{ORDER_LIST:'顺序播放',ORDER_SINGLE:'单曲循环',ORDER_RANDOM:'随机播放',ORDER_LOOP:'循环播放'},
    get(name){
        if(!name || !this.API.hasOwnProperty(name)) throw new Error('API不存在')
        // return (this.base_url+this.API[name]).replace(`${this.base_url}//`,`${this.base_url}/`)
        return this.API[name]
    },
    getFile(url,onDownloadProgress=function(){}){
        return http.get(url,{
            responseType:'arraybuffer',
            onDownloadProgress
        })
    },
    async fetch(name,params={}){
        let result
        try{
            result = await http.get(this.get(name),{
                params,
                baseURL:this.base_url
            })
        }catch(err){
            return Promise.reject(err)
        }
        return Promise.resolve(result)

    }

}