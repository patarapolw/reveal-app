module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
  ? '/'
  : '',
  pages: {
    index: "src/main.ts",
    reveal: "src/reveal.ts"
  },
  devServer: {
    port: 9000,
    proxy: "http://localhost:24000"
  }
}