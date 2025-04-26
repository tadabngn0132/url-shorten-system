<template>
    <div class="bulk-shortener-container">
        <div class="bulk-shortener-header">
            <h1>Bulk URL Shortener</h1>
            <p class="bulk-shortener-subtitle">Shorten multiple URLs at once and save time</p>
        </div>

        <div class="card bulk-card">
            <div class="card-body">
                <form @submit.prevent="shortenUrls" class="bulk-form">
                    <div class="form-group">
                        <label class="form-label" for="urls-input">Enter multiple URLs to shorten</label>
                        <div class="helper-text">One URL per line</div>
                        <textarea
                            id="urls-input"
                            v-model="urlsInput"
                            placeholder="https://example.com/very/long/url
https://another-example.com/long/path
https://third-example.com/path"
                            required
                            class="form-textarea"
                            rows="8"
                        ></textarea>
                    </div>

                    <div class="form-group">
                        <label class="checkbox-container">
                            <input type="checkbox" v-model="generateCustomCodes">
                            <span class="checkmark"></span>
                            <span>Generate custom short codes (add a colon and custom code after each URL)</span>
                        </label>
                        <div v-if="generateCustomCodes" class="helper-text mt-2">
                            <div class="example-format">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="16" x2="12" y2="12"></line>
                                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                </svg>
                                <span>Format: <code>https://example.com:my-custom-code</code></span>
                            </div>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary btn-block" :disabled="isSubmitting || !isAuthenticated">
                        <svg v-if="isSubmitting" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="loading-icon">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
                        </svg>
                        <span v-else>{{ isSubmitting ? 'Processing...' : 'Shorten URLs' }}</span>
                    </button>
                    
                    <div v-if="!isAuthenticated" class="auth-warning mt-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                        <div>
                            <p>You need to be logged in to use bulk shortening.</p>
                            <router-link to="/login" class="btn btn-outline btn-sm mt-2">Login Now</router-link>
                        </div>
                    </div>
                </form>
            </div>
        </div>

        <div v-if="error" class="alert alert-danger mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {{ error }}
        </div>

        <div v-if="results.length > 0" class="results-container mt-4">
            <div class="card">
                <div class="card-header">
                    <div class="flex-between">
                        <h2>Results</h2>
                        <div class="results-actions">
                            <button @click="copyAllToClipboard" class="btn btn-outline btn-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                </svg>
                                Copy All
                            </button>
                            <button @click="downloadCsv" class="btn btn-primary btn-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7 10 12 15 17 10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                                Download CSV
                            </button>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>Original URL</th>
                                    <th>Shortened URL</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(result, index) in results" :key="index" :class="{ 'error-row': result.error }">
                                    <td class="original-url">{{ result.originalUrl }}</td>
                                    <td>
                                        <a v-if="!result.error" :href="result.shortenedUrl" target="_blank" class="shortened-url">{{ result.shortenedUrl }}</a>
                                        <span v-else class="error-message">{{ result.shortenedUrl }}</span>
                                    </td>
                                    <td>
                                        <button v-if="!result.error" @click="copyToClipboard(result.shortenedUrl)" class="btn btn-outline btn-sm">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import exportApis from '@/services/api/exportApis';
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
                this.error = 'You need to be logged in to use bulk shortening.';
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

                // Prepare data for API
                const urlsData = [];
                
                for (const line of urlLines) {
                    if (!line.trim()) continue;
                    
                    let originalUrl = line.trim();
                    let customCode = '';
                    
                    // Parse URL and custom code (format: url:code)
                    if (this.generateCustomCodes && line.includes(':')) {
                        // Find the last colon in the string to separate URL from custom code
                        const lastColonIndex = line.lastIndexOf(':');
                        if (lastColonIndex > 0) { // Make sure there is content before the colon
                            originalUrl = line.substring(0, lastColonIndex).trim();
                            customCode = line.substring(lastColonIndex + 1).trim();
                        }
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

                    // Add http:// or https:// if not present
                    if (!originalUrl.startsWith('http://') && !originalUrl.startsWith('https://')) {
                        originalUrl = 'https://' + originalUrl;
                    }

                    // Validate custom code if provided
                    if (customCode && !/^[a-zA-Z0-9_-]+$/.test(customCode)) {
                        this.results.push({
                            originalUrl,
                            shortenedUrl: 'Custom code can only contain letters, numbers, underscores, and hyphens',
                            error: true
                        });
                        continue;
                    }

                    // Add URL to the list to be shortened
                    urlsData.push({
                        originalUrl,
                        shortCode: customCode
                    });
                }

                // Call bulk shorten API instead of individual calls
                if (urlsData.length > 0) {
                    const response = await exportApis.urls.bulkShorten(urlsData);
                    
                    // Process results
                    if (response.urls && response.urls.length > 0) {
                        // Add successful URLs to results
                        for (const url of response.urls) {
                            this.results.push({
                                originalUrl: url.originalUrl,
                                shortenedUrl: `${window.location.origin}/${url.shortCode}`,
                                error: false
                            });
                        }
                    }
                    
                    // Process errors if any
                    if (response.errors && response.errors.length > 0) {
                        for (const errorItem of response.errors) {
                            this.results.push({
                                originalUrl: errorItem.originalUrl,
                                shortenedUrl: errorItem.error,
                                error: true
                            });
                        }
                    }
                    
                    console.log(`Shortened ${response.success} URLs successfully, ${response.failed} failed`);
                }
            } catch (error) {
                console.error('Error processing URLs:', error);
                this.error = error.userMessage || 'An unexpected error occurred while processing URLs. Please try again.';
            } finally {
                this.isSubmitting = false;
            }
        },
        
        isValidUrl(string) {
            try {
                // Make sure string has http:// or https:// protocol
                if (!string.startsWith('http://') && !string.startsWith('https://')) {
                    string = 'https://' + string;
                }
                new URL(string);
                return true;
            } catch (_) {
                return false;
            }
        },
        
        copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                // Show notification - could be improved with toast
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
.bulk-shortener-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 1.5rem;
}

