<template>
    <div class="shortener-container">
        <div class="shortener-hero">
            <h1 class="shortener-title">Shorten Your Links</h1>
            <p class="shortener-description">Create short, memorable links in seconds with our powerful URL shortener tool.</p>
        </div>

        <div class="card">
            <div class="card-body">
                <form @submit.prevent="shortenUrl" class="shortener-form">
                    <div class="form-group">
                        <label class="form-label" for="original-url">Enter a long URL</label>
                        <input
                            type="url"
                            id="original-url"
                            v-model="originalUrl"
                            placeholder="https://example.com/very/long/url/that/needs/shortening"
                            required
                            class="form-input"
                        />
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="custom-code">Custom short code (optional)</label>
                        <div class="input-group">
                            <span class="input-group-text">{{ baseUrl }}/</span>
                            <input
                                type="text"
                                id="custom-code"
                                v-model="customCode"
                                placeholder="my-custom-url"
                                class="form-input"
                            />
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary btn-block" :disabled="isSubmitting">
                        <svg v-if="isSubmitting" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="loading-icon">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
                        </svg>
                        <span v-else>Shorten URL</span>
                    </button>

                    <!-- Login notice for guest users -->
                    <div v-if="!isAuthenticated" class="alert alert-info mt-3">
                        <div class="flex">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="16" x2="12" y2="12"></line>
                                <line x1="12" y1="8" x2="12.01" y2="8"></line>
                            </svg>
                            <div>
                                <router-link to="/login">Log in</router-link> or 
                                <router-link to="/login?register=true">register</router-link> 
                                for advanced URL management and bulk shortening.
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>

        <div v-if="error" class="alert alert-danger mt-4">
            {{ error }}
        </div>

        <div v-if="shortenedUrl" class="card mt-4 result-card">
            <div class="card-header">
                <h3>Your shortened URL is ready!</h3>
            </div>
            <div class="card-body">
                <div class="result-container">
                    <a :href="shortenedUrl" target="_blank" class="result-url">{{ shortenedUrl }}</a>
                    <div class="result-actions">
                        <button @click="copyToClipboard(shortenedUrl)" class="btn btn-primary btn-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1-2 2v1"></path>
                            </svg>
                            Copy
                        </button>
                        <button @click="shareUrl" class="btn btn-success btn-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="18" cy="5" r="3"></circle>
                                <circle cx="6" cy="12" r="3"></circle>
                                <circle cx="18" cy="19" r="3"></circle>
                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                            </svg>
                            Share
                        </button>
                        <button @click="resetForm" class="btn btn-outline btn-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                                <path d="M3 3v5h5"></path>
                            </svg>
                            Create Another
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import exportApis from '@/services/api/exportApis';

export default {
    name: 'Shortener',
    data() {
        return {
            originalUrl: '',
            customCode: '',
            isSubmitting: false,
            shortenedUrl: null,
            error: '',
            baseUrl: window.location.origin
        };
    },
    computed: {
        ...mapGetters(['isAuthenticated']),
        ...mapState({
            auth: state => state.auth
        })
    },
    methods: {
        async shortenUrl() {
            this.error = '';
            this.isSubmitting = true;
            
            try {
                // Prepare data
                const urlData = {
                    originalUrl: this.originalUrl,
                    shortCode: this.customCode || '',
                    isActive: true,
                    userId: this.isAuthenticated ? this.auth.user.id : "guest"
                };
                
                // Call API
                const response = await exportApis.urls.createUrl(urlData);
                
                if (response && response.shortCode) {
                    // Save URL ID to localStorage for guests
                    if (!this.isAuthenticated) {
                        const guestUrlIds = JSON.parse(localStorage.getItem('guestUrlIds') || '[]');
                        guestUrlIds.push(response.id);
                        localStorage.setItem('guestUrlIds', JSON.stringify(guestUrlIds));
                    }
                    
                    // Show result
                    this.shortenedUrl = `${window.location.origin}/${response.shortCode}`;
                    
                    // Emit event with new URL data to update UrlList
                    this.$emit('url-shortened', response);
                }
            } catch (error) {
                console.error('Error shortening URL:', error);
                this.error = error.userMessage || 'Failed to shorten URL. Please try again.';
            } finally {
                this.isSubmitting = false;
            }
        },
        
        copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                // Could use toast notification here
                alert('URL copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy:', err);
            });
        },
        
        resetForm() {
            this.originalUrl = '';
            this.customCode = '';
            this.shortenedUrl = null;
        },

        shareUrl() {
            if (navigator.share) {
                navigator.share({
                    title: 'Check out this shortened URL',
                    url: this.shortenedUrl
                }).catch(err => {
                    console.error('Error sharing URL:', err);
                });
            } else {
                alert('Sharing is not supported on this browser.');
            }
        }
    }
};
</script>

<style scoped>
.loading-icon {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.mt-3 {
    margin-top: 1rem;
}

.mt-4 {
    margin-top: 1.5rem;
}

.result-card {
    border-left: 4px solid var(--primary);
}

.result-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
    flex-wrap: wrap;
}

.btn-success {
    background-color: #28a745;
    color: white;
    border-color: #28a745;
}

.btn-success:hover {
    background-color: #218838;
    border-color: #1e7e34;
}

.result-url {
    display: block;
    font-size: 1.1rem;
    word-break: break-all;
    color: var(--primary);
    text-decoration: none;
    margin-bottom: 0.5rem;
}

.result-url:hover {
    text-decoration: underline;
}

.result-container {
    padding: 0.5rem;
    border-radius: var(--rounded);
}
</style>