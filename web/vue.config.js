module.exports = {
  publicPath: '',
  pages: {
    index: "src/main.ts",
    reveal: "src/reveal.ts"
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