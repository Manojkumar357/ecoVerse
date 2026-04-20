/**
 * ParticleBackground Component
 * 
 * Lightweight, performant particle system for eco-themed backgrounds.
 * Uses HTML5 Canvas with requestAnimationFrame for smooth 60fps animations.
 * Supports multiple particle types: leaves, bubbles, dust, snowflakes, droplets.
 */

import { useEffect, useRef } from 'react';

type ParticleType = 'leaves' | 'bubbles' | 'dust' | 'snowflakes' | 'droplets' | 'sparkles';

interface ParticleBackgroundProps {
  type: ParticleType;
  count?: number;
  color?: string;
  opacity?: number;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  rotation?: number;
  rotationSpeed?: number;
  sway?: number;
  swayOffset?: number;
}

export function ParticleBackground({ 
  type, 
  count = 50, 
  color = '#ffffff',
  opacity = 0.5 
}: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles based on type
    const initParticles = () => {
      particlesRef.current = [];
      
      for (let i = 0; i < count; i++) {
        const particle: Particle = {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: 0,
          speedX: 0,
          speedY: 0,
          opacity: opacity * (0.3 + Math.random() * 0.7),
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 2,
          sway: Math.random() * 2 - 1,
          swayOffset: Math.random() * Math.PI * 2
        };

        // Configure particle properties based on type
        switch (type) {
          case 'leaves':
            particle.size = 3 + Math.random() * 5;
            particle.speedX = (Math.random() - 0.5) * 0.5;
            particle.speedY = 0.3 + Math.random() * 0.5;
            break;
          
          case 'bubbles':
            particle.size = 2 + Math.random() * 6;
            particle.speedX = (Math.random() - 0.5) * 0.3;
            particle.speedY = -(0.2 + Math.random() * 0.5);
            break;
          
          case 'dust':
            particle.size = 1 + Math.random() * 2;
            particle.speedX = (Math.random() - 0.5) * 0.2;
            particle.speedY = 0.1 + Math.random() * 0.3;
            break;
          
          case 'snowflakes':
            particle.size = 2 + Math.random() * 4;
            particle.speedX = (Math.random() - 0.5) * 0.4;
            particle.speedY = 0.2 + Math.random() * 0.4;
            break;
          
          case 'droplets':
            particle.size = 1 + Math.random() * 3;
            particle.speedX = (Math.random() - 0.5) * 0.2;
            particle.speedY = 0.5 + Math.random() * 1;
            break;
          
          case 'sparkles':
            particle.size = 1 + Math.random() * 3;
            particle.speedX = (Math.random() - 0.5) * 0.3;
            particle.speedY = (Math.random() - 0.5) * 0.3;
            break;
        }

        particlesRef.current.push(particle);
      }
    };

    initParticles();

    // Draw particle based on type
    const drawParticle = (particle: Particle, ctx: CanvasRenderingContext2D) => {
      ctx.save();
      ctx.globalAlpha = particle.opacity;
      ctx.fillStyle = color;

      switch (type) {
        case 'leaves':
          // Draw leaf shape
          ctx.translate(particle.x, particle.y);
          ctx.rotate((particle.rotation || 0) * Math.PI / 180);
          ctx.beginPath();
          ctx.ellipse(0, 0, particle.size, particle.size * 1.5, 0, 0, Math.PI * 2);
          ctx.fill();
          break;

        case 'bubbles':
          // Draw bubble (circle with subtle gradient)
          const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size
          );
          gradient.addColorStop(0, color);
          gradient.addColorStop(0.7, color);
          gradient.addColorStop(1, 'rgba(255,255,255,0.1)');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
          // Add highlight
          ctx.fillStyle = 'rgba(255,255,255,0.3)';
          ctx.beginPath();
          ctx.arc(particle.x - particle.size * 0.3, particle.y - particle.size * 0.3, particle.size * 0.3, 0, Math.PI * 2);
          ctx.fill();
          break;

        case 'dust':
        case 'sparkles':
          // Draw small circle
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
          break;

        case 'snowflakes':
          // Draw simple snowflake
          ctx.translate(particle.x, particle.y);
          ctx.rotate((particle.rotation || 0) * Math.PI / 180);
          ctx.strokeStyle = color;
          ctx.lineWidth = 1;
          for (let i = 0; i < 6; i++) {
            ctx.rotate(Math.PI / 3);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, particle.size);
            ctx.stroke();
          }
          break;

        case 'droplets':
          // Draw water droplet shape
          ctx.translate(particle.x, particle.y);
          ctx.beginPath();
          ctx.arc(0, 0, particle.size * 0.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(-particle.size * 0.6, 0);
          ctx.quadraticCurveTo(0, -particle.size, particle.size * 0.6, 0);
          ctx.fill();
          break;
      }

      ctx.restore();
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle) => {
        // Update position
        if (type === 'leaves' || type === 'snowflakes') {
          // Add swaying motion
          particle.x += particle.speedX + Math.sin((particle.swayOffset || 0) + Date.now() * 0.001) * (particle.sway || 0);
        } else {
          particle.x += particle.speedX;
        }
        particle.y += particle.speedY;

        // Update rotation
        if (particle.rotation !== undefined && particle.rotationSpeed !== undefined) {
          particle.rotation += particle.rotationSpeed;
        }

        // Reset particles that go off screen
        if (type === 'bubbles') {
          // Bubbles float up
          if (particle.y < -10) {
            particle.y = canvas.height + 10;
            particle.x = Math.random() * canvas.width;
          }
        } else {
          // Most particles fall down
          if (particle.y > canvas.height + 10) {
            particle.y = -10;
            particle.x = Math.random() * canvas.width;
          }
        }

        // Keep within horizontal bounds with wrapping
        if (particle.x < -10) particle.x = canvas.width + 10;
        if (particle.x > canvas.width + 10) particle.x = -10;

        // Draw particle
        drawParticle(particle, ctx);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [type, count, color, opacity]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
}

/**
 * Predefined particle configurations for different eco themes
 */
export const ParticlePresets = {
  forest: {
    type: 'leaves' as ParticleType,
    count: 40,
    color: '#10b981',
    opacity: 0.4
  },
  ocean: {
    type: 'bubbles' as ParticleType,
    count: 35,
    color: '#06b6d4',
    opacity: 0.3
  },
  climate: {
    type: 'dust' as ParticleType,
    count: 60,
    color: '#f59e0b',
    opacity: 0.25
  },
  arctic: {
    type: 'snowflakes' as ParticleType,
    count: 45,
    color: '#e0f2fe',
    opacity: 0.5
  },
  water: {
    type: 'droplets' as ParticleType,
    count: 30,
    color: '#0ea5e9',
    opacity: 0.35
  },
  energy: {
    type: 'sparkles' as ParticleType,
    count: 50,
    color: '#fbbf24',
    opacity: 0.4
  }
};
