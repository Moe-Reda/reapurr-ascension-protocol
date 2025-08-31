import React, { useEffect, useRef } from 'react';

const BackgroundEffect: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Simple particle system
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      life: number;
      maxLife: number;
    }> = [];

    // Set canvas size
    const resizeCanvas = () => {
      // Use window dimensions directly for reliable sizing
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      canvas.width = width;
      canvas.height = height;
      
      // Clear existing particles and recreate them
      particles.length = 0;
      for (let i = 0; i < 100; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.4 + 0.1,
          life: 0,
          maxLife: Math.random() * 300 + 200,
        });
      }
      
      // Debug log to verify dimensions
      console.log('Canvas resized to:', width, 'x', height);
      console.log('Particles created:', particles.length);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation loop
    let animationId: number;
    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life++;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Remove old particles and create new ones
        if (particle.life > particle.maxLife) {
          particles.splice(i, 1);
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            size: Math.random() * 1.5 + 0.5,
            opacity: Math.random() * 0.4 + 0.1,
            life: 0,
            maxLife: Math.random() * 300 + 200,
          });
          continue;
        }

        // Calculate alpha
        const alpha = particle.opacity * (1 - particle.life / particle.maxLife);

        // Draw particle
        ctx.fillStyle = `rgba(16, 185, 129, ${alpha})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        width: '100vw',
        height: '100vh',
      }}
    />
  );
};

export default BackgroundEffect;
