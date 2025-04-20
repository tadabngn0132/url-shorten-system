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
        </div>
        <div class="url-actions">
            <button @click="removeUrl" class="btn-delete">Delete</button>
        </div>
    </div>
</template>

<script>

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
        shortUrl() {
            // Đảm bảo baseUrl có giá trị đúng
            const baseUrl = window.location.origin; // Ví dụ: http://localhost:8080
            return `${baseUrl}/${this.url.shortCode}`;
        }
    },
    methods: {
        copyToClipboard(url) {
            navigator.clipboard.writeText(url).then(() => {
                alert('URL copied to clipboard!');
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

.created-at {
    color: #666;
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
</style>