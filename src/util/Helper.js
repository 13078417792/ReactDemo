import Config from './Config'
import Url from './Url'
import OuterUrl from './OuterUrl'
import { isString, isNumber } from 'lodash'

function isFmt(data, fmt) {
    return toString.call(data) === `[object ${ucfirst(fmt)}]`
}

function ucfirst(str) {
    if (isString(str) && str.length === 0) {
        return ''
    }
    let rtStr = ''
    rtStr += str[0].toUpperCase()
    rtStr += str.slice(1, str.length)
    return rtStr
}

let Helper = {
    isFmt,
    isFile(file) {
        return isFmt(file, 'file')
    },
    isArray(data) {
        return (Array.isArray && Array.isArray(data)) || isFmt(data, 'array')
    },
    isObject(data) {
        return isFmt(data, 'object')
    },

    isInt(data) {
        return isFmt(data, 'number') || parseFloat(data) === data
    },

    isString(data) {
        return isFmt(data, 'string')
    },

    ucfirst(str) {
        return ucfirst(str)
    },

    config(name, value) {
        if (name === undefined) {
            return Config
        }
        if (value === undefined) {
            return Config[name]
        }
        Config[name] = value
    },

    getUrl(name) {
        if (!name) {
            throw new Error('获取链接失败')
        }
        if (!Url[name]) {
            throw new Error(`${name}链接无效`)
        }
        return Url[name]
    },
    getOuterUrl(name) {
        if (!name) {
            throw new Error('获取外链失败')
        }
        if (!OuterUrl[name]) {
            throw new Error(`${name}链接无效`)
        }
        return OuterUrl[name]
    },

    handleErrorMsg(err, defaultMessage = '操作失败') {
        if (!isString(defaultMessage)) defaultMessage = '操作失败'
        return err.message || err.msg || (isString(err) ? err : defaultMessage)
    },

    isMobile(width = 640) {
        const navigator = window && window.navigator ? window.navigator : null
        const { userAgent } = navigator
        if (!navigator || !userAgent) return false
        if (!isNumber(width)) width = 640
        const regexp = /.*(android|iOS|Windows Phone|iphone|iphone os).*/i
        return regexp.test(userAgent) ||
            document.body.clientWidth <= width
    }
}

export default Helper