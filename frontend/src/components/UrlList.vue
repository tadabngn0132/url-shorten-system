<template>
    <div class="url-list">
        <h2>Shortened URLs</h2>
        
        <div v-if="isAuthenticated" class="auth-actions">
            <router-link to="/dashboard" class="dashboard-link">
                Go to Dashboard for Advanced Management
            </router-link>
        </div>
        
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
        
        <div v-if="!isAuthenticated" class="guest-mode-info">
            <p>You are in guest mode. <router-link to="/login">Login</router-link> to manage your URLs across devices.</p>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import UrlItem from './UrlItem.vue';
import { mapGetters, mapState } from 'vuex';

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
    computed: {
        ...mapGetters(['isAuthenticated']),
        ...mapState(['auth'])
    },
    created() {
        this.fetchUrls();
    },
    methods: {
        async fetchUrls() {
            try {
                this.loading = true;
                
                // Thêm header xác thực nếu đã đăng nhập
                const headers = {};
                if (this.isAuthenticated && this.auth.token) {
                    headers['Authorization'] = `Bearer ${this.auth.token}`;
                }
                
                const response = await axios.get('http://localhost:9999/gateway/urls', { headers });
                
                // Nếu đã đăng nhập, hiển thị tất cả URLs
                // Nếu là khách, chỉ hiển thị URLs từ phiên hiện tại (lưu trong localStorage)
                if (this.isAuthenticated) {
                    // Lọc URLs của người dùng hiện tại nếu cần
                    this.urls = response.data.filter(url => url.userId === this.auth.user.id);
                } else {
                    // Lấy danh sách URLs của khách từ localStorage hoặc sử dụng danh sách trống
                    const guestUrlIds = JSON.parse(localStorage.getItem('guestUrlIds')) || [];
                    this.urls = response.data.filter(url => guestUrlIds.includes(url.id));
                }
            } catch (error) {
                console.error('Error fetching URLs:', error);
            } finally {
                this.loading = false;
            }
        },
        async removeUrl(urlId) {
            try {
                // Thêm header xác thực nếu đã đăng nhập
                const headers = {};
                if (this.isAuthenticated && this.auth.token) {
                    headers['Authorization'] = `Bearer ${this.auth.token}`;
                }
                
                await axios.delete(`http://localhost:9999/gateway/urls/${urlId}`, { headers });
                this.urls = this.urls.filter(url => url.id !== urlId);
                
                // Nếu là khách, cập nhật localStorage
                if (!this.isAuthenticated) {
                    const guestUrlIds = JSON.parse(localStorage.getItem('guestUrlIds')) || [];
                    const updatedIds = guestUrlIds.filter(id => id !== urlId);
                    localStorage.setItem('guestUrlIds', JSON.stringify(updatedIds));
                }
            } catch (error) {
                console.error('Error deleting URL:', error);
            }
        },
        // Phương thức để lưu ID URL mới của khách
        saveGuestUrlId(urlId) {
            if (!this.isAuthenticated) {
                const guestUrlIds = JSON.parse(localStorage.getItem('guestUrlIds')) || [];
                guestUrlIds.push(urlId);
                localStorage.setItem('guestUrlIds', JSON.stringify(guestUrlIds));
            }
        }
    },
    watch: {
        // Theo dõi sự thay đổi trong trạng thái xác thực và làm mới danh sách URLs
        isAuthenticated() {
            this.fetchUrls();
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

.auth-actions {
    margin-bottom: 20px;
    text-align: center;
}

.dashboard-link {
    display: inline-block;
    background-color: #42b983;
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    text-decoration: none;
    font-weight: 500;
    transition: background-color 0.3s;
}

.dashboard-link:hover {
    background-color: #3aa876;
}

.guest-mode-info {
    margin-top: 30px;
    padding: 15px;
    background-color: #f8f9fa;
    border-radius: 5px;
    text-align: center;
    border: 1px solid #eee;
}

.guest-mode-info p {
    margin: 0;
    color: #666;
}

.guest-mode-info a {
    color: #42b983;
    font-weight: bold;
    text-decoration: none;
}

.guest-mode-info a:hover {
    text-decoration: underline;
}
</style>