<template>
    <div class="url-item-card">
        <div v-if="!editMode" class="url-item-content">
            <div class="url-info">
                <h3 class="short-url">
                    <a :href="shortUrl" target="_blank" class="short-link">{{ shortUrl }}</a>
                    <button @click="copyToClipboard(shortUrl)" class="btn-icon" title="Copy to clipboard">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                    </button>
                </h3>
                <p class="original-url" :title="url.originalUrl">{{ url.originalUrl }}</p>
                <div class="url-meta">
                    <span class="meta-item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        {{ formatDate(url.createdAt) }}
                    </span>
                    <span class="meta-item" v-if="url.clickCount !== undefined">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1-2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                        {{ url.clickCount }} clicks
                    </span>
                    <span :class="['status-badge', statusClass]">
                        {{ statusLabel }}
                    </span>
                </div>
            </div>
            
            <div class="url-actions">
                <div v-if="isAuthenticated" class="buttons-container">
                    <div class="share-dropdown">
                        <button class="btn btn-share btn-sm" title="Quick Share" @click="toggleShareMenu">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="18" cy="5" r="3"></circle>
                                <circle cx="6" cy="12" r="3"></circle>
                                <circle cx="18" cy="19" r="3"></circle>
                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                            </svg>
                            <span>Share</span>
                        </button>
                        <div class="share-menu" v-if="showShareMenu">
                            <a :href="getFacebookShareUrl()" target="_blank" class="share-item facebook">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                                </svg>
                                Facebook
                            </a>
                            <a :href="getTwitterShareUrl()" target="_blank" class="share-item twitter">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                                </svg>
                                Twitter
                            </a>
                            <a :href="getLinkedInShareUrl()" target="_blank" class="share-item linkedin">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                                    <rect x="2" y="9" width="4" height="12"></rect>
                                    <circle cx="4" cy="4" r="2"></circle>
                                </svg>
                                LinkedIn
                            </a>
                            <a :href="getWhatsAppShareUrl()" target="_blank" class="share-item whatsapp">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.195 2.105 3.195 5.1 4.485.714.3 1.27.48 1.704.629.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345m-5.446 7.443h-.016c-1.77 0-3.524-.48-5.055-1.38l-.36-.214-3.75.975 1.005-3.645-.239-.375a9.869 9.869 0 0 1-1.516-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.891-9.885 9.891m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                                </svg>
                                WhatsApp
                            </a>
                        </div>
                    </div>
                    <div class="edit-delete-buttons">
                        <button @click="toggleEditMode" class="btn btn-outline btn-sm" title="Edit URL">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1-3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button @click="removeUrl" class="btn btn-danger btn-sm" title="Delete URL">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1-2-2h4a2 2 0 0 1-2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                        </button>
                    </div>
                </div>
                <div v-else class="guest-message">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span>Login to manage</span>
                </div>
            </div>
        </div>

        <!-- Edit Mode -->
        <div v-else class="url-item-edit">
            <div class="form-group">
                <label class="form-label">Original URL</label>
                <input type="text" v-model="editedOriginalUrl" class="form-input" placeholder="Enter new original URL">
            </div>
            
            <div class="form-group">
                <label class="form-label">Short Code</label>
                <div class="input-group">
                    <span class="input-group-text">{{ baseUrl }}/</span>
                    <input type="text" v-model="editedShortCode" class="form-input" placeholder="Enter new short code">
                </div>
            </div>
            
            <div class="edit-actions">
                <button @click="saveChanges" class="btn btn-primary btn-sm" :disabled="isSaving">
                    <span v-if="isSaving">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="loading-icon">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
                        </svg>
                        Saving...
                    </span>
                    <span v-else>Save Changes</span>
                </button>
                <button @click="cancelEdit" class="btn btn-outline btn-sm">Cancel</button>
            </div>
        </div>
        
        <!-- Error Message -->
        <div v-if="error" class="alert alert-danger mt-3">
            {{ error }}
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import exportApis from '@/services/api/exportApis';

