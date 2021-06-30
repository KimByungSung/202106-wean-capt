const target = "http://keepcool.kr";

module.exports = {
  devServer: {
    port: 8010,
    proxy: { // proxyTable 설정
      '^/api': {
        target,
        changeOrigin: true,
      }
    }
  }
}