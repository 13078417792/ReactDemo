// flow
import AsyncComponent from '@components/AsyncComponent'
import {isArray} from 'lodash'
import MusicRecommend from '@router/Music/Recommend/Recommend'
import MusicSongList from '@router/Music/SongList/SongList'
const {observable,action} = require('mobx')


export default class Router {

    @observable list:object = {
        PicToBase: {
            path: '/pic-to-base64',
            needAuth: false,
            component: this.getRouteComponent('PicToBase')
        }, CheckFormat: {
            path: '/check-format',
            needAuth: false,
            component: this.getRouteComponent('CheckFormat')
        }, NetDisk: {
            path: '/disk/content/:folder_id?',
            needAuth: true,
            component: this.getRouteComponent('NetDisk')
        }, MusicDiscover:{
            path:'/music/:tag?/:sub?',
            needAuth: false,
            component: this.getRouteComponent('Music/Layout/Layout',true)
        }
    };

    @observable music:object = {
        home:{
            path: '/music',
            needAuth: false,
            redirect:'/music/discover/recommend',
            component: this.getRouteComponent('Music/Home/MusicHome',true)
        }
    }

    @observable musicPath:object = {
        discover:[
            {label:'个性推荐',url:'recommend',component:MusicRecommend,index:true},
            {label:'歌单',url:'song-list',component:MusicSongList},
            {label:'主播电台',url:'radio',component:MusicSongList},
            {label:'最新音乐',url:'newest',component:MusicSongList},
            {label:'歌手',url:'singer',component:MusicSongList},
        ]
    }

    constructor() {
        this.handleMusicPath()
    }

    handleMusicPath(){
        let data = {}
        for(let side in this.musicPath){
            const part = this.musicPath[side]
            if(!isArray(data[side])) data[side] = []
            part.forEach(el=>{
                data[side].push({
                    label:el.label,
                    path:`/music/${side}/${el.url}`,
                    component:el.component,
                    index:!!el.index
                })
            })
        }
        this.musicPath = data
    }

    getSingle(name:string){
        return this.list.hasOwnProperty(name)?this.list[name]:null
    }

    getRouteComponent(name:string,isFullPath:boolean){
        // const path = isFullPath?name:`./Router/${name}/${name}`
        return isFullPath?AsyncComponent(() => import(`@router/${name}`)):AsyncComponent(() => import(`@router/${name}/${name}`))
        // return AsyncComponent(() => import(`@router/${name}/${name}`))
    }

    @action add(name:string,router:object,part:string='list'){
        if(this[part].hasOwnProperty(name)) return false
        this[part][name] = router
        return true
    }

    @action remove(name:string,part:string='list'){
        if(!this[part].hasOwnProperty(name)) return false
        delete this[part][name]
        return true
    }

    @action update(name:string,router:object,part:string='list'){
        if(!this[part].hasOwnProperty(name)) return false
        this[part][name] = router
        return true
    }
}