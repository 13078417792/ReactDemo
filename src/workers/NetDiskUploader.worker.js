import http from '@util/http'
import FileHelper from '@util/File'
// import Url from '@util/Url'
import CodeStatus from '@util/CodeStatus'


/**
 * 1.计算文件MD5
 * 2.文件切割
 * 3.上传
 */

self.addEventListener('message',data => {
    const {data:file} = data


    // 计算md5
    self.postMessage({
        type:'md5',
        code:CodeStatus.UPLOAD_STATUS_MD5.code
    })
    console.log(file)
    FileHelper.chunk(file,10240*1024).then(res=>{
        self.postMessage(res)
        self.close()
    }).catch(err=>{
        console.error(err)
        self.close()
    })



})