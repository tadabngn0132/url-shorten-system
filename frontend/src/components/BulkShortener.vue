<template>
    <div class="bulk-shortener">
        <h2>Bulk URL Shortener</h2>
        <p class="description">Enter multiple URLs to shorten (one URL per line)</p>

        <form @submit.prevent="shortenUrls" class="shortener-form">
            <div class="input-group">
                <textarea
                    v-model="urlsInput"
                    placeholder="Enter URLs (one per line)"
                    required
                    class="urls-textarea"
                    rows="10"
                ></textarea>
            </div>

            <div class="options">
                <label class="checkbox-label">
                    <input type="checkbox" v-model="generateCustomCodes">
                    Generate custom short codes (add a colon and custom code after each URL)
                </label>
            </div>

            <button type="submit" class="btn-shorten" :disabled="isSubmitting || !isAuthenticated">
                {{ isSubmitting ? 'Processing...' : 'Shorten URLs' }}
            </button>
            
            <div v-if="!isAuthenticated" class="auth-warning">
                You need to be logged in to use bulk shortening.
                <router-link to="/login">Login</router-link>
            </div>
        </form>

        <div v-if="error" class="error-message">
            {{ error }}
        </div>

        <div v-if="results.length > 0" class="results">
            <h3>Results:</h3>
            <div class="results-actions">
                <button @click="copyAllToClipboard" class="btn-copy-all">
                    Copy All URLs
                </button>
                <button @click="downloadCsv" class="btn-download">
                    Download as CSV
                </button>
            </div>
            <div class="results-table">
                <table>
                    <thead>
                        <tr>
                            <th>Original URL</th>
                            <th>Shortened URL</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(result, index) in results" :key="index">
                            <td class="original-url">{{ result.originalUrl }}</td>
                            <td>
                                <a :href="result.shortenedUrl" target="_blank">{{ result.shortenedUrl }}</a>
                            </td>
                            <td>
                                <button @click="copyToClipboard(result.shortenedUrl)" class="btn-copy">
                                    Copy
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import { mapGetters } from 'vuex';

export default {
    name: 'BulkShortener',
    data() {
        return {
            urlsInput: '',
            generateCustomCodes: false,
            results: [],
            error: '',
            isSubmitting: false
        };
    },
    computed: {
        ...mapGetters(['isAuthenticated'])
    },
    methods: {
        async shortenUrls() {
            if (!this.isAuthenticated) {
                this.error = 'You must be logged in to use the bulk shortener.';
                return;
            }

            this.error = '';
            this.isSubmitting = true;
            this.results = [];

            try {
                // Parse input URLs
                const urlLines = this.urlsInput.trim().split('\n');
                
                if (urlLines.length === 0 || (urlLines.length === 1 && urlLines[0] === '')) {
                    this.error = 'Please enter at least one URL.';
                    this.isSubmitting = false;
                    return;
                }

                // Process each URL
                for (const line of urlLines) {
                    if (!line.trim()) continue;
                    
                    let originalUrl = line.trim();
                    let customCode = '';
                    
                    // Check if custom code is provided
                    if (this.generateCustomCodes && line.includes(':')) {
                        const parts = line.split(':');
                        originalUrl = parts[0].trim();
                        customCode = parts[1].trim();
                    }

                    // Validate URL
                    if (!this.isValidUrl(originalUrl)) {
                        this.results.push({
                            originalUrl,
                            shortenedUrl: 'Invalid URL format',
                            error: true
                        });
                        continue;
                    }

                    // Prepare data for API call
                    const payload = {
                        originalUrl,
                        shortCode: customCode,
                        createdAt: new Date().toISOString(),
                        userId: this.$store.state.auth.user.id,
                        isActive: true
                    };

                    // Make API call
                    const headers = {
                        Authorization: `Bearer ${this.$store.state.auth.token}`
                    };

                    const response = await axios.post('http://localhost:9999/gateway/urls', payload, { headers });

                    if (response.data && response.data.shortCode) {
                        this.results.push({
                            originalUrl,
                            shortenedUrl: `${window.location.origin}/${response.data.shortCode}`,
                            error: false
                        });
                    }
                }
            } catch (error) {
                console.error('Error shortening URLs:', error);
                this.error = 'Failed to shorten URLs. Please try again.';
            } finally {
                this.isSubmitting = false;
            }
        },
        
        isValidUrl(string) {
            try {
                new URL(string);
                return true;
            } catch (_) {
                return false;
            }
        },
        
        copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                alert('URL copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy:', err);
            });
        },
        
        copyAllToClipboard() {
            const successfulUrls = this.results.filter(r => !r.error).map(r => r.shortenedUrl).join('\n');
            
            if (!successfulUrls) {
                alert('No valid URLs to copy.');
                return;
            }
            
            navigator.clipboard.writeText(successfulUrls).then(() => {
                alert('All URLs copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy:', err);
            });
        },
        
        downloadCsv() {
            // Create CSV content
            let csvContent = 'Original URL,Shortened URL\n';
            
            this.results.forEach(result => {
                if (!result.error) {
                    csvContent += `"${result.originalUrl}","${result.shortenedUrl}"\n`;
                }
            });
            
            // Create a blob and download link
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            
            link.setAttribute('href', url);
            link.setAttribute('download', 'shortened_urls.csv');
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}
</script>

<style scoped>
.bulk-shortener {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

h2 {
    color: #2c3e50;
    margin-bottom: 10px;
}

.description {
    color: #666;
    margin-bottom: 20px;
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

.urls-textarea {
    width: 100%;
    padding: 12px 15px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 16px;
    font-family: inherit;
    resize: vertical;
}

.options {
    margin: 10px 0;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
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

.auth-warning {
    color: #e6a23c;
    background-color: #fdf6ec;
    padding: 10px;
    border-radius: 4px;
    margin-top: 10px;
}

.auth-warning a {
    color: #e6a23c;
    font-weight: bold;
    text-decoration: underline;
}

.error-message {
    color: #f56c6c;
    margin: 15px 0;
    padding: 10px;
    background-color: #fef0f0;
    border-radius: 4px;
}

.results {
    margin-top: 30px;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 5px;
}

.results h3 {
    margin-bottom: 20px;
}

.results-actions {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
}

.btn-copy-all, .btn-download {
    padding: 8px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
}

.btn-copy-all {
    background-color: #42b983;
    color: white;
}

.btn-download {
    background-color: #3498db;
    color: white;
}

.results-table {
    overflow-x: auto;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th, td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #ddd;
}

th {
    background-color: #f2f2f2;
    font-weight: bold;
}

.original-url {
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.btn-copy {
    background-color: #42b983;
    color: white;
    padding: 6px 12px;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    font-size: 14px;
}
</style>