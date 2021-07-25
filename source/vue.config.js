const target = "http://demo.weandsoft.com";

module.exports = {
  devServer: {
    port: 8010,
    proxy: { // proxyTable 설정
      '^/addon': {
        target,
        changeOrigin: true,
      },
      '^/rest': {
        target,
        changeOrigin: true,
      }
    }
  }
}