<template>
    <div class="url-list">
        <h2>Shortened URLs</h2>
        <div v-if="loading" class="loading">
            Loading URLs...
        </div>
        <div v-else-if="urls.length === 0" class="no-urls">
            No URLs shortened yet.
        </div>
        <div v-else class="url-items">
            <url-item
                v-for="url in urls"
                :key="url.id"
                :url="url"
                @remove="removeUrl"
            />
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import UrlItem from './UrlItem.vue';

export default {
    name: 'UrlList',
    components: {
        UrlItem
    },
    data() {
        return {
            urls: [],
            loading: true,
        }
    },
    created() {
        this.fetchUrls();
    },
    methods: {
        async fetchUrls() {
            try {
                this.loading = true;
                const response = await axios.get('http://localhost:9999/gateway/urls');
                this.urls = response.data;
            } catch (error) {
                console.error('Error fetching URLs:', error);
            } finally {
                this.loading = false;
            }
        },
        async removeUrl(urlId) {
            try {
                await axios.delete(`http://localhost:9999/gateway/urls/${urlId}`);
                this.urls = this.urls.filter(url => url.id !== urlId);
            } catch (error) {
                console.error('Error deleting URL:', error);
            }
        }
    }
}

</script>

<style scoped>
.url-list {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

h2 {
    color: #2c3e50;
    margin-bottom: 20px;
}

.loading, .no-urls {
    text-align: center;
    padding: 20px;
    color: #666;
}

</style>