<template>
    <div class="redirect">
        <div v-if="loading">
            <h2>Redirecting...</h2>
            <div class="loading-spinner"></div>
        </div>
        <div v-else-if="notFound" class="not-found-message">
            <h2>URL Not Found</h2>
            <div class="info-card">
                <p class="main-message">The shortened URL you're looking for does not exist.</p>
                <div class="actions">
                    <router-link to="/" class="home-link">Go to Homepage</router-link>
                    <button @click="createNewShortUrl" class="create-link">Create a new short URL</button>
                </div>
                <p class="suggestion">The link might have been typed incorrectly or has been removed by the owner.</p>
            </div>
        </div>
        <div v-else-if="error" class="error-message">
            <h2>Error Occurred</h2>
            <div class="info-card">
                <p class="main-message">{{ error }}</p>
                <div class="actions">
                    <router-link to="/" class="home-link">Go to Homepage</router-link>
                    <button @click="retryRedirect" class="retry-link">Try Again</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'RedirectView',
    data() {
        return {
            loading: true,
            error: null,
            notFound: false,
            retryCount: 0,
            maxRetries: 2
        };
    },
    created() {
        this.redirectToOriginalUrl();
    },
    methods: {
        async redirectToOriginalUrl() {
            const { shortCode } = this.$route.params;
            const apiBaseUrl = process.env.VUE_APP_API_BASE_URL || 'http://localhost:9999';
            
            // Thêm timestamp để tránh cache trình duyệt
            const noCache = Date.now();
            
            this.loading = true;
            this.error = null;
            
            try {
                // Sử dụng fetch API để gọi trực tiếp endpoint redirect với tham số cache busting
                const response = await fetch(`${apiBaseUrl}/gateway/urls/redirect/${shortCode}?_=${noCache}`, {
                    // Thêm timeout để tránh đợi quá lâu
                    signal: AbortSignal.timeout(10000), // 10 giây timeout
                    // Thêm cache: 'no-store' để đảm bảo không lưu cache
                    cache: 'no-store',
                    headers: {
                        'Pragma': 'no-cache',
                        'Cache-Control': 'no-cache, no-store, must-revalidate'
                    }
                });
                
                // Xử lý các trường hợp theo mã trạng thái HTTP
                if (response.status === 200) {
                    // Link hợp lệ, lấy URL đích và chuyển hướng trực tiếp
                    const targetUrl = await response.text();
                    
                    // Gửi thông tin về việc link được truy cập (không ảnh hưởng đến CORS)
                    this.trackRedirectAttempt(shortCode);
                    
                    // Chuyển hướng trực tiếp đến URL đích
                    window.location.href = targetUrl;
                } else if (response.status === 404) {
                    // Link không tồn tại
                    this.notFound = true;
                    this.loading = false;
                } else {
                    // Các lỗi khác
                    this.error = `Error: ${response.statusText || 'Unknown error occurred'}`;
                    this.loading = false;
                }
            } catch (error) {
                // Xử lý lỗi kết nối và timeout
                if (error.name === 'AbortError') {
                    this.error = 'Connection timed out. The server took too long to respond.';
                } else {
                    this.error = 'Cannot connect to the server. Please try again later.';
                }
                this.loading = false;
                
                // Fallback: nếu fetch không hoạt động và chưa đạt giới hạn retry
                if (this.retryCount < this.maxRetries) {
                    this.retryCount++;
                    console.log(`Retrying (${this.retryCount}/${this.maxRetries})...`);
                    
                    setTimeout(() => {
                        this.redirectToOriginalUrl();
                    }, 2000);
                }
            }
        },
        
        trackRedirectAttempt(shortCode) {
            // Phương thức này có thể gửi dữ liệu phân tích về việc truy cập link
            console.log(`Tracking redirect attempt for: ${shortCode}`);
            // Trong môi trường thực tế, triển khai theo dõi phân tích thực tế
        },
        
        retryRedirect() {
            this.retryCount = 0; // Reset retry count when manually retrying
            this.redirectToOriginalUrl();
        },
        
        createNewShortUrl() {
            this.$router.push('/');
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
    max-width: 600px;
    margin: 0 auto;
    padding: 0 20px;
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

.error-message, .not-found-message {
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 30px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    width: 100%;
}

.home-link {
    background-color: #42b983;
    color: white;
    border: none;
}

.home-link:hover {
    background-color: #3aa876;
}

.create-link, .retry-link {
    background-color: white;
    color: #333;
    border: 1px solid #ddd;
    margin-top: 10px;
}

.create-link:hover, .retry-link:hover {
    background-color: #f5f5f5;
}

.info-card {
    background-color: #fff;
    padding: 20px;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.suggestion {
    font-size: 12px;
    color: #666;
    margin-top: 20px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>