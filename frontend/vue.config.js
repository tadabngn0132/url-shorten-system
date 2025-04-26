const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  // Đảm bảo không có cấu hình proxy cho API
  devServer: {
    proxy: null
  }
})
