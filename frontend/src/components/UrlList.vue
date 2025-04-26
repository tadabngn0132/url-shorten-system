<template>
    <div class="url-list-container">
        <div class="card">
            <div class="card-header">
                <div class="flex-between">
                    <h2 class="card-title">Your Shortened URLs</h2>
                    <div v-if="isAuthenticated">
                        <router-link to="/dashboard" class="btn btn-outline btn-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="3" width="7" height="7"></rect>
                                <rect x="14" y="3" width="7" height="7"></rect>
                                <rect x="14" y="14" width="7" height="7"></rect>
                                <rect x="3" y="14" width="7" height="7"></rect>
                            </svg>
                            Dashboard
                        </router-link>
                    </div>
                </div>
            </div>
            
            <div class="card-body">
                <!-- Notification Message -->
                <div v-if="notification" class="alert alert-success">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    {{ notification }}
                </div>
                
                <!-- Search and Filter Controls -->
                <div class="list-controls">
                    <div class="search-container">
                        <div class="input-group">
                            <input 
                                type="text" 
                                v-model="searchQuery" 
                                @input="handleSearch" 
                                placeholder="Search URLs..." 
                                class="form-input"
                            />
                            <button class="input-group-text" @click="clearSearch" v-if="searchQuery">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                            <button class="input-group-text" @click="handleSearch">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="sort-container">
                        <select v-model="sortBy" @change="handleSort" class="form-input">
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="most-clicked">Most Clicked</option>
                            <option value="least-clicked">Least Clicked</option>
                        </select>
                    </div>
                </div>
                
                <!-- Loading state -->
                <div v-if="loading" class="loading-state">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="loading-icon">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
                    </svg>
                    <p>Loading your URLs...</p>
                </div>
                
                <!-- Empty state -->
                <div v-else-if="filteredUrls.length === 0 && !searchQuery" class="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                        <path d="M12 20v2"></path>
                        <path d="M12 14v2"></path>
                        <path d="M12 8v2"></path>
                        <path d="M12 2v2"></path>
                    </svg>
                    <p>No URLs shortened yet. Try creating your first short link above!</p>
                </div>
                
                <!-- No search results -->
                <div v-else-if="filteredUrls.length === 0 && searchQuery" class="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        <line x1="8" y1="11" x2="14" y2="11"></line>
                    </svg>
                    <p>No results found for "{{ searchQuery }}"</p>
                    <button @click="clearSearch" class="btn btn-outline btn-sm mt-2">Clear Search</button>
                </div>
                
                <!-- URL List -->
                <div v-else class="url-items">
                    <url-item
                        v-for="url in paginatedUrls"
                        :key="url.id"
                        :url="url"
                        @remove="removeUrl"
                        @update="updateUrl"
                        @show-notification="showNotification"
                    />
                    
                    <!-- Pagination -->
                    <div class="pagination" v-if="totalPages > 1">
                        <button 
                            @click="currentPage = 1" 
                            class="page-button" 
                            :disabled="currentPage === 1"
                            :class="{ 'disabled': currentPage === 1 }"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="11 17 6 12 11 7"></polyline>
                                <polyline points="18 17 13 12 18 7"></polyline>
                            </svg>
                        </button>
                        <button 
                            @click="prevPage" 
                            class="page-button" 
                            :disabled="currentPage === 1"
                            :class="{ 'disabled': currentPage === 1 }"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                        </button>
                        
                        <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
                        
                        <button 
                            @click="nextPage" 
                            class="page-button" 
                            :disabled="currentPage === totalPages"
                            :class="{ 'disabled': currentPage === totalPages }"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                        <button 
                            @click="currentPage = totalPages" 
                            class="page-button" 
                            :disabled="currentPage === totalPages"
                            :class="{ 'disabled': currentPage === totalPages }"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="13 17 18 12 13 7"></polyline>
                                <polyline points="6 17 11 12 6 7"></polyline>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- Items per page selector -->
                    <div class="items-per-page">
                        <label for="itemsPerPage">Show per page:</label>
                        <select id="itemsPerPage" v-model="itemsPerPage" @change="handleItemsPerPageChange" class="form-select">
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Guest mode info -->
        <div v-if="!isAuthenticated && urls.length > 0" class="guest-mode-card">
            <div class="card mt-4">
                <div class="card-body">
                    <div class="flex">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                        <div>
                            <h3>You're in guest mode</h3>
                            <p>Your shortened URLs are only stored on this device. <router-link to="/login" class="link">Login</router-link> or <router-link to="/login?register=true" class="link">register</router-link> to manage your URLs across devices and access analytics.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import exportApis from '@/services/api/exportApis';
