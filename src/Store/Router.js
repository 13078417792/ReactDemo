// flow
import AsyncComponent from '@components/AsyncComponent'
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
        }
    };

    // constructor() {
    //
    // }

    getSingle(name:string){
        return this.list.hasOwnProperty(name)?this.list[name]:null
    }

    getRouteComponent(name:string){
        // const path = isFullPath?name:`./Router/${name}/${name}`
        return AsyncComponent(() => import(`@router/${name}/${name}`))
    }

    @action add(name:string,router:object){
        if(this.list.hasOwnProperty(name)) return false
        this.list[name] = router
        return true
    }

    @action remove(name:string){
        if(!this.list.hasOwnProperty(name)) return false
        delete this.list[name]
        return true
    }

    @action update(name:string,router:object){
        if(!this.list.hasOwnProperty(name)) return false
        this.list[name] = router
        return true
    }
}