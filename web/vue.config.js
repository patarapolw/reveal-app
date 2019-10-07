const fs = require("fs");
const showdown = require("showdown");

let config = {};

try {
  if (!process.env.ELECTRON) {
    config = JSON.parse(fs.readFileSync("../config.json", "utf-8"));
    const md = new showdown.Converter();
    md.setFlavor("github");
    process.env.VUE_APP_ABOUT = config.about ? md.makeHtml(fs.readFileSync(`../${config.about}`, "utf-8")) : "";
  }
} catch(e) {};

process.env.VUE_APP_TITLE = config.title || "Reveal App";

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
        CONFIG: JSON.stringify(config),
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