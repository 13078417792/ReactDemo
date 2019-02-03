// @flow
import http from '@util/http'
import Url from '@util/Url'
import {isEmpty} from 'lodash'
const {observable,action,autorun,reaction} = require('mobx')

export default class Disk {

    @observable folderId:number = 0;
    @observable folders:array = [];
    @observable files:array = [];
    @observable path:array = [];
    @observable oldPath:array = [];
    @observable paths:array = [];

    // @action async getContent(id:number){
    //     if(isEmpty(id)){
    //         id = this.folderId
    //     }
    //     let content
    //     try{
    //         content = await http.post(Url.NetDiskFolderContent,{
    //             id
    //         })
    //     }catch(err){
    //         return Promise.reject(err.message || err)
    //     }
    //     this.folders = content.folders
    //     this.files = content.files
    //     return Promise.resolve(content)
    // }

    @action updateFolders(data:array){
        this.folders = data
    }

    @action updateFiles(data:array){
        this.files = data
    }

    @action setFolder(id:number=0){
        this.folderId = id;
        this.getContent(id,true)
    }

    @action async getDetail(id:number){
        if((isEmpty(id) && id!==0) || id<0){
            return Promise.reject(`非法数据`)
        }
        if(id==0){
            return Promise.resolve({})
        }

        let detail
        try{
            detail = await http.post(Url.NetDiskFolderDetail,{
                id
            })
        }catch(err){
            return Promise.reject(err.message || err)
        }
        if(detail.success){
            return Promise.resolve({
                detail:detail.detail,
                path:detail.path
            })
        }else{
            return Promise.reject(detail.msg);
        }

    }

    @action async getContent(id:number,autoUpdate:boolean=false){
        if(isEmpty(id)){
            id = this.folderId
        }
        if(id<0){
            id = 0
        }
        let detail
        try{
            detail = await http.post(Url.NetDiskFolderContent,{
                id
            })
        }catch(err){
            return Promise.reject(err.message || err)
        }
        if(detail.success){
            if(autoUpdate){
                this.updateFolders(detail.folders)
                this.updateFiles(detail.files)
            }
            return Promise.resolve({
                folders:detail.folders,
                files:detail.files
            })
        }else{
            return Promise.reject(detail.msg);
        }

    }

    @action updatePath(data:array){
        this.oldPath = this.path
        this.path = data
    }


}