<style>
  :root {
    --beige: #F5F5DC;
    --army-green: #4B5320;
    --dark-blue: #003366;
  }

  body {
    font-family: 'Arial', sans-serif;
    margin: 0;
    padding: 0;
    background: var(--beige);
    color: var(--dark-blue);
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .header {
    background: var(--dark-blue);
    padding: 2rem;
    text-align: center;
    border-bottom: 5px solid var(--army-green);
  }

  .nav {
    display: flex;
    justify-content: center;
    gap: 2rem;
    padding: 1rem;
    background: rgba(255,255,255,0.9);
  }

  .nav a {
    color: var(--dark-blue);
    text-decoration: none;
    font-weight: bold;
    transition: color 0.3s;
  }

  .nav a:hover {
    color: var(--army-green);
  }

  .section {
    background: white;
    padding: 2rem;
    margin: 2rem 0;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  }

  .outdoor-card {
    position: relative;
    height: 200px;
    overflow: hidden;
    border-radius: 8px;
    transition: transform 0.3s;
  }

  .outdoor-card:hover {
    transform: translateY(-5px);
  }

  .project-carousel {
    display: flex;
    overflow-x: auto;
    gap: 1rem;
    padding: 1rem 0;
  }

  @media (max-width: 768px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }
</style>

<div class="header">
  <h1 style="color: white; margin: 0;">Dr. Alex Rivera</h1>
  <p style="color: var(--beige);">Research Computing Director | Outdoor Adventurer</p>
</div>

<nav class="nav">
  <a href="#about">About</a>
  <a href="#research">Research</a>
  <a href="#projects">Projects</a>
  <a href="#adventures">Adventures</a>
</nav>

<div class="container">
  <section id="about" class="section">
    <div class="grid">
      <div>
        <h2 style="color: var(--army-green);">About Me</h2>
        <p>Leading high-performance computing initiatives at the intersection of academic research and technological innovation. Passionate about building robust research infrastructure that enables groundbreaking discoveries.</p>
        <img src="profile.jpg" alt="Profile" style="width: 200px; border-radius: 50%; float: right; margin-left: 2rem;">
      </div>
      <div>
        <h2 style="color: var(--army-green);">Latest Expedition</h2>
        <div class="outdoor-card" style="background: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('kayaking.jpg'); background-size: cover;">
          <div style="position: absolute; bottom: 1rem; left: 1rem; color: white;">
            <h3 style="margin: 0;">Boundary Waters Canoe Expedition</h3>
            <p>300 miles | August 2023</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="research" class="section">
    <h2 style="color: var(--dark-blue);">Research Highlights</h2>
    <div class="grid">
      <div>
        <h3>Quantum Computing Infrastructure</h3>
        <p>Developing hybrid quantum-classical computing architectures for molecular modeling...</p>
      </div>
      <div>
        <h3>AI-Driven Climate Modeling</h3>
        <p>Leading interdisciplinary team using ML to predict extreme weather patterns...</p>
      </div>
    </div>
  </section>

  <section id="projects" class="section">
    <h2 style="color: var(--army-green);">Recent Projects</h2>
    <div class="project-carousel">
      <div class="project-card" style="min-width: 300px; padding: 1rem; border: 1px solid var(--beige);">
        <h3>Campus Research Cloud</h3>
        <p>Secure cloud infrastructure for collaborative research</p>
        <button style="background: var(--army-green); color: white; border: none; padding: 0.5rem 1rem;">Learn More</button>
      </div>
      <!-- Add more project cards -->
    </div>
  </section>

  <section id="adventures" class="section">
    <h2 style="color: var(--dark-blue);">Outdoor Chronicles</h2>
    <div class="grid">
      <div class="outdoor-card" style="background-image: url('camping.jpg')">
        <div class="card-caption">Rocky Mountain Backpacking</div>
      </div>
      <div class="outdoor-card" style="background-image: url('kayak.jpg')">
        <div class="card-caption">Lake Superior Kayaking</div>
      </div>
    </div>
  </section>
</div>

<footer style="background: var(--dark-blue); color: white; text-align: center; padding: 1rem;">
  <p>Connect with me: <a href="mailto:alex.rivera@university.edu" style="color: var(--beige);">alex.rivera@university.edu</a></p>
</footer>
