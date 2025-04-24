<template>
    <nav class="navbar">
        <div class="logo">URL Shortener</div>
        <div class="nav-links">
            <router-link to="/">Home</router-link>
            <router-link to="/about">About</router-link>
            
            <!-- Show if user is authenticated -->
            <router-link v-if="isAuthenticated" to="/dashboard">Dashboard</router-link>
            <router-link v-if="isAuthenticated" to="/bulk-shortener">Bulk Shortener</router-link>
            
            <!-- Auth links -->
            <template v-if="isAuthenticated">
                <div class="user-menu" @click="toggleUserMenu">
                    <span class="username">{{ currentUser.username }}</span>
                    <div class="dropdown-menu" v-if="showUserMenu">
                        <router-link to="/profile">Profile</router-link>
                        <a href="#" @click.prevent="handleLogout">Logout</a>
                    </div>
                </div>
            </template>
            <template v-else>
                <router-link to="/login" class="auth-button">Login</router-link>
            </template>
        </div>
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
.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    background-color: white;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: #42b983;
}

.nav-links {
    display: flex;
    align-items: center;
    text-align: center;
    gap: 20px;
}

.nav-links a {
    color: #2c3e50;
    text-decoration: none;
    padding: 5px 10px;
    border-radius: 3px;
    transition: background-color 0.3s;
}

.nav-links a:hover {
    background-color: #f0f0f0;
}

.nav-links a.router-link-active {
    color: #42b983;
    font-weight: bold;
}

.auth-button {
    background-color: #42b983;
    color: white !important;
    padding: 8px 15px !important;
    border-radius: 4px;
    font-weight: 500;
}

.auth-button:hover {
    background-color: #3aa876 !important;
}

.user-menu {
    position: relative;
    cursor: pointer;
    padding: 5px 10px;
    border-radius: 3px;
    transition: background-color 0.3s;
}

.user-menu:hover {
    background-color: #f0f0f0;
}

.username {
    font-weight: 500;
    color: #42b983;
}

.dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    width: 150px;
    z-index: 100;
    margin-top: 5px;
}

.dropdown-menu a {
    display: block;
    padding: 10px 15px;
    color: #2c3e50;
    text-decoration: none;
    transition: background-color 0.2s;
}

.dropdown-menu a:hover {
    background-color: #f5f5f5;
}
</style>