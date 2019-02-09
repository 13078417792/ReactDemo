// @flow

import AccountStatus from './AccountStatus'
import Disk from './Disk'
import Router from './Router'
import IP from './IP'
import UI from './UI'

class RootStore {

    AccountStatusStore:?AccountStatus;
    DiskStore:?Disk;

    constructor(){
        this.AccountStatusStore = new AccountStatus()
        this.DiskStore = new Disk()
        this.RouterStore = new Router()
        this.IpStore = new IP()
        this.UIStore = new UI()
    }



}

export default RootStore