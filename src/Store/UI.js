// @flow

const {observable,action} = require('mobx')

export default class UI{

    @observable wy_toggle_button:boolean = true

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