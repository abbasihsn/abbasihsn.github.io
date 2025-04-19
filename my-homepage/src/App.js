import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>John Doe</h1>
        <p className="title">Software Developer</p>
        <div className="social-links">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="mailto:john.doe@example.com">Email</a>
        </div>
      </header>
      
      <section className="about">
        <h2>About Me</h2>
        <p>
          I'm a passionate software developer with experience in web development.
          My skills include React, JavaScript, HTML, and CSS.
        </p>
      </section>
      
      <section className="projects">
        <h2>Projects</h2>
        <div className="project-list">
          <div className="project">
            <h3>Project 1</h3>
            <p>A web application built with React.</p>
            <a href="https://github.com/username/project1" target="_blank" rel="noopener noreferrer">View Code</a>
          </div>
          <div className="project">
            <h3>Project 2</h3>
            <p>A mobile application built with React Native.</p>
            <a href="https://github.com/username/project2" target="_blank" rel="noopener noreferrer">View Code</a>
          </div>
        </div>
      </section>
      
      <footer>
        <p>© 2023 John Doe. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
