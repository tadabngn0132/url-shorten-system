<template>
    <div class="redirect">
        <h2>Redirecting...</h2>
        <div class="loading-spinner"></div>
        <p v-if="error" class="error-message">{{ error }}</p>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'RedirectView',
    data() {
        return {
            error: null
        };
    },
    created() {
        this.redirectToOriginalUrl();
    },
    methods: {
        async redirectToOriginalUrl() {
            const { shortCode } = this.$route.params;
            
            try {
            // First, we need to find the original URL based on the shortCode
            const response = await axios.get('http://localhost:9999/gateway/urls');
            const urls = response.data;
            const urlData = urls.find(url => url.shortCode === shortCode);
            
            if (urlData && urlData.originalUrl) {
                // Ensure URL has http:// or https:// prefix
                let originalUrl = urlData.originalUrl;
                if (!originalUrl.startsWith('http://') && !originalUrl.startsWith('https://')) {
                originalUrl = 'http://' + originalUrl;
                }
                
                // Redirect to original URL
                window.location.href = originalUrl;
            } else {
                this.error = 'Link does not exist or has expired.';
            }
            } catch (error) {
                console.error('Error redirecting:', error);
                this.error = 'Could not redirect. Please try again later.';
            }
        }
    }
}
</script>

<style scoped>
.redirect {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    text-align: center;
}

.loading-spinner {
    width: 50px;
    height: 50px;
    border: 5px solid #f3f3f3;
    border-top: 5px solid #42b983;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 20px 0;
}

.error-message {
    color: #f56c6c;
    margin-top: 20px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>