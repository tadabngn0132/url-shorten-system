<template>
    <div class="url-item">
        <div class="url-details">
            <div class="original-url">
                <h4>Original URL:</h4>
                <p v-if="!editMode"> {{ url.originalUrl }}</p>
                <div v-else class="edit-field">
                    <input type="text" v-model="editedOriginalUrl" placeholder="Enter new URL">
                </div>
            </div>
            <div class="short-url">
                <h4>Shortened URL:</h4>
                <a v-if="!editMode" :href="shortUrl" target="_blank">{{ shortUrl }}</a>
                <div v-else class="edit-field shortcode-edit">
                    <span>{{ baseUrl }}/</span>
                    <input type="text" v-model="editedShortCode" placeholder="Enter new shortcode">
                </div>
                <button v-if="!editMode" @click="copyToClipboard(shortUrl)" class="btn-copy">
                    Copy
                </button>
            </div>
            <div class="created-at">
                <small>Created at: {{ formatDate(url.createdAt) }}</small>
            </div>
            <div v-if="url.clickCount !== undefined" class="click-count">
                <small>Clicks: {{ url.clickCount }}</small>
            </div>
        </div>
        <div class="url-actions">
            <div v-if="isAuthenticated">
                <div v-if="editMode" class="edit-actions">
                    <button @click="saveChanges" class="btn-save" :disabled="isSaving">{{ isSaving ? 'Saving...' : 'Save' }}</button>
                    <button @click="cancelEdit" class="btn-cancel">Cancel</button>
                </div>
                <div v-else class="normal-actions">
                    <button @click="toggleEditMode" class="btn-edit">Edit</button>
                    <button @click="removeUrl" class="btn-delete">Delete</button>
                </div>
            </div>
            <!-- Hiển thị thông báo đối với guest -->
            <small v-else class="guest-message">Login to manage URLs</small>
        </div>
        <!-- Hiển thị lỗi nếu có -->
        <div v-if="error" class="error-message">
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
            isSaving: false
        };
    },
    computed: {
        ...mapGetters(['isAuthenticated']),
        shortUrl() {
            const baseUrl = window.location.origin;
            return `${baseUrl}/${this.url.shortCode}`;
        }
    },
    methods: {
        copyToClipboard(url) {
            navigator.clipboard.writeText(url).then(() => {
                alert('URL đã được sao chép vào clipboard!');
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        },
        formatDate(dateString) {
            const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
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
        validateInputs() {
            // Kiểm tra URL
            if (!this.editedOriginalUrl) {
                this.error = 'URL không được để trống';
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
                        this.error = 'URL không hợp lệ';
                        return false;
                    }
                } else {
                    this.error = 'URL không hợp lệ';
                    return false;
                }
            }

            // Kiểm tra shortcode
            if (this.editedShortCode) {
                // Shortcode chỉ được chứa chữ cái, số, dấu gạch ngang và gạch dưới
                const shortCodeRegex = /^[a-zA-Z0-9_-]+$/;
                if (!shortCodeRegex.test(this.editedShortCode)) {
                    this.error = 'Shortcode chỉ có thể chứa chữ cái, số, dấu gạch ngang và gạch dưới';
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
                // Trích xuất các trường cơ bản từ đối tượng URL ban đầu
                const { id, userId, createdAt, clickCount, lastAccessed, expiryDate } = this.url;
                
                // Chuẩn bị dữ liệu để cập nhật với đúng định dạng PascalCase
                const updateData = {
                    Id: id,
                    OriginalUrl: this.editedOriginalUrl,
                    ShortCode: this.editedShortCode,
                    IsActive: this.url.isActive ?? true,
                    UserId: userId,
                    CreatedAt: createdAt,
                    ClickCount: clickCount ?? 0,
                    LastAccessed: lastAccessed ?? null,
                    ExpiryDate: expiryDate ?? null
                };

                // Log dữ liệu để debug
                console.log('Sending URL update with data:', JSON.stringify(updateData));
                console.log('URL ID from params:', id);

                // Gọi API để cập nhật URL
                const response = await exportApis.urls.updateUrl(id, updateData);
                
                // Tạo đối tượng URL cập nhật dựa trên dữ liệu mới nhất
                // Nếu API trả về 204 No Content (không có dữ liệu phản hồi), sử dụng dữ liệu đã nhập
                const updatedUrlObj = {
                    id: id,
                    originalUrl: this.editedOriginalUrl,
                    shortCode: this.editedShortCode,
                    isActive: this.url.isActive ?? true,
                    userId: userId,
                    createdAt: createdAt,
                    clickCount: clickCount ?? 0,
                    lastAccessed: lastAccessed ?? null,
                    expiryDate: expiryDate ?? null
                };

                // Nếu API trả về dữ liệu (không phải 204), sử dụng dữ liệu từ response
                if (response && Object.keys(response).length > 0) {
                    Object.assign(updatedUrlObj, {
                        id: response.id || response.Id || id,
                        originalUrl: response.originalUrl || response.OriginalUrl || this.editedOriginalUrl,
                        shortCode: response.shortCode || response.ShortCode || this.editedShortCode,
                        isActive: response.isActive !== undefined ? response.isActive : 
                                 response.IsActive !== undefined ? response.IsActive : this.url.isActive,
                        userId: response.userId || response.UserId || userId,
                        createdAt: response.createdAt || response.CreatedAt || createdAt,
                        clickCount: response.clickCount !== undefined ? response.clickCount : 
                                   response.ClickCount !== undefined ? response.ClickCount : clickCount,
                        lastAccessed: response.lastAccessed || response.LastAccessed || lastAccessed,
                        expiryDate: response.expiryDate || response.ExpiryDate || expiryDate
                    });
                }

                console.log('Updated URL object:', updatedUrlObj);

                // Cập nhật dữ liệu URL hiện tại trong component
                Object.assign(this.url, updatedUrlObj);

                // Cập nhật dữ liệu URL trong component cha
                this.$emit('update', updatedUrlObj);

                // Thoát khỏi chế độ chỉnh sửa
                this.editMode = false;

                // Thông báo thành công
                this.$emit('show-notification', 'URL đã được cập nhật thành công');
            } catch (error) {
                console.error('Error updating URL:', error);
                this.error = error.userMessage || 'Có lỗi xảy ra khi cập nhật URL';
            } finally {
                this.isSaving = false;
            }
        }
    }
}
</script>

<style scoped>
.url-item {
    display: flex;
    flex-direction: column;
    padding: 15px;
    margin-bottom: 15px;
    border: 1px solid #ddd;
    border-radius: 5px;
    background-color: #f9f9f9;
}

.url-details {
    flex: 1;
    margin-bottom: 15px;
}

.original-url, .short-url {
    margin-bottom: 10px;
}

.original-url p {
    word-break: break-all;
    margin: 5px 0;
}

.short-url a {
    color: #42b983;
    text-decoration: none;
    margin-right: 10px;
}

.created-at, .click-count {
    color: #666;
    margin-right: 15px;
    display: inline-block;
}

.url-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
}

.edit-actions, .normal-actions {
    display: flex;
    gap: 10px;
}

.btn-copy, .btn-delete, .btn-edit, .btn-save, .btn-cancel {
    padding: 5px 10px;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    font-size: 0.9rem;
}

.btn-copy {
    background-color: #42b983;
    color: white;
    margin-left: 10px;
}

.btn-edit {
    background-color: #409EFF;
    color: white;
}

.btn-save {
    background-color: #67C23A;
    color: white;
}

.btn-save:disabled {
    background-color: #a0cfbf;
    cursor: not-allowed;
}

.btn-cancel {
    background-color: #909399;
    color: white;
}

.btn-delete {
    background-color: #f56c6c;
    color: white;
}

.guest-message {
    color: #666;
    font-style: italic;
}

.edit-field {
    margin: 5px 0;
}

.edit-field input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.9rem;
}

.shortcode-edit {
    display: flex;
    align-items: center;
}

.shortcode-edit span {
    margin-right: 0;
    color: #333;
}

.shortcode-edit input {
    width: auto;
    flex: 1;
}

.error-message {
    color: #f56c6c;
    font-size: 0.9rem;
    margin-top: 10px;
    padding: 5px;
    background-color: #fef0f0;
    border-radius: 4px;
}
</style>