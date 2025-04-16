<template>
  <div class="about">
    <h1>About URL Shortener</h1>
    <div class="content">
      <p>URL Shortener is a service that allows you to shorten long URLs into concise, memorable links that are easy to share.</p>
      
      <h2>Key Features:</h2>
      <ul>
        <li>Shorten any URL into a compact link</li>
        <li>Create custom codes for your URLs</li>
        <li>Manage your list of shortened URLs</li>
        <li>Track the active status of your links</li>
      </ul>
      
      <h2>Technologies Used:</h2>
      <ul>
        <li>Frontend: Vue.js, Vuex, Vue Router</li>
        <li>Backend: .NET Core, Entity Framework</li>
        <li>Architecture: Microservices with API Gateway</li>
      </ul>
      
      <h2>Project Developed By:</h2>
      <p>Student team as part of Advanced Microservices Development & Deployment (AMD201) course</p>
    </div>
  </div>
</template>

<style scoped>
.about {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #2c3e50;
  margin-bottom: 30px;
  text-align: center;
}

.content {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 5px;
}

h2 {
  color: #42b983;
  margin: 25px 0 15px;
}

ul {
  padding-left: 20px;
}

li {
  margin-bottom: 10px;
}

p {
  line-height: 1.6;
}
</style>