.bulk-shortener-header {
    text-align: center;
    margin-bottom: 2rem;
}

.bulk-shortener-subtitle {
    color: var(--gray);
    margin-top: 0.5rem;
}

.bulk-card {
    margin-bottom: 2rem;
}

.bulk-form {
    max-width: 800px;
    margin: 0 auto;
}

.helper-text {
    font-size: 0.875rem;
    color: var(--gray);
    margin-bottom: 0.5rem;
}

.form-textarea {
    width: 100%;
    min-height: 200px;
    padding: 0.75rem;
    border: 1px solid var(--gray-light);
    border-radius: var(--rounded);
    font-size: 1rem;
    font-family: var(--font-sans);
    resize: vertical;
}

.checkbox-container {
    display: flex;
    align-items: center;
    cursor: pointer;
    font-size: 1rem;
    user-select: none;
    gap: 0.5rem;
}

.checkbox-container input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
}

.checkmark {
    position: relative;
    height: 18px;
    width: 18px;
    background-color: #fff;
    border: 1px solid var(--gray-light);
    border-radius: 3px;
    transition: all 0.2s ease;
}

.checkbox-container:hover input ~ .checkmark {
    background-color: #f9fafb;
}

.checkbox-container input:checked ~ .checkmark {
    background-color: var(--primary);
    border-color: var(--primary);
}

.checkmark:after {
    content: "";
    position: absolute;
    display: none;
}

.checkbox-container input:checked ~ .checkmark:after {
    display: block;
}

.checkbox-container .checkmark:after {
    left: 6px;
    top: 2px;
    width: 5px;
    height: 10px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
}

.example-format {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    background-color: rgba(59, 130, 246, 0.05);
    border-radius: var(--rounded);
}

code {
    background-color: rgba(59, 130, 246, 0.1);
    padding: 0.125rem 0.25rem;
    border-radius: 3px;
    font-family: monospace;
}

.auth-warning {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background-color: rgba(245, 158, 11, 0.1);
    border-left: 4px solid var(--warning);
    border-radius: var(--rounded);
}

.auth-warning svg {
    color: var(--warning);
    flex-shrink: 0;
}

.mt-2 {
    margin-top: 0.5rem;
}

.mt-3 {
    margin-top: 1rem;
}

.mt-4 {
    margin-top: 1.5rem;
}

.flex-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.results-actions {
    display: flex;
    gap: 0.5rem;
}

.table-container {
    overflow-x: auto;
}

.table {
    width: 100%;
    border-collapse: collapse;
}

.table th,
.table td {
    padding: 0.75rem 1rem;
    text-align: left;
    border-bottom: 1px solid var(--gray-light);
}

.table th {
    font-weight: 600;
    background-color: rgba(249, 250, 251, 0.5);
}

.original-url {
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.shortened-url {
    color: var(--primary);
    font-weight: 500;
}

.error-row {
    background-color: rgba(239, 68, 68, 0.05);
}

.error-message {
    color: var(--danger);
}

.loading-icon {
    animation: spin 1s linear infinite;
    margin-right: 0.5rem;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

@media (max-width: 640px) {
    .flex-between {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }
    
    .results-actions {
        width: 100%;
    }
}
</style>