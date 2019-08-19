module.exports = {
  env: {
    NODE_ENV: '"development"'
  },
  defineConstants: {
  },
  weapp: {},
  h5: {
    devServer: {
      proxy: {
        '/user/*': 'http://www.gopets.cn/',
        '/order/*': 'http://www.gopets.cn/',
      }
    },
  }
}
