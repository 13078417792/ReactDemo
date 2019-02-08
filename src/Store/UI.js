// @flow

const {observable,action} = require('mobx')

export default class UI{


    @observable LiziLoadable:boolean = false
    // @observable PageLoading:boolean = true

    constructor(){


    }

    @action toggleLiziLoadable(){
        this.LiziLoadable = !this.LiziLoadable
    }

    @action setLiziLoadable(loadable:boolean){
        this.LiziLoadable = loadable
    }

}