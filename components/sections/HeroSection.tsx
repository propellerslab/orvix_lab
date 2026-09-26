// components/sections/HeroSection.tsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, ChevronRight, Activity, Terminal } from 'lucide-react';
import { HeroCanvasWrapper } from '@/components/3d/HeroCanvasWrapper';
import { industrialFadeUp, staggerContainer } from '@/lib/motion';

export function HeroSection() {
  return (
    <section className="relative min-h-[calc(100vh-5rem)] w-full overflow-hidden border-b border-orvix-border bg-orvix-black">
      {/* 3D Background Canvas Layer */}
      <div className="absolute inset-0 z-0 h-full w-full opacity-90 lg:opacity-100">
        <HeroCanvasWrapper />
      </div>

      {/* Dark Radial Mask to guarantee text contrast */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-radial-gradient-dark/80" />

      {/* Interactive HUD Content */}
      <div className="relative z-20 mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl flex-col justify-between px-6 py-12 lg:px-8">

        {/* Top Telemetry Row */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-center justify-between gap-4 border-b border-orvix-border/50 pb-4 font-mono text-[10px] tracking-wider text-zinc-400 uppercase"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orvix-crimson-bright opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orvix-crimson-bright"></span>
            </span>
            <span>SYSTEM_ONLINE: ORVIX_CORE_V2.6</span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-zinc-500">
            <span>TOLERANCE: &plusmn;0.05 MM</span>
            <span>SPEC: INDUSTRIAL GRADE</span>
            <span>LOC: GLOBAL DISPATCH</span>
          </div>
        </motion.div>

        {/* Center Main Stage Copy */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="my-auto max-w-3xl space-y-6 pt-12 pb-8"
        >
          <motion.div
            variants={industrialFadeUp}
            className="inline-flex items-center gap-2 border border-orvix-border-crimson bg-orvix-dark/80 px-3 py-1.5 backdrop-blur-sm"
          >
            <Terminal className="h-3.5 w-3.5 text-orvix-crimson-bright" />
            <span className="font-mono text-[11px] uppercase tracking-widest text-zinc-300">
              PHYSICAL MANUFACTURING &bull; TECH ENGINEERING
            </span>
          </motion.div>

          <motion.h1
            variants={industrialFadeUp}
            className="font-serif text-5xl font-bold tracking-tight text-white sm:text-7xl lg:text-8xl leading-[1.05]"
          >
            Forging physical systems from <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-orvix-crimson-bright">pure logic.</span>
          </motion.h1>

          <motion.p
            variants={industrialFadeUp}
            className="max-w-2xl font-serif text-base text-zinc-400 sm:text-lg leading-relaxed"
          >
            Orvix Lab bridges the gap between digital problem-solving and physical
            manufacturing by engineering custom 3D-printed products, high-grade filaments, and custom technical hardware.
          </motion.p>

          {/* Action Triggers */}
          <motion.div
            variants={industrialFadeUp}
            className="flex flex-wrap items-center gap-4 pt-4"
          >
            <Link
              href="/custom-request"
              className="group flex items-center gap-3 border border-orvix-crimson-bright bg-orvix-crimson px-6 py-3.5 font-mono text-xs uppercase tracking-wider text-white shadow-crimson-glow transition-all hover:bg-orvix-crimson-bright"
            >
              <span>Initiate Custom Build</span>
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>

            <Link
              href="#flagship"
              className="flex items-center gap-2 border border-orvix-border bg-orvix-dark/90 px-6 py-3.5 font-mono text-xs uppercase tracking-wider text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
            >
              <span>Classified Flagship</span>
              <ChevronRight className="h-4 w-4 text-orvix-crimson-bright" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Bottom Hardware Telemetry Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-orvix-border/50 pt-6 font-mono text-xs"
        >
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">LAYER RESOLUTION</p>
            <p className="text-sm font-bold text-white">Up to 12 &mu;m</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">RAPID TOOLING</p>
            <p className="text-sm font-bold text-white">48h Turnaround</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">B2B FILAMENTS</p>
            <p className="text-sm font-bold text-white">Carbon, ASA, TPU</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">ARCHITECTURE</p>
            <p className="text-sm font-bold text-orvix-crimson-bright">Proprietary In-House</p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
