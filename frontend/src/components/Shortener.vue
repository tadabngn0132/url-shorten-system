<template>
    <div class="shortener">
        <h1>URL Shortener</h1>
        <p class="description">Enter the URL you want to shorten below</p>

        <form @submit.prevent="shortenUrl" class="shortener-form">
            <div class="input-group">
                <input
                    type="url"
                    v-model="originalUrl"
                    placeholder="Enter long URL (e.g., https://example.com)"
                    required
                    class="url-input"
                />
            </div>

            <div class="input-group">
                <input
                    type="text"
                    v-model="customCode"
                    placeholder="Custom code (optional)"
                    class="code-input"
                />
            </div>

            <button type="submit" class="btn-shorten" :disabled="isSubmitting">
                {{ isSubmitting ? 'Processing...' : 'Shorten URL' }}
            </button>
        </form>

        <div v-if="error" class="error-message">
            {{ error }}
        </div>

        <div v-if="shortenedUrl" class="result">
            <h3>Your shortened URL:</h3>
            <div class="shortened-url">
                <a :href="shortenedUrl" target="_blank">{{ shortenedUrl }}</a>
                <button @click="copyToClipboard(shortenedUrl)" class="btn-copy">
                    Copy
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'Shortener',
    data() {
        return {
            originalUrl: '',
            shortenedUrl: null,
            customCode: '',
            error: '',
            isSubmitting: false,
        };
    },
    methods: {
        async shortenUrl() {
            this.error = '';
            this.shortenedUrl = '';

            if (!this.originalUrl) {
                this.error = 'Please enter a URL to shorten.';
                return;
            }

            try {
                this.isSubmitting = true;

                const payload = {
                    originalUrl: this.originalUrl,
                    shortCode: this.customCode || undefined,
                    createdAt: new Date().toISOString(),
                    userId: "anonymous", // Replace with actual user ID if available
                    isActive: true,
                };

                const response = await axios.post('http://localhost:9999/gateway/urls', payload);

                if (response.data && response.data.shortCode) {
                    this.shortenedUrl = `${window.location.origin}/${response.data.shortCode}`;
                    // reset the form fields
                    this.originalUrl = '';
                    this.customCode = '';

                    // refresh the URL list in the parent component
                    this.$emit('url-shortened', response.data.shortCode);
                }
            } catch (error) {
                console.error('Error shortening URL:', error);
                this.error = 'Failed to shorten the URL. Please try again.';
            } finally {
                this.isSubmitting = false;
            }
        },
        copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                alert('Shortened URL copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        },
    }
}

</script>

<style scoped>
.shortener {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    text-align: center;
}

h1 {
    color: #2c3e50;
    margin-bottom: 10px;
}

.description {
    color: #666;
    margin-bottom: 30px;
}

.shortener-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-bottom: 20px;
}

.input-group {
    width: 100%;
}

.url-input, .code-input {
    width: 100%;
    padding: 12px 15px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 16px;
}

.btn-shorten {
    background-color: #42b983;
    color: white;
    padding: 12px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;
}

.btn-shorten:hover {
    background-color: #3aa876;
}

.btn-shorten:disabled {
    background-color: #95d5b2;
    cursor: not-allowed;
}

.error-message {
    color: #f56c6c;
    margin-bottom: 15px;
}

.result {
    margin-top: 30px;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 5px;
}

.shortened-url {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-top: 10px;
}

.shortened-url a {
    color: #42b983;
    font-weight: bold;
    word-break: break-all;
}

.btn-copy {
    background-color: #42b983;
    color: white;
    padding: 8px 15px;
    border: none;
    border-radius: 3px;
    cursor: pointer;
}

</style>