export default {

    dialog:{
        initZIndex:1500,
        currentZIndex:0,


        get_zIndex(){
            if(this.currentZIndex<this.initZIndex){
                this.currentZIndex = this.initZIndex
            }
            return this.currentZIndex
        },

        add_zIndex(){
            let index = this.get_zIndex()
            index++
            this.currentZIndex = index
            return this.currentZIndex
        },

        gt_zIndex(zIndex){
            return this.currentZIndex>zIndex
        }


    }


}

