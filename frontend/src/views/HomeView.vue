<template>
  <div class="home">
    <Shortener @url-shortened="handleUrlShortened" />
    <UrlList ref="urlList" />
  </div>
</template>

<script>
import Shortener from '@/components/Shortener.vue'
import UrlList from '@/components/UrlList.vue'

export default {
  name: 'HomeView',
  components: {
    Shortener,
    UrlList
  },
  methods: {
    handleUrlShortened(newUrl) {
      // Truyền dữ liệu URL mới trực tiếp đến UrlList component
      if (this.$refs.urlList && newUrl) {
        this.$refs.urlList.addNewUrl(newUrl);
      }
    }
  }
}
</script>

<style scoped>
.home {
  padding: 20px;
}
</style>