const rewireLess = require('react-app-rewire-less');
const {injectBabelPlugin} = require('react-app-rewired')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const path = require('path')

module.exports = function override(config, env) {
    //do stuff with the webpack config...

    config = rewireLess(config, env)
    config = injectBabelPlugin(['@babel/plugin-proposal-decorators', {
        legacy: true
    }], config)

    if(env==='production'){
        config.plugins.push(new UglifyJsPlugin({
            uglifyOptions: {
                compress: {
                    warnings: false,
                    drop_debugger: true,
                    drop_console: true
                }
            }
        }))
    }


    process.env.HOST = '0.0.0.0'
    process.env.PORT = 8889


    config.module.rules = config.module.rules.map(rule => {
        // console.log(rule)
        if (rule && Array.isArray(rule.oneOf)) {

            rule.oneOf.unshift({
                test: /\.worker\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'worker-loader',
                    options: {name: 'Worker.[hash].js', publicPath: '/src/workers/', inline: true}
                },
            })
        }
        return rule
    })
    // config.output.globalObject = 'this'

    config.resolve.alias['@src'] = path.resolve('src')
    config.resolve.alias['@components'] = path.resolve('src/components')
    config.resolve.alias['@store'] = path.resolve('src/Store')
    config.resolve.alias['@util'] = path.resolve('src/util')
    config.resolve.alias['@workers'] = path.resolve('src/workers')
    config.resolve.alias['@router'] = path.resolve('src/Router')
    config.resolve.alias['@drawer'] = path.resolve('src/Drawer')
    // console.log(config)
    // throw 1233;
    // config.output.publicPath = ""

    return config
}