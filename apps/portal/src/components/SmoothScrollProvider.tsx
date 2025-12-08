'use client';

import { ReactLenis } from 'lenis/react';
import { ReactNode } from 'react';

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  return (
    // Lighter feel: Higher lerp (more responsive), Lower duration (faster settle)
    <ReactLenis
      root
      options={{ lerp: 0.3, duration: 0.8, smoothWheel: true, wheelMultiplier: 1.2 }}
    >
      {children}
    </ReactLenis>
  );
}
