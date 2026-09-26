// components/sections/HeroSection.tsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, ChevronRight, Terminal, MapPin } from 'lucide-react';
import { HeroCanvasWrapper } from '@/components/3d/HeroCanvasWrapper';
import { industrialFadeUp, staggerContainer } from '@/lib/motion';

export function HeroSection() {
  return (
    <section className="relative min-h-[calc(100vh-5rem)] w-full overflow-hidden border-b border-zinc-200 bg-[#FAFAFA]">

      {/* 3D Background Canvas Layer */}
      <div className="absolute inset-0 z-0 h-full w-full">
        <HeroCanvasWrapper />
      </div>

      {/* Subtle Studio Vignette */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-[#FAFAFA]/95 via-[#FAFAFA]/80 to-transparent" />

      {/* Interactive HUD Content */}
      <div className="relative z-20 mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl flex-col justify-between px-6 py-12 lg:px-8">

        {/* Top Telemetry Row with Local Provenance */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200/80 pb-4 font-mono text-[10px] tracking-wider text-zinc-500 uppercase"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E20000] opacity-75"></span>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-6 text-zinc-600 font-semibold">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-[#E20000]" />
              <span>DISPATCH: KATHMANDU &amp; ALL-NEPAL COURIER</span>
            </span>

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
            className="inline-flex items-center gap-2 border border-[#002339]/20 bg-white px-3 py-1.5 shadow-sm"
          >
            <Terminal className="h-3.5 w-3.5 text-[#E20000]" />
            <span className="font-mono text-[11px] uppercase tracking-widest text-[#002339] font-semibold">
              ADVANCED 3D PRINTING &bull; B2B FILAMENT SUPPLY IN NEPAL
            </span>
          </motion.div>

          <motion.h1
            variants={industrialFadeUp}
            className="font-serif text-5xl font-bold tracking-tight text-[#242424] sm:text-7xl lg:text-8xl leading-[1.05]"
          >
            Forging physical systems from <span className="text-[#E20000]">pure logic.</span>
          </motion.h1>

          <motion.p
            variants={industrialFadeUp}
            className="max-w-2xl font-serif text-base text-zinc-600 sm:text-lg leading-relaxed"
          >
            Orvix Lab bridges the gap between digital problem-solving and physical manufacturing.
            We engineer custom 3D-printed parts for students and architects, supply high-grade filaments across Nepal, and develop proprietary hardware.
          </motion.p>

          {/* Action Triggers */}
          <motion.div
            variants={industrialFadeUp}
            className="flex flex-wrap items-center gap-4 pt-4"
          >
            <Link
              href="/custom-request"
              className="group flex items-center gap-3 border border-[#E20000] bg-[#E20000] px-6 py-3.5 font-mono text-xs uppercase tracking-wider text-white shadow-sm transition-all hover:bg-[#C50000] hover:shadow-md"
            >
              <span>Initiate Custom Build</span>
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>

            <Link
              href="/filaments"
              className="flex items-center gap-2 border border-[#002339] bg-white px-6 py-3.5 font-mono text-xs uppercase tracking-wider text-[#002339] transition-all hover:bg-[#002339] hover:text-white"
            >
              <span>B2B Filament Supply</span>
              <ChevronRight className="h-4 w-4 text-[#E20000]" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Bottom Hardware Telemetry Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-zinc-200/80 pt-6 font-mono text-xs"
        >
          <div>
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest">RAPID PROTOTYPING</p>
            <p className="text-sm font-bold text-[#242424]">24-48h Valley Turnaround</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest">TOPOGRAPHIC &amp; ARCH</p>
            <p className="text-sm font-bold text-[#242424]">Sub-Millimeter Contours</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest">B2B DEPOT</p>
            <p className="text-sm font-bold text-[#242424]">NCM, Pathao &amp; Courier Freight</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest">ACADEMIC ALLIANCE</p>
            <p className="text-sm font-bold text-[#E20000]">All Support</p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