import UrlItem from './UrlItem.vue';
import { mapGetters, mapState } from 'vuex';

// Helper function for debouncing
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

export default {
    name: 'UrlList',
    components: {
        UrlItem
    },
    data() {
        return {
            urls: [],
            loading: true,
            notification: null,
            notificationTimeout: null,
            searchQuery: '',
            sortBy: 'newest',
            currentPage: 1,
            itemsPerPage: 10
        }
    },
    computed: {
        ...mapGetters(['isAuthenticated']),
        ...mapState({
            auth: state => state.auth
        }),
        
        // Filter URLs based on search
        filteredUrls() {
            if (!this.searchQuery.trim()) {
                return this.sortedUrls;
            }
            
            const query = this.searchQuery.toLowerCase();
            return this.sortedUrls.filter(url => {
                return url.originalUrl.toLowerCase().includes(query) || 
                       url.shortCode.toLowerCase().includes(query);
            });
        },
        
        // Sort URLs
        sortedUrls() {
            const sorted = [...this.urls];
            
            switch (this.sortBy) {
                case 'newest':
                    return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                case 'oldest':
                    return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                case 'most-clicked':
                    return sorted.sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0));
                case 'least-clicked':
                    return sorted.sort((a, b) => (a.clickCount || 0) - (b.clickCount || 0));
                default:
                    return sorted;
            }
        },
        
        // Paginate URLs
        paginatedUrls() {
            const startIndex = (this.currentPage - 1) * this.itemsPerPage;
            const endIndex = startIndex + this.itemsPerPage;
            return this.filteredUrls.slice(startIndex, endIndex);
        },
        
        // Calculate total pages
        totalPages() {
            return Math.ceil(this.filteredUrls.length / this.itemsPerPage);
        }
    },
    created() {
        this.fetchUrls();
        // Initialize with saved preference if available
        const savedItemsPerPage = localStorage.getItem('urlsPerPage');
        if (savedItemsPerPage) {
            this.itemsPerPage = parseInt(savedItemsPerPage);
        }
        // Setup debounced search
        this.debouncedSearch = debounce(this.performSearch, 300);
    },
    methods: {
        async fetchUrls() {
            try {
                this.loading = true;
                
                if (this.isAuthenticated) {
                    // Only call API if user is logged in
                    const response = await exportApis.urls.getAllUrls();
                    // Filter URLs for current user
                    this.urls = response.filter(url => url.userId === this.auth.user.id);
                } else {
                    // If not logged in, get URL IDs from localStorage
                    const guestUrlIds = JSON.parse(localStorage.getItem('guestUrlIds') || '[]');
                    
                    // If guest has URL IDs, make individual requests for info
                    if (guestUrlIds.length > 0) {
                        const guestUrls = [];
                        
                        // Get URL info for each ID
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
                        
                        // Update URLs list
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
                    
                    // Adjust current page if necessary
                    if (this.paginatedUrls.length === 0 && this.currentPage > 1) {
                        this.currentPage--;
                    }
                    
                    this.showNotification('URL deleted successfully');
                } catch (error) {
                    console.error('Error deleting URL:', error);
                    alert('Failed to delete URL. Please try again.');
                }
            }
        },
        
        // Update URL
        async updateUrl(updatedUrl) {
            if (!updatedUrl || !updatedUrl.id) {
                console.error('Invalid updated URL object:', updatedUrl);
                return;
            }
            
            const index = this.urls.findIndex(url => url.id === updatedUrl.id);
            if (index !== -1) {
                // Update the URL in the list
                this.$set(this.urls, index, updatedUrl);
                
                // If URL is activated, refresh data from server
                if (updatedUrl.isActive) {
                    try {
                        // Confirm URL status from server
                        const refreshedUrl = await exportApis.urls.getUrlById(updatedUrl.id);
                        if (refreshedUrl && refreshedUrl.id) {
                            // Update with latest data from server
                            this.$set(this.urls, index, refreshedUrl);
                            console.log('URL refreshed from server:', refreshedUrl);
                        }
                    } catch (error) {
                        console.error('Error refreshing URL data:', error);
                    }
                }
                
                // Show update notification
                this.showNotification('URL updated successfully');
                
                // Store updated URL list for guests
                if (!this.isAuthenticated) {
                    const guestUrlIds = this.urls.map(url => url.id);
                    localStorage.setItem('guestUrlIds', JSON.stringify(guestUrlIds));
                }
            } else {
                console.error('Could not find URL with ID', updatedUrl.id);
            }
        },
        
        // Show notification
        showNotification(message) {
            this.notification = message;
            
            // Clear notification after 3 seconds
            if (this.notificationTimeout) {
                clearTimeout(this.notificationTimeout);
            }
            
            this.notificationTimeout = setTimeout(() => {
                this.notification = null;
            }, 3000);
        },
        
        // Add a new URL to the list without refetching everything
        addNewUrl(urlData) {
            if (!urlData) return;
            
            // Add to beginning of list for better visibility
            this.urls.unshift(urlData);
            
            // Reset to first page to show new URL
            this.currentPage = 1;
        },
        
        // Search handling
        handleSearch() {
            this.debouncedSearch();
        },
        
        performSearch() {
            // Reset to first page when searching
            this.currentPage = 1;
        },
        
        clearSearch() {
            this.searchQuery = '';
            this.currentPage = 1;
        },
        
        // Sorting
        handleSort() {
            // Reset to first page when sorting changes
            this.currentPage = 1;
        },
        
        // Pagination
        nextPage() {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
            }
        },
        
        prevPage() {
            if (this.currentPage > 1) {
                this.currentPage--;
            }
        },
        
        // Items per page
        handleItemsPerPageChange() {
            // Save preference to localStorage
            localStorage.setItem('urlsPerPage', this.itemsPerPage.toString());
            // Reset to first page
            this.currentPage = 1;
        }
    },
    watch: {
        // Refresh URLs when auth state changes
        isAuthenticated() {
            this.fetchUrls();
        }
    },
    beforeDestroy() {
        // Clear timeout when component is destroyed
        if (this.notificationTimeout) {
            clearTimeout(this.notificationTimeout);
        }
    }
}
</script>

