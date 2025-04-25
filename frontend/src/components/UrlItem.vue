<template>
    <div class="url-item">
        <div class="url-details">
            <div class="original-url">
                <h4>Original URL:</h4>
                <p> {{ url.originalUrl }}</p>
            </div>
            <div class="short-url">
                <h4>Shortened URL:</h4>
                <a :href="shortUrl" target="_blank">{{ shortUrl }}</a>
                <button @click="copyToClipboard(shortUrl)" class="btn-copy">
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
            <!-- Chỉ hiển thị nút xóa nếu người dùng đã đăng nhập -->
            <button v-if="isAuthenticated" @click="removeUrl" class="btn-delete">Delete</button>
            <!-- Hiển thị thông báo đối với guest -->
            <small v-else class="guest-message">Login to manage URLs</small>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

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
        }
    }
}
</script>

<style scoped>
.url-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    margin-bottom: 15px;
    border: 1px solid #ddd;
    border-radius: 5px;
    background-color: #f9f9f9;
}

.url-details {
    flex: 1;
}

.original-url, .short-url {
    margin-bottom: 10px;
}

.original-url p {
    word-break: break-all;
    margin: 5px 0;
}

.short-url p {
    display: flex;
    align-items: center;
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
}

.btn-copy, .btn-delete {
    padding: 5px 10px;
    border: none;
    border-radius: 3px;
    cursor: pointer;
}

.btn-copy {
    background-color: #42b983;
    color: white;
    margin-left: 10px;
}

.btn-delete {
    background-color: #f56c6c;
    color: white;
}

.guest-message {
    color: #666;
    font-style: italic;
}
</style>