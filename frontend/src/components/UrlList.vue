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
import exportApis from '@/services/api/exportApis';
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
        ...mapState({
            auth: state => state.auth
        })
    },
    created() {
        this.fetchUrls();
    },
    methods: {
        async fetchUrls() {
            try {
                this.loading = true;
                
                if (this.isAuthenticated) {
                    // Chỉ gọi API nếu người dùng đã đăng nhập
                    const response = await exportApis.urls.getAllUrls();
                    // Lọc URL cho người dùng hiện tại
                    this.urls = response.filter(url => url.userId === this.auth.user.id);
                } else {
                    // Nếu chưa đăng nhập, lấy ID URL từ localStorage
                    const guestUrlIds = JSON.parse(localStorage.getItem('guestUrlIds') || '[]');
                    
                    // Nếu có ID URL của khách, thực hiện các request riêng lẻ để lấy thông tin
                    if (guestUrlIds.length > 0) {
                        const guestUrls = [];
                        
                        // Lấy thông tin URL cho từng ID
                        for (const urlId of guestUrlIds) {
                            try {
                                const urlData = await exportApis.urls.getUrlById(urlId);
                                if (urlData) {
                                    guestUrls.push(urlData);
                                }
                            } catch (err) {
                                console.error(`Error fetching URL with ID ${urlId}:`, err);
                            }
                        }
                        
                        // Cập nhật danh sách URLs
                        this.urls = guestUrls;
                    } else {
                        this.urls = [];
                    }
                }
            } catch (error) {
                console.error('Error fetching URLs:', error);
                this.urls = [];
            } finally {
                this.loading = false;
            }
        },
        
        async removeUrl(urlId) {
            if (confirm('Are you sure you want to delete this URL?')) {
                try {
                    if (this.isAuthenticated) {
                        // Delete from server if authenticated
                        await exportApis.urls.deleteUrl(urlId);
                    }
                    
                    // Remove from local list
                    this.urls = this.urls.filter(url => url.id !== urlId);
                    
                    // Also remove from local storage if guest
                    if (!this.isAuthenticated) {
                        const guestUrlIds = JSON.parse(localStorage.getItem('guestUrlIds') || '[]');
                        const updatedIds = guestUrlIds.filter(id => id !== urlId);
                        localStorage.setItem('guestUrlIds', JSON.stringify(updatedIds));
                    }
                } catch (error) {
                    console.error('Error deleting URL:', error);
                    alert('Failed to delete URL. Please try again.');
                }
            }
        },
        
        // Save a new URL ID to guest storage
        saveGuestUrlId(urlId) {
            if (!this.isAuthenticated) {
                const guestUrlIds = JSON.parse(localStorage.getItem('guestUrlIds') || '[]');
                guestUrlIds.push(urlId);
                localStorage.setItem('guestUrlIds', JSON.stringify(guestUrlIds));
            }
        },
        
        // Add a new URL to the list without refetching everything
        addNewUrl(urlData) {
            if (!urlData) return;
            
            // Add to beginning of list for better visibility
            this.urls.unshift(urlData);
        }
    },
    watch: {
        // Refresh URLs when auth state changes
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