<style scoped>
.url-list-container {
    margin-top: 2rem;
}

.card-title {
    margin-bottom: 0;
}

.flex-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.flex {
    display: flex;
    gap: 1rem;
}

.url-items {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.loading-state, .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 0;
    color: var(--gray);
    text-align: center;
}

.loading-icon {
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
}

.empty-state svg {
    margin-bottom: 1rem;
    color: var(--gray-light);
}

.list-controls {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
}

.search-container {
    flex: 1;
    min-width: 200px;
}

.sort-container {
    width: 150px;
}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 1.5rem;
    gap: 0.5rem;
}

.page-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: var(--rounded);
    border: 1px solid var(--gray-light);
    background-color: white;
    cursor: pointer;
    transition: all 0.2s ease;
}

.page-button:hover:not(.disabled) {
    background-color: var(--primary-light);
    color: white;
    border-color: var(--primary-light);
}

.page-button.disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.page-info {
    padding: 0 0.75rem;
    color: var(--gray);
    font-size: 0.875rem;
}

.items-per-page {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 1rem;
    color: var(--gray);
    font-size: 0.875rem;
}

.form-select {
    padding: 0.25rem 0.5rem;
    border: 1px solid var(--gray-light);
    border-radius: var(--rounded);
    background-color: white;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.mt-2 {
    margin-top: 0.5rem;
}

.mt-4 {
    margin-top: 1.5rem;
}

.link {
    color: var(--primary);
    font-weight: 500;
}

@media (max-width: 768px) {
    .list-controls {
        flex-direction: column;
    }
    
    .search-container, .sort-container {
        width: 100%;
    }
    
    .items-per-page {
        justify-content: center;
    }
}
</style>