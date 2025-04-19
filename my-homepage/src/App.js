import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Hasan Abbasi</h1>
        <p className="title">Senior Software Developer</p>
        <div className="social-links">
          <a href="https://github.com/abbasihsn" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://www.linkedin.com/in/abbasihsn/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="mailto:abbasi.hsnn@gmail.com">Email</a>
        </div>
      </header>
      
      <section className="about">
        <h2>About Me</h2>
        <p> 
          I'm a full stack developer with a passion for building scalable and efficient systems. Also, I have a strong interest in AI and machine learning where my academic background is in Computer Vision and Machine Learning.
          I have a decade of experience in software development and I'm always looking for new challenges and opportunities to learn and grow.
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
        <p>© 2025 Hasan Abbasi. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
