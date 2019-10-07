const fs = require("fs");

const globalConfig = JSON.parse(fs.readFileSync("../config.json", "utf-8"));
process.env.VUE_APP_TITLE = globalConfig.title;

module.exports = {
  chainWebpack: (webpackConfig) => {
    webpackConfig.plugin("define").tap((args) => {
      args[0] = {
        ...args[0],
        CONFIG: JSON.stringify(globalConfig),
        ADMIN_CONFIG: fs.readFileSync("config.json", "utf-8")
      }
      return args;
    });
  },
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