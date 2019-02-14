// @flow
import {isBoolean} from 'lodash'

const {observable,action} = require('mobx')

export default class UI{

    // element-ui推荐颜色
    color = {
        blue:'#409EFF',
        success:'#67C23A',
        warning:'#E6A23C',
        danger:'#F56C6C',
        info:'#909399',
    }

    // layui推荐颜色
    layuiColor:{
        button:'#009688',
        checked:'#5FB878',
        nav:'#393D49',
        brightBlue:'#1E9FFF',
        message:'#FFB800',
        focus:'#FF5722',
        text:'#01AAED',
        side:'#2F4056'
    }

    // 字体颜色
    fontColor:{
        main:'#303133',
        normal:'#606266',
        second:'#909399',
        placeholder:'#C0C4CC'
    }

    // 边框颜色
    border:{
        first:'#DCDFE6',
        second:'#E4E7ED',
        third:'#EBEEF5',
        four:'#F2F6FC'
    }

    @observable wy_music_side:boolean = false
    @observable wy_music_side_only_icon = false
    @observable net_disk_layout_side_mobile_show = false

    @action toggleNetDiskLayoutSideMobileStatus(status:boolean){
        this.net_disk_layout_side_mobile_show = isBoolean(status)?status:!this.net_disk_layout_side_mobile_show
    }

    @action toggle(name:string){
        if(!this.hasOwnProperty(name)) return false
        this[name] = !this[name]
        return true
    }

    @action getStatus(name:string){
        if(!this.hasOwnProperty(name)) return false
        return this[name]
    }

    @action setStatus(name:string,status:boolean){
        if(!this.hasOwnProperty(name)) return false
        this[name] = status
        return true
    }
}