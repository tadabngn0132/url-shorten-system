<template>
  <div class="about">
    <div class="about-hero">
      <h1>About URL Shortener</h1>
      <p class="about-description">URL Shortener is a modern service that transforms long, complex URLs into concise, memorable links that are easy to share across platforms.</p>
    </div>
    
    <div class="about-container">
      <div class="about-card">
        <div class="card-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
        </div>
        <h2>Key Features</h2>
        <ul class="feature-list">
          <li>
            <span class="feature-icon">✓</span>
            <span>Shorten any URL into a compact link</span>
          </li>
          <li>
            <span class="feature-icon">✓</span>
            <span>Create custom codes for your URLs</span>
          </li>
          <li>
            <span class="feature-icon">✓</span>
            <span>Manage your list of shortened URLs</span>
          </li>
          <li>
            <span class="feature-icon">✓</span>
            <span>Track the active status of your links</span>
          </li>
          <li>
            <span class="feature-icon">✓</span>
            <span>View comprehensive analytics about your links</span>
          </li>
          <li>
            <span class="feature-icon">✓</span>
            <span>Bulk URL shortening for multiple links</span>
          </li>
        </ul>
      </div>
      
      <div class="about-card">
        <div class="card-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
        </div>
        <h2>Technologies Used</h2>
        <div class="tech-grid">
          <div class="tech-item">
            <div class="tech-icon frontend">
              <span>Vue</span>
            </div>
            <div class="tech-label">Frontend</div>
            <div class="tech-desc">Vue.js, Vuex, Vue Router</div>
          </div>
          <div class="tech-item">
            <div class="tech-icon backend">
              <span>.NET</span>
            </div>
            <div class="tech-label">Backend</div>
            <div class="tech-desc">.NET Core, Entity Framework</div>
          </div>
          <div class="tech-item">
            <div class="tech-icon architecture">
              <span>API</span>
            </div>
            <div class="tech-label">Architecture</div>
            <div class="tech-desc">Microservices with API Gateway</div>
          </div>
        </div>
      </div>
      
      <div class="about-card team-card">
        <div class="card-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
        <h2>Project Developed By</h2>
        <p class="team-info">Student team as part of Advanced Microservices Development & Deployment (AMD201) course</p>
        <div class="course-details">
          <p>This project demonstrates practical implementation of microservices architecture and modern web development techniques.</p>
        </div>
        <div class="cta-container">
          <a href="#" class="btn btn-primary">Try It Now</a>
          <a href="#" class="btn btn-outline">Learn More</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.about-hero {
  text-align: center;
  margin-bottom: 3rem;
}

h1 {
  color: var(--dark);
  margin-bottom: 1rem;
  font-size: 2.5rem;
  font-weight: 700;
}

.about-description {
  font-size: 1.25rem;
  color: var(--gray);
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
}

.about-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.about-card {
  background-color: white;
  border-radius: var(--rounded-lg);
  box-shadow: var(--shadow-md);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.about-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background-color: rgba(59, 130, 246, 0.1);
  border-radius: var(--rounded-full);
  margin-bottom: 1.5rem;
}

.card-icon svg {
  color: var(--primary);
}

h2 {
  color: var(--dark);
  margin-bottom: 1.5rem;
  font-weight: 600;
  font-size: 1.5rem;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-list li {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background-color: var(--primary);
  color: white;
  border-radius: var(--rounded-full);
  margin-right: 1rem;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 1.5rem;
}

.tech-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.tech-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: var(--rounded-full);
  margin-bottom: 0.75rem;
  font-weight: 700;
  color: white;
}

.tech-icon.frontend {
  background-color: var(--primary);
}

.tech-icon.backend {
  background-color: var(--secondary);
}

.tech-icon.architecture {
  background-color: var(--warning);
}

.tech-label {
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: var(--dark);
}

.tech-desc {
  font-size: 0.875rem;
  color: var(--gray);
}

.team-info {
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.course-details {
  background-color: rgba(59, 130, 246, 0.05);
  border-radius: var(--rounded);
  padding: 1rem;
  margin-bottom: 1.5rem;
  border-left: 4px solid var(--primary);
}

.course-details p {
  margin: 0;
  color: var(--gray);
  font-size: 0.95rem;
  line-height: 1.6;
}

.cta-container {
  display: flex;
  gap: 1rem;
  margin-top: auto;
  padding-top: 1.5rem;
}

@media (max-width: 768px) {
  .about-container {
    grid-template-columns: 1fr;
  }
  
  .cta-container {
    flex-direction: column;
  }
  
  .tech-grid {
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  }
}
</style>