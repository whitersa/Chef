'use client';

import { motion, useInView, UseInViewOptions } from 'framer-motion';
import { useRef, ReactNode } from 'react';

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  fullWidth?: boolean;
  once?: boolean; // Whether to animate only once
  margin?: UseInViewOptions['margin'];
}

export function FadeIn({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  fullWidth = false,
  once = true,
  margin = '-50px',
}: FadeInProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin });

  const getDirectionOffset = () => {
    switch (direction) {
      case 'up':
        return { y: 20, x: 0 }; // Reduced from 40 to 20 for subtlety
      case 'down':
        return { y: -20, x: 0 };
      case 'left':
        return { x: 20, y: 0 };
      case 'right':
        return { x: -20, y: 0 };
      case 'none':
      default:
        return { x: 0, y: 0 };
    }
  };

  const initial = { opacity: 0, ...getDirectionOffset() };
  const animate = isInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...getDirectionOffset() };

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={animate}
      transition={{
        duration: 0.5, // Reduced from 0.8 for snappier feel
        delay: delay,
        ease: [0.25, 0.1, 0.25, 1.0], // "Ease Out Cubic" - cleaner, less "bouncy" than spring
      }}
      className={`${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({
  children,
  className = '',
  delay = 0,
  staggerDelay = 0.1,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  staggerDelay?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-50px' }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: delay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 10 }, // Reduced from 20
        show: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.4, // Reduced from 0.6
            ease: [0.25, 0.1, 0.25, 1.0], // Consistent easing
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
