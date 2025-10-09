import './App.css';
import { useState, useEffect } from 'react';

function App() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const aboutSection = document.querySelector('.about');
      if (aboutSection) {
        const position = aboutSection.getBoundingClientRect();
        console.log(position.top);
        // If the section is in view
        if (position.top < window.innerHeight - window.innerHeight*0.) {
          setIsVisible(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Check initially in case section is already visible
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <div className="profile-image-container">
          <img src="/profile-image.png" alt="Hasan Abbasi" className="profile-image" />
        </div>
        <h1>Hasan Abbasi</h1>
        <p className="title">Senior Software Developer</p>
        <div className="social-links">
          <a href="https://github.com/abbasihsn" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://www.linkedin.com/in/abbasihsn/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="mailto:abbasi.hsnn@gmail.com">Email</a>
          <a href="https://www.youtube.com/@TechWithHasanAbbasi?sub_confirmation=1" target="_blank" rel="noopener noreferrer" className="youtube-link">YouTube</a>
        </div>
        <div className="scroll-indicator">
          <span>Scroll Down</span>
          <div className="arrow"></div>
        </div>
      </header>
      
      <section className={`about ${isVisible ? 'visible' : ''}`}>
        <div className="about-container">
          <h2>About Me</h2>
          <p> 
            I'm a full stack developer with a passion for building scalable and efficient systems. Also, I have a strong interest in AI and machine learning where my academic background is in Computer Vision and Machine Learning.
            I have a decade of experience in software development and I'm always looking for new challenges and opportunities to learn and grow.
          </p>
        </div>
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
