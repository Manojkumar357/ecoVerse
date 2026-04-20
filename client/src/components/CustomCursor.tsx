/**
 * CustomCursor Component
 * 
 * Provides an eco-themed custom cursor with trailing leaf/glow particles.
 * Features smooth tracking, no lag, and a toggle to disable.
 * Desktop only - uses default cursor on mobile devices.
 */

import { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Leaf } from 'lucide-react';

interface Particle {
  id: number;
  x: number;
  y: number;
  opacity: number;
  scale: number;
  rotation: number;
}

interface CustomCursorProps {
  enabled?: boolean;
}

export function CustomCursor({ enabled = true }: CustomCursorProps) {
  const [isDesktop, setIsDesktop] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleIdRef = useRef(0);
  const lastParticleTimeRef = useRef(0);

  // Smooth cursor position using Framer Motion springs
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  // Spring configuration for smooth, lag-free movement
  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  // Check if device is desktop
  useEffect(() => {
    const checkDevice = () => {
      const isDesktopDevice = window.innerWidth >= 768 && !('ontouchstart' in window);
      setIsDesktop(isDesktopDevice);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Track mouse movement and create particles
  useEffect(() => {
    if (!enabled || !isDesktop) return;

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      setIsVisible(true);

      // Create particle trail (throttled to every 100ms)
      const now = Date.now();
      if (now - lastParticleTimeRef.current > 100) {
        lastParticleTimeRef.current = now;
        createParticle(e.clientX, e.clientY);
      }
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [enabled, isDesktop, cursorX, cursorY]);

  // Create a new particle
  const createParticle = (x: number, y: number) => {
    const newParticle: Particle = {
      id: particleIdRef.current++,
      x,
      y,
      opacity: 1,
      scale: 1,
      rotation: Math.random() * 360
    };

    setParticles(prev => [...prev, newParticle]);

    // Remove particle after animation
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== newParticle.id));
    }, 1000);
  };

  // Cleanup old particles periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => {
        if (prev.length > 20) {
          return prev.slice(-20);
        }
        return prev;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Don't render on mobile or when disabled
  if (!enabled || !isDesktop) return null;

  return (
    <>
      {/* Main Cursor */}
      <motion.div
        className="custom-cursor fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%'
        }}
        animate={{
          opacity: isVisible ? 1 : 0,
          scale: isVisible ? 1 : 0
        }}
        transition={{ duration: 0.2 }}
      >
        {/* Outer glow ring */}
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 rounded-full border-2 border-emerald-400/80 animate-pulse" />
          <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-sm" />
          
          {/* Inner cursor dot */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-400" />
        </div>
      </motion.div>

      {/* Particle Trail */}
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="particle fixed top-0 left-0 pointer-events-none z-[9998]"
          initial={{
            x: particle.x,
            y: particle.y,
            opacity: 0.8,
            scale: 1,
            rotate: particle.rotation
          }}
          animate={{
            x: particle.x + (Math.random() - 0.5) * 30,
            y: particle.y + Math.random() * 40 + 20,
            opacity: 0,
            scale: 0.3,
            rotate: particle.rotation + (Math.random() - 0.5) * 180
          }}
          transition={{
            duration: 1,
            ease: [0.4, 0, 0.2, 1]
          }}
          style={{
            translateX: '-50%',
            translateY: '-50%'
          }}
        >
          {/* Leaf particle */}
          <Leaf className="w-4 h-4 text-emerald-400/60" strokeWidth={1.5} />
        </motion.div>
      ))}
    </>
  );
}

/**
 * CustomCursor Toggle Button
 * Allows users to enable/disable the custom cursor
 */
export function CustomCursorToggle() {
  const [enabled, setEnabled] = useState(() => {
    // Load from localStorage - DEFAULT IS OFF (users opt-in)
    const saved = localStorage.getItem('customCursorEnabled');
    return saved === 'true'; // Only enabled if explicitly set to true
  });

  const handleToggle = () => {
    const newValue = !enabled;
    setEnabled(newValue);
    localStorage.setItem('customCursorEnabled', String(newValue));
    
    // Toggle cursor visibility class on body
    if (newValue) {
      document.body.classList.add('custom-cursor-enabled');
    } else {
      document.body.classList.remove('custom-cursor-enabled');
    }

    // Dispatch custom event for CustomCursor component
    window.dispatchEvent(new CustomEvent('cursorToggle', { detail: { enabled: newValue } }));
  };

  useEffect(() => {
    // Initialize body class
    if (enabled) {
      document.body.classList.add('custom-cursor-enabled');
    } else {
      document.body.classList.remove('custom-cursor-enabled');
    }
  }, []);

  return (
    <button
      onClick={handleToggle}
      className={`
        fixed bottom-6 right-6 z-50 
        w-14 h-14
        bg-gradient-to-br ${enabled ? 'from-emerald-500/20 to-green-500/20' : 'from-gray-500/15 to-slate-500/15'}
        hover:${enabled ? 'from-emerald-500/30 to-green-500/30' : 'from-gray-500/25 to-slate-500/25'}
        border-2 ${enabled ? 'border-emerald-500/50' : 'border-gray-500/40'}
        rounded-full
        backdrop-blur-md
        transition-all duration-300 
        hover:scale-110
        ${enabled ? 'shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'shadow-md'}
        flex items-center justify-center
        group
      `}
      title={`Eco Cursor: ${enabled ? 'ON' : 'OFF'}`}
    >
      <Leaf 
        className={`w-6 h-6 transition-all duration-300 ${enabled ? 'text-emerald-400' : 'text-gray-400 opacity-60'} group-hover:rotate-12`}
      />
    </button>
  );
}

/**
 * CustomCursor Provider
 * Main component that manages cursor state and renders both cursor and toggle
 */
export function CustomCursorProvider() {
  const [enabled, setEnabled] = useState(() => {
    // Load from localStorage - DEFAULT IS OFF (users opt-in)
    const saved = localStorage.getItem('customCursorEnabled');
    return saved === 'true'; // Only enabled if explicitly set to true
  });

  useEffect(() => {
    // Listen for toggle events
    const handleToggle = (e: Event) => {
      const customEvent = e as CustomEvent;
      setEnabled(customEvent.detail.enabled);
    };

    window.addEventListener('cursorToggle', handleToggle);
    return () => window.removeEventListener('cursorToggle', handleToggle);
  }, []);

  return (
    <>
      <CustomCursor enabled={enabled} />
      <CustomCursorToggle />
    </>
  );
}
