import axios from 'axios'
import Auth from './Auth'
import ResponseCode from './ResponseCode'

function toFormData(form,data,parentKey=''){
    for(let key in data){
        let childKey = !!parentKey?`${parentKey}[${key}]`:key
        if([
            '[object Object]',
            '[object Map]',
            '[object Array]',
            '[object Set]'
        ].includes(toString.call(data[key]))){
            toFormData(form,data[key],childKey)
        }else{
            let itemData = data[key]
            if(!isNaN(itemData) && toString.call(itemData)!=='[object Number]'){
                itemData = parseFloat(itemData)
            }
            form.append(childKey,itemData)
        }
    }
}

const URL =  {
    development:'http://192.168.1.7:8998',
    production:'http://api.tool.presstime.cn'
}

const http = axios.create({
    baseURL: URL[process.env.NODE_ENV],
});
http.interceptors.request.use(async function (config) {

    if(config.baseURL.indexOf(URL.production)===0 && config.url.indexOf('/tool')===0){
        config.url = config.url.replace(/^\/tool/,'')
    }

    // Do something with response data
    let TokenID = Auth.getCommonToken()
    if(!TokenID){
        TokenID = await Auth.getCommonTokenAsync()
    }

    let AuthID = Auth.getAuthID()
    if(!AuthID){
        AuthID = await Auth.getAuthIDAsync()
    }

    if(!/^http/.test(config.url)){
        config.headers['X-TokenID'] = TokenID
        config.headers.Authorization = AuthID
    }


    // console.log(config)

    let formdata = new FormData()
    toFormData(formdata,config.data)
    config.data = formdata
    return Promise.resolve(config);
}, function (error) {
    return Promise.reject(error);
});

http.interceptors.response.use(function (response) {
    // Do something with response data
    const {data} = response
    if(!data.success && data.code===ResponseCode){
        // http.get(Url.InitToken).then()
        Auth.fetchCommonToken()
    }
    return data;
}, function (error) {
    // Do something with response error
    return Promise.reject(error);
});



export default http