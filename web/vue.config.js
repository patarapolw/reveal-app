const fs = require("fs");

const globalConfig = JSON.parse(fs.readFileSync("../config.json", "utf-8"));
process.env.VUE_APP_TITLE = globalConfig.title;

module.exports = {
  publicPath: '',
  pages: {
    index: "src/main.ts",
    reveal: "src/reveal.ts"
  },
  chainWebpack: (webpackConfig) => {
    webpackConfig.plugin("define").tap((args) => {
      args[0] = {
        ...args[0],
        CONFIG: JSON.stringify(globalConfig),
        WEB_CONFIG: fs.readFileSync("config.json", "utf-8")
      }
      return args;
    });
  },
  devServer: {
    port: 9000,
    proxy: {
      "^/api": {
        target: "http://localhost:24000"
      }
    }
  }
}