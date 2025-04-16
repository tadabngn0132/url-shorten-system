<template>
  <div class="home">
    <Shortener @url-shortened="refreshUrls" />
    <UrlList :key="refreshKey" />
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
  data() {
    return {
      refreshKey: 0
    }
  },
  methods: {
    refreshUrls() {
      // Force refresh component technique
      this.refreshKey += 1;
    }
  }
}
</script>

<style scoped>
.home {
  padding: 20px;
}
</style>