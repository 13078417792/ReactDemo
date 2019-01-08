import axios from 'axios'
// import Cookie
const Cookie = require('js-cookie')

const AUTH_TOKEN = Cookie.get('auth') || ''

const URL =  {
    development:'http://192.168.1.7:8998',
    production:''
}

const http = axios.create({
    baseURL: URL[process.env.NODE_ENV]
});

http.defaults = Object.assign({},http.defaults,{
    headers:{
        common:{
            Authorization:AUTH_TOKEN
        }
    },
    transformRequest: [function (data, headers) {
        // Do whatever you want to transform the data
        console.log(data)
        return data;
    }]
})
console.log(http,http.defaults)



export default http