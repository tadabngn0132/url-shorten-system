<template>
  <div id="app">
    <header>
      <Navbar/>
    </header>
    
    <main>
      <router-view/>
    </main>
    
    <footer>
      <p>&copy; 2025 URL Shortener - Microservice Project</p>
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
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  line-height: 1.5;
  background-color: #f8f9fa;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

header {
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 15px 20px;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #42b983;
}

.nav-links {
  display: flex;
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

main {
  flex: 1;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

footer {
  text-align: center;
  padding: 20px;
  background-color: white;
  border-top: 1px solid #eee;
  margin-top: auto;
}
</style>