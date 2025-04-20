<template>
    <div class="redirect">
        <h2>Redirecting...</h2>
        <div class="loading-spinner"></div>
        <p v-if="error" class="error-message">{{ error }}</p>
    </div>
</template>

<script>
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
                // Thay đổi đường dẫn redirect - lấy từ API gateway trực tiếp
                window.location.href = `${process.env.VUE_APP_API_BASE_URL}/gateway/urls/redirect/${shortCode}`;
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