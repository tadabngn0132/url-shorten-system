<template>
  <div id="app">
    <header class="navbar">
      <div class="navbar-container">
        <div class="logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
          <span>URL Shortener</span>
        </div>
        <Navbar/>
      </div>
    </header>
    
    <main>
      <div class="container">
        <router-view/>
      </div>
    </main>
    
    <footer>
      <div class="footer-content">
        <div class="footer-logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
          <span>URL Shortener</span>
        </div>
        <div class="footer-links">
          <a href="#" class="footer-link">Home</a>
          <a href="#" class="footer-link">About</a>
          <a href="#" class="footer-link">Terms</a>
          <a href="#" class="footer-link">Privacy</a>
        </div>
        <div class="footer-copyright">
          &copy; 2025 URL Shortener - All rights reserved
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue';

export default {
  components: {
    Navbar
  }
}
</script>

<style>
@import './assets/styles/modern-ui.css';
</style>