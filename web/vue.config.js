const fs = require("fs");
const dotenv = require("dotenv");

dotenv.config({
  path: "../.env"
});

process.env.VUE_APP_ABOUT = fs.readFileSync("../about.md", "utf-8");
process.env.VUE_APP_MODE = process.env.MONGO_URI
  ? "mongo"
  : process.env.FILENAME ? "local" : "electron";
process.env.VUE_APP_IS_ADMIN = process.env.VUE_IS_ADMIN || 
  ((process.env.NODE_ENV === "development" || !process.env.MONGO_URI) ? "1" : undefined);

module.exports = {
  pages: {
    index: "src/pages/index.ts",
    eagle: "src/pages/eagle.ts",
    ...(process.env.VUE_APP_IS_ADMIN ? {
      admin: "src/pages/admin.ts"
    } : {})
  },
  runtimeCompiler: true,
  devServer: {
    port: 9000,
    proxy: {
      "^/api": {
        target: "http://localhost:24000"
      }
    },
    historyApiFallback: {
      rewrites: [
        // { from: /\/reveal/, to: '/reveal.html' },
        { from: /\/eagle/, to: '/eagle.html' },
        { from: /\/admin/, to: '/admin.html' }
      ]
    }
  }
}