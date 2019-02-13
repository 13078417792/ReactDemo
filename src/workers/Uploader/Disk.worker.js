import Url from '@util/Url'
import http from '@util/http'

let part=0;
let stop = true
let chunks = [],
    md5 = '',
    upload_key = '',
    fail_chunks = [],
    uploaded = [],
    uploaded_ip = '',
    uploaded_port = 8099;

self.addEventListener('message',({data})=>{
    const {ip,port} = data
    if(ip){
        uploaded_ip = ip
    }
    if(port){
        uploaded_port = port
    }

    if(Array.isArray(data.chunks) && data.chunks.length>0){
        chunks = data.chunks
    }
    if(data.md5){
        md5 = data.md5
    }
    if(data.upload_key){
        upload_key = data.upload_key
    }


    if([true,false].includes(data.stop)){
        stop = data.stop
    }
    uploaded = [...new Set(uploaded.concat(data.uploaded || []))]
    if(uploaded.length===chunks.length){

        self.postMessage({
            success:true,
            finish:true
        })

        return;
    }

    upload(chunks,md5,upload_key,ip || uploaded_ip,port || uploaded_port);


})


const upload = async (chunks,md5,upload_key,ip,port) => {
    if(chunks.length===0 || stop || (part!==0 && part>=chunks.length)) return;
    if(uploaded.includes(part)){
        part++;
        upload(chunks,md5,upload_key,ip,port)
        return;
    }
    let result
    try{
        result = await http.post(`http://${ip}:${port}${Url.NetDiskFileUpload}`,{
            file:chunks[part],
            md5,
            upload_key,
            part
        })
    }catch(err){
        noticeMain(false,part,part===chunks.length-1,fail_chunks)
        if(stop || part===chunks.length-1){
            const $part = part
            addFailChunks(chunks,$part)
            return;
        }
        part++
        upload(chunks,md5,upload_key,ip,port)
        return;
    }

    if(!result.success){
        const $part = part
        addFailChunks(chunks,$part)
    }else{
        uploaded.push(part)
    }
    noticeMain(result.success,part,part===chunks.length-1,fail_chunks)

    if(stop || part===chunks.length-1) return;
    part++
    upload(chunks,md5,upload_key,ip,port)

}

// 通知主线程
function noticeMain(success,part,is_finish,fail_chunks=[]){
    const finish = !!is_finish
    let result = {
        success:!!success,
        part,
        finish,
    }
    if(finish){
        let fail_count = 0
        fail_chunks.forEach(el=>{
            if(!el.reupload_success) fail_count++
        })
        result.fail_count = fail_count
    }
    self.postMessage(result)
}

function addFailChunks(chunk,part){
    fail_chunks.push({
        chunk,
        part,
        reupload_success:false
    })
}