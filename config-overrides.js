const rewireLess = require('react-app-rewire-less');
const {injectBabelPlugin,getLoader} = require('react-app-rewired')
const rewired = require('react-app-rewired')


const path = require('path')

module.exports = function override(config, env) {
    //do stuff with the webpack config...

    config = rewireLess(config, env)
    config = injectBabelPlugin(['@babel/plugin-proposal-decorators', { "legacy": true }], config)
    process.env.HOST = '0.0.0.0'
    process.env.PORT = 8889

    config.module.rules = config.module.rules.map(rule=>{
        // console.log(rule)
        if(rule && Array.isArray(rule.oneOf)){

            rule.oneOf.unshift({
                test:/\.worker\.js$/,
                exclude: /node_modules/,
                use:{ loader: 'worker-loader',options: { name: 'WorkerName.[hash].js',publicPath:'/src/workers/',inline: true } },
            })
        }
        return rule
    })
    config.output.globalObject = 'this'

    console.log(config.resolve)
    config.resolve.alias['@src'] = path.resolve('src')
    config.resolve.alias['@components'] = path.resolve('src/components')
    config.resolve.alias['@store'] = path.resolve('src/Store')
    config.resolve.alias['@util'] = path.resolve('src/util')
    config.resolve.alias['@workers'] = path.resolve('src/workers')
    config.resolve.alias['@router'] = path.resolve('src/Router')
    config.resolve.alias['@drawer'] = path.resolve('src/Drawer')

    // throw 123;
    // process.env.OPEN = true
    return config
}