export default {
    name: 'UrlItem',
    props: {
        url: {
            type: Object,
            required: true
        },
        baseUrl: {
            type: String,
            default: window.location.origin
        },
    },
    data() {
        return {
            editMode: false,
            editedOriginalUrl: '',
            editedShortCode: '',
            error: null,
            isSaving: false,
            showShareMenu: false
        };
    },
    computed: {
        ...mapGetters(['isAuthenticated']),
        shortUrl() {
            return `${this.baseUrl}/${this.url.shortCode}`;
        },
        statusLabel() {
            return this.url.isActive ? 'Active' : 'Inactive';
        },
        statusClass() {
            return this.url.isActive ? 'status-active' : 'status-inactive';
        }
    },
    methods: {
        copyToClipboard(url) {
            navigator.clipboard.writeText(url).then(() => {
                this.$emit('show-notification', 'URL copied to clipboard');
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        },
        formatDate(dateString) {
            const options = { year: 'numeric', month: 'short', day: 'numeric' };
            return new Date(dateString).toLocaleDateString(undefined, options);
        },
        removeUrl() {
            this.$emit('remove', this.url.id);
        },
        toggleEditMode() {
            this.editMode = true;
            this.editedOriginalUrl = this.url.originalUrl;
            this.editedShortCode = this.url.shortCode;
            this.error = null;
        },
        cancelEdit() {
            this.editMode = false;
            this.error = null;
        },
        toggleShareMenu() {
            this.showShareMenu = !this.showShareMenu;
            
            // Đóng menu share khi click bên ngoài
            if (this.showShareMenu) {
                setTimeout(() => {
                    const clickHandler = (e) => {
                        // Kiểm tra nếu click bên ngoài menu
                        if (!e.target.closest('.share-dropdown')) {
                            this.showShareMenu = false;
                            document.removeEventListener('click', clickHandler);
                        }
                    };
                    document.addEventListener('click', clickHandler);
                }, 0);
            }
        },
        getFacebookShareUrl() {
            return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.shortUrl)}`;
        },
        getTwitterShareUrl() {
            return `https://twitter.com/intent/tweet?url=${encodeURIComponent(this.shortUrl)}`;
        },
        getLinkedInShareUrl() {
            return `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(this.shortUrl)}`;
        },
        getWhatsAppShareUrl() {
            return `https://api.whatsapp.com/send?text=${encodeURIComponent(this.shortUrl)}`;
        },
        validateInputs() {
            // Check URL
            if (!this.editedOriginalUrl) {
                this.error = 'URL cannot be empty';
                return false;
            }

            // Validate URL format
            try {
                new URL(this.editedOriginalUrl);
            } catch (e) {
                if (!this.editedOriginalUrl.startsWith('http://') && !this.editedOriginalUrl.startsWith('https://')) {
                    this.editedOriginalUrl = 'https://' + this.editedOriginalUrl;
                    try {
                        new URL(this.editedOriginalUrl);
                    } catch (e) {
                        this.error = 'Invalid URL format';
                        return false;
                    }
                } else {
                    this.error = 'Invalid URL format';
                    return false;
                }
            }

            // Check shortcode
            if (this.editedShortCode) {
                // Shortcode should only contain letters, numbers, dashes, and underscores
                const shortCodeRegex = /^[a-zA-Z0-9_-]+$/;
                if (!shortCodeRegex.test(this.editedShortCode)) {
                    this.error = 'Short code can only contain letters, numbers, underscores, and hyphens';
                    return false;
                }
            }

            return true;
        },
        async saveChanges() {
            if (!this.validateInputs()) {
                return;
            }

            this.isSaving = true;
            this.error = null;

            try {
                // Extract basic fields from original URL object
                const { id, userId, createdAt, clickCount, lastAccessed, expiryDate } = this.url;
                
                // Prepare data for update in PascalCase format as expected by API
                const updateData = {
                    Id: id,
                    OriginalUrl: this.editedOriginalUrl,
                    ShortCode: this.editedShortCode,
                    IsActive: true, // Always set to true since we're removing the inactive feature
                    UserId: userId,
                    CreatedAt: createdAt,
                    ClickCount: clickCount ?? 0,
                    LastAccessed: lastAccessed ?? null,
                    ExpiryDate: expiryDate ?? null
                };

                // Call API to update URL
                const response = await exportApis.urls.updateUrl(id, updateData);
                
                // Create updated URL object based on latest data
                // If API returns 204 No Content (no response data), use entered data
                const updatedUrlObj = {
                    id: id,
                    originalUrl: this.editedOriginalUrl,
                    shortCode: this.editedShortCode,
                    isActive: true, // Always set to true
                    userId: userId,
                    createdAt: createdAt,
                    clickCount: clickCount ?? 0,
                    lastAccessed: lastAccessed ?? null,
                    expiryDate: expiryDate ?? null
                };

                // If API returns data (not 204), use data from response
                if (response && Object.keys(response).length > 0) {
                    Object.assign(updatedUrlObj, {
                        id: response.id || response.Id || id,
                        originalUrl: response.originalUrl || response.OriginalUrl || this.editedOriginalUrl,
                        shortCode: response.shortCode || response.ShortCode || this.editedShortCode,
                        userId: response.userId || response.UserId || userId,
                        createdAt: response.createdAt || response.CreatedAt || createdAt,
                        clickCount: response.clickCount !== undefined ? response.clickCount : 
                                   response.ClickCount !== undefined ? response.ClickCount : clickCount,
                        lastAccessed: response.lastAccessed || response.LastAccessed || lastAccessed,
                        expiryDate: response.expiryDate || response.ExpiryDate || expiryDate
                    });
                }

                // Update current URL in component
                Object.assign(this.url, updatedUrlObj);

                // Update URL in parent component
                this.$emit('update', updatedUrlObj);

                // Exit edit mode
                this.editMode = false;
            } catch (error) {
                console.error('Error updating URL:', error);
                this.error = error.userMessage || 'Failed to update URL';
            } finally {
                this.isSaving = false;
            }
        },
        async toggleUrlStatus() {
            try {
                this.error = null;
                // Lưu trạng thái hiện tại để phục hồi nếu API gọi thất bại
                const previousState = this.url.isActive;
                
                // Gọi API để cập nhật trạng thái
                const response = await exportApis.urls.toggleUrlStatus(this.url.id, { IsActive: this.url.isActive });
                
                if (response && response.success) {
                    // Hiển thị thông báo cho người dùng
                    this.$emit('show-notification', `URL ${this.url.isActive ? 'activated' : 'deactivated'} successfully`);
                    
                    // Cập nhật URL trong parent component
                    this.$emit('update', {
                        ...this.url,
                        isActive: this.url.isActive
                    });
                } else {
                    // Phục hồi trạng thái nếu có lỗi
                    this.url.isActive = previousState;
                    throw new Error(response?.error || 'Failed to update URL status');
                }
            } catch (error) {
                console.error('Error toggling URL status:', error);
                this.error = error.message || 'Failed to toggle URL status';
                // Phục hồi trạng thái nếu có lỗi
                this.url.isActive = !this.url.isActive;
            }
        }
    }
}
</script>

