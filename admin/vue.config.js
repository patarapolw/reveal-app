module.exports = {
  devServer: {
    port: 5000,
    proxy: {
      "^/web": {
        target: "http://localhost:9000",
        pathRewrite: {
          '^/web' : ''
        }
      },
      "^/api": {
        target: "http://localhost:24000"
      }
    }
  }
}