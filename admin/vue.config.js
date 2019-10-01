const fs = require("fs");

module.exports = {
  chainWebpack: (webpackConfig) => {
    webpackConfig.plugin("define").tap((args) => {
      args[0] = {
        ...args[0],
        ADMIN_CONFIG: fs.readFileSync("config.json", "utf-8")
      }
      return args;
    });
  },
  devServer: {
    proxy: "http://localhost:24000"
  }
}