<style scoped>
.url-item-card {
    background-color: white;
    border-radius: var(--rounded-lg);
    box-shadow: var(--shadow);
    overflow: hidden;
    border-left: 4px solid var(--primary-light);
    transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.url-item-card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
}

.url-item-content {
    padding: 1.25rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
}

.url-info {
    flex: 1;
    min-width: 0; /* Allow text to truncate */
}

.short-url {
    font-size: 1.125rem;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.short-link {
    color: var(--primary);
    font-weight: 600;
    text-decoration: none;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.short-link:hover {
    text-decoration: underline;
}

.btn-icon {
    background: none;
    border: none;
    color: var(--gray);
    cursor: pointer;
    padding: 0.25rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--rounded);
    transition: background-color 0.2s ease, color 0.2s ease;
}

.btn-icon:hover {
    background-color: rgba(59, 130, 246, 0.1);
    color: var(--primary);
}

.original-url {
    color: var(--gray);
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    word-break: break-all;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
}

.url-meta {
    display: flex;
    gap: 1rem;
    color: var(--gray);
    font-size: 0.75rem;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.status-badge {
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.25rem 0.5rem;
    border-radius: var(--rounded);
    text-transform: uppercase;
}

.status-active {
    background-color: var(--success-light);
    color: var(--success);
}

.status-inactive {
    background-color: var(--danger-light);
    color: var(--danger);
}

.url-actions {
    display: flex;
    gap: 0.5rem;
}

.buttons-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
}

.edit-delete-buttons {
    display: flex;
    gap: 0.5rem;
    justify-content: space-between;
    width: 100%;
}

.btn-danger {
    background-color: var(--danger);
    color: white;
    flex: 1;
}

.btn-danger:hover {
    background-color: #dc2626; /* Red 600 */
}

.btn-outline {
    border: 1px solid var(--primary);
    color: var(--primary);
    flex: 1;
}

.btn-outline:hover {
    background-color: var(--primary-light);
    color: white;
}

.share-dropdown {
    position: relative;
    width: 100%;
}

.btn-share {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background-color: #4299e1; /* Thay đổi thành màu xanh dương giống nút Copy */
    color: white;
    border: none;
    padding: 0.5rem 0.75rem;
    border-radius: var(--rounded);
    cursor: pointer;
    font-size: 0.875rem;
    transition: background-color 0.2s ease;
}

.btn-share:hover {
    background-color: #3182ce; /* Thay đổi tương ứng với background khi hover */
}

.share-menu {
    position: absolute;
    top: calc(100% + 5px);
    left: 0;
    min-width: 180px;
    background-color: white;
    border: 1px solid var(--gray-light);
    border-radius: var(--rounded);
    box-shadow: var(--shadow-md);
    z-index: 10;
    display: flex;
    flex-direction: column;
    padding: 0.5rem;
    animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}

.share-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.625rem 0.75rem;
    color: var(--gray-dark);
    text-decoration: none;
    border-radius: var(--rounded);
    transition: background-color 0.2s ease;
    font-size: 0.875rem;
    font-weight: 500;
}

.share-item:hover {
    background-color: var(--gray-lightest);
}

.share-item svg {
    flex-shrink: 0;
}

.facebook {
    color: #1877F2;
}

.facebook:hover {
    background-color: rgba(24, 119, 242, 0.1);
}

.twitter {
    color: #1DA1F2;
}

.twitter:hover {
    background-color: rgba(29, 161, 242, 0.1);
}

.linkedin {
    color: #0077B5;
}

.linkedin:hover {
    background-color: rgba(0, 119, 181, 0.1);
}

.whatsapp {
    color: #25D366;
}

.whatsapp:hover {
    background-color: rgba(37, 211, 102, 0.1);
}

.guest-message {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--gray);
    font-size: 0.75rem;
}

.url-item-edit {
    padding: 1.25rem;
}

.edit-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 1rem;
}

.loading-icon {
    animation: spin 1s linear infinite;
    margin-right: 0.25rem;
}

.mt-3 {
    margin-top: 1rem;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

@media (max-width: 640px) {
    .url-item-content {
        flex-direction: column;
    }
    
    .url-actions {
        width: 100%;
        justify-content: flex-start;
        margin-top: 0.5rem;
    }
}
</style>