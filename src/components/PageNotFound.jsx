import React, { useEffect, useState } from 'react';
import '../styles/PageNotFound.css';
import { useNavigate } from 'react-router-dom';

function PageNotFound() {
  const navigate = useNavigate();
  const [particles, setParticles] = useState([]);
  
  // สร้างพาร์ติเคิลเมื่อคอมโพเนนต์โหลด
  useEffect(() => {
    const particlesCount = 30;
    const newParticles = [];
    
    for (let i = 0; i < particlesCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 5 + 2,
        speedX: Math.random() * 2 - 1,
        speedY: Math.random() * 2 - 1,
        opacity: Math.random() * 0.7 + 0.3
      });
    }
    
    setParticles(newParticles);
    
    // Animation loop
    const animateParticles = () => {
      setParticles(prevParticles => 
        prevParticles.map(particle => {
          let newX = particle.x + particle.speedX;
          let newY = particle.y + particle.speedY;
          
          // Boundary check
          if (newX > window.innerWidth || newX < 0) {
            particle.speedX *= -1;
            newX = particle.x + particle.speedX;
          }
          
          if (newY > window.innerHeight || newY < 0) {
            particle.speedY *= -1;
            newY = particle.y + particle.speedY;
          }
          
          return {
            ...particle,
            x: newX,
            y: newY
          };
        })
      );
    };
    
    const animationId = setInterval(animateParticles, 50);
    
    return () => clearInterval(animationId);
  }, []);
  
  return (
    <div className="main-404">
      {/* พาร์ติเคิลลอย */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity
          }}
        />
      ))}
      
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The webpage you are looking for may have been moved, deleted, or does not exist.</p>
      <button 
        className="back-home-btn" 
        onClick={() => navigate('/home')}
      >
        Return to Homepage
      </button>
    </div>
  );
}

export default PageNotFound;