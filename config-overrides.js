const rewireLess = require('react-app-rewire-less');
const {injectBabelPlugin,getLoader} = require('react-app-rewired')
const rewired = require('react-app-rewired')

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
    // throw 123;
    // process.env.OPEN = true
    return config
}