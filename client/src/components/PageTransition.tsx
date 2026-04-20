/**
 * PageTransition Component
 * 
 * Provides smooth fade and slide animations when navigating between routes.
 * Wraps page content with Framer Motion animations for a seamless UX.
 */

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1], // Custom cubic-bezier for smooth motion
      }}
    >
      {children}
    </motion.div>
  );
}
