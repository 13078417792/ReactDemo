export default {

    // 表单令牌
    InitToken: '/tool/Token/InitToken',
    ValidateToken: '/tool/Token/ValidateToken',

    // 帐号
    SignIn: '/tool/account/SignIn',
    SignOut: '/tool/account/SignOut',
    SignUp: '/tool/account/SignUp',
    ModifyPassword: '/tool/account/modify_password',

    // 验证登录凭证
    CheckAuthID: '/tool/account/CheckAuthID',


    // 网盘文件上传
    NetDiskFileUpload: '/tool/disk/upload',

    // 上传前检查
    NetDiskFilePrepareUpload: '/tool/disk/prepareUpload',

    // 获取指定文件夹下的内容（子文件夹、文件）
    NetDiskFolderContent: '/tool/disk_folder/getContent',

    // 获取文件夹信息
    NetDiskFolderDetail: '/tool/disk_folder/getDetail',

    // 创建文件夹
    NetDiskCreateFolder: '/tool/disk_folder/create',

    // 请求删除文件夹
    NetDiskRequestDeleteFolder: '/tool/disk_folder/requestDel',

    // 删除文件夹
    NetDiskDeleteFolder: '/tool/disk_folder/del',

    // 删除文件
    NetDiskDeleteFile: '/tool/disk/deleteFile',

    // 从回收站删除文件
    NetDiskDeleteRecycleFile: '/tool/disk/deleteFileFromRecycle',

    // 清空回收站
    NetDiskClearRecycle: '/tool/disk/clearRecycle',

    // 移动文件
    NetDiskMoveFile: '/tool/disk/move',

    // 移动文件夹
    NetDiskMoveFolder: '/tool/disk_folder/move',

    // 修改文件夹
    NetDiskFolderUpdate:'/tool/disk_folder/update',

    // 文件重命名
    NetDiskFileRename:'/tool/disk/rename'
}