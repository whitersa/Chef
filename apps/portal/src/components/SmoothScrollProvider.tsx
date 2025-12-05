'use client';

import { ReactLenis } from 'lenis/react';
import { ReactNode } from 'react';

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  return (
    // Apple's scroll feel is usually tighter and more responsive.
    // duration: 1.2 -> Slightly faster than 1.5
    // lerp: 0.1 -> Keep it for smoothness, but the lower duration makes it less "floaty"
    // wheelMultiplier: 1 -> Standard scroll speed
    <ReactLenis root options={{ lerp: 0.1, duration: 1.2, smoothWheel: true, wheelMultiplier: 1 }}>
      {children}
    </ReactLenis>
  );
}
