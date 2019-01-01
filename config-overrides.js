const rewireLess = require('react-app-rewire-less');

module.exports = function override(config, env) {
    //do stuff with the webpack config...

    config = rewireLess(config, env)
    process.env.HOST = '0.0.0.0'
    process.env.PORT = 8889
    // process.env.OPEN = true
    return config
  }