let code = Object.create(null)
const insert = function(name,value){
    Object.defineProperty(code,name,{
        writable:false,
        value
    })
}

insert('TOKEN_VAILD',601)
insert('AUTH_VAILD',602)

export default code