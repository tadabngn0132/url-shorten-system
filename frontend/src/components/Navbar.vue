<template>
    <nav class="nav-links">
        <router-link to="/" class="nav-link">Home</router-link>
        <router-link to="/about" class="nav-link">About</router-link>
        
        <!-- Show if user is authenticated -->
        <router-link v-if="isAuthenticated" to="/dashboard" class="nav-link">Dashboard</router-link>
        <router-link v-if="isAuthenticated" to="/bulk-shortener" class="nav-link">Bulk Shortener</router-link>
        
        <!-- Auth links -->
        <template v-if="isAuthenticated">
            <div class="user-menu">
                <div class="user-menu-button" @click="toggleUserMenu">
                    <div class="avatar">
                        {{ userInitials }}
                    </div>
                    <span>{{ currentUser.username }}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </div>
                <div class="dropdown-menu" v-if="showUserMenu">
                    <router-link to="/profile" class="dropdown-item">Profile</router-link>
                    <div class="dropdown-divider"></div>
                    <a href="#" @click.prevent="handleLogout" class="dropdown-item">Logout</a>
                </div>
            </div>
        </template>
        <template v-else>
            <router-link to="/login" class="auth-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                    <polyline points="10 17 15 12 10 7"></polyline>
                    <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
                <span>Login</span>
            </router-link>
        </template>
    </nav>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    name: 'Navbar',
    data() {
        return {
            showUserMenu: false
        };
    },
    computed: {
        ...mapGetters(['isAuthenticated']),
        currentUser() {
            return this.$store.state.auth.user;
        },
        userInitials() {
            if (!this.currentUser || !this.currentUser.username) return '';
            return this.currentUser.username.substring(0, 2).toUpperCase();
        }
    },
    methods: {
        toggleUserMenu() {
            this.showUserMenu = !this.showUserMenu;
        },
        handleLogout() {
            this.$store.dispatch('auth/logout');
            this.showUserMenu = false;
            
            if (this.$route.path !== '/') {
                this.$router.push('/');
            }
        },
        closeUserMenu() {
            this.showUserMenu = false;
        }
    },
    mounted() {
        document.addEventListener('click', (e) => {
            if (!this.$el.contains(e.target)) {
                this.closeUserMenu();
            }
        });
    },
    beforeDestroy() {
        document.removeEventListener('click', this.closeUserMenu);
    }
};
</script>

<style scoped>
/* Local styles for navbar component */
.nav-links {
    display: flex;
    align-items: center;
    gap: 1.5rem;
}

.nav-link {
    color: var(--dark);
    font-weight: 500;
    padding: 0.5rem;
    border-radius: var(--rounded);
    text-decoration: none;
    transition: all 0.2s ease;
}

.nav-link:hover, .nav-link.router-link-active {
    color: var(--primary);
    background-color: rgba(59, 130, 246, 0.05);
}

.auth-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background-color: var(--primary);
    color: white !important;
    font-weight: 500;
    padding: 0.5rem 1rem;
    border-radius: var(--rounded);
    text-decoration: none;
    transition: background-color 0.2s ease;
}

.auth-button:hover {
    background-color: var(--primary-dark);
    text-decoration: none;
}

.user-menu {
    position: relative;
}

.user-menu-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border-radius: var(--rounded);
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.user-menu-button:hover {
    background-color: rgba(59, 130, 246, 0.05);
}

.avatar {
    width: 2rem;
    height: 2rem;
    border-radius: var(--rounded-full);
    background-color: var(--primary);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 0.875rem;
}

.dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    width: 200px;
    background-color: white;
    border-radius: var(--rounded-md);
    box-shadow: var(--shadow-lg);
    overflow: hidden;
    margin-top: 0.5rem;
    border: 1px solid var(--gray-light);
    z-index: 50;
}

.dropdown-item {
    display: block;
    padding: 0.75rem 1rem;
    color: var(--dark);
    text-decoration: none;
    transition: background-color 0.2s ease;
}

.dropdown-item:hover {
    background-color: rgba(59, 130, 246, 0.05);
    text-decoration: none;
}

.dropdown-divider {
    height: 1px;
    background-color: var(--gray-light);
    margin: 0.25rem 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .nav-links {
        width: 100%;
        justify-content: center;
        flex-wrap: wrap;
    }
}
</style>