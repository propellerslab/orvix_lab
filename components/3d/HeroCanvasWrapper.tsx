// components/3d/HeroCanvasWrapper.tsx
'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';

const HeroScene = dynamic(() => import('./HeroScene'), { ssr: false });

export function HeroCanvasWrapper() {
  return (
    <div className="relative h-full w-full">
      <Suspense
        fallback={
          <div className="flex h-full w-full items-center justify-center bg-orvix-black">
            <span className="font-mono text-xs uppercase tracking-widest text-zinc-500 animate-pulse">
              // INITIALIZING 3D ENGINE...
            </span>
          </div>
        }
      >
        <Canvas
          camera={{ position: [0, 0, 5.5], fov: 45 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
          className="h-full w-full"
        >
          <HeroScene />
        </Canvas>
      </Suspense>
    </div>
  );
}
