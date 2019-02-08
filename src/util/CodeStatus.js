// 上传状态
const UPLOAD_STATUS_MD5 = {
    code: 101,
    message: '计算文件MD5'
}

const UPLOAD_STATUS_MD5_FAIL = {
    code: 301,
    message: '计算文件MD5失败'
}

const UPLOAD_STATUS_MD5_FINISH = {
    code: 201,
    message: '计算文件MD5完成'
}

const UPLOAD_STATUS_CUTTING = {
    code: 102,
    message: '正在分割文件'
}

const UPLOAD_STATUS_CUT_FAIL = {
    code: 302,
    message: '分割文件失败'
}

const UPLOAD_STATUS_CUT_FINISH = {
    code: 202,
    message: '分割文件完成'
}

const UPLOAD_STATUS_UPLOADING = {
    code: 103,
    message: '上传中'
}

const UPLOAD_STATUS_ERROR = {
    code: 303,
    message: '上传出错'
}

const UPLOAD_STATUS_FINISH = {
    code: 203,
    message: '上传完成'
}

export default {
    UPLOAD_STATUS_MD5, UPLOAD_STATUS_CUTTING, UPLOAD_STATUS_CUT_FAIL, UPLOAD_STATUS_CUT_FINISH, UPLOAD_STATUS_UPLOADING,
    UPLOAD_STATUS_ERROR, UPLOAD_STATUS_FINISH, UPLOAD_STATUS_MD5_FAIL,UPLOAD_STATUS_MD5_FINISH
}