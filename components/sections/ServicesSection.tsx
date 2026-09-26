// components/sections/ServicesSection.tsx
'use client';

import { motion } from 'framer-motion';
import { Layers, Disc, Hammer, CheckCircle2 } from 'lucide-react';
import { industrialFadeUp, staggerContainer } from '@/lib/motion';

const CAPABILITIES = [
  {
    icon: Layers,
    title: 'Industrial FDM Fabrication',
    tag: 'HIGH-TEMP & COMPOSITES',
    description:
      'Continuous carbon-fiber reinforced filaments, Polycarbonate, and ASA engineering plastics calibrated for mechanical stress components.',
    specs: ['Max Volume: 400 x 400 x 450 mm', 'Tolerances: ±0.08 mm', 'Infill Optimization: Gyroid / Stress-aligned'],
  },
  {
    icon: Disc,
    title: 'Ultra-High SLA & Resin Systems',
    tag: 'MICRON SURFACE FINISH',
    description:
      'Rigid engineering, tough, and castable resins for aesthetic casings, micro-fluidic prototypes, and complex dental/jewelry tooling.',
    specs: ['XY Resolution: 18 Microns', 'Post-Cure Thermal Stabilized', 'Zero visible layer lines'],
  },
  {
    icon: Hammer,
    title: 'Short-Run Production Batches',
    tag: 'SCALED REPLICATION',
    description:
      'Bridge manufacturing from 10 to 5,000 units. Eliminate standard injection-mold tooling lead times with parametric iteration.',
    specs: ['Direct serialization per unit', 'Custom insert heat staking', 'Batch QA certification'],
  },
];

export function ServicesSection() {
  return (
    <section className="relative border-b border-orvix-border bg-orvix-black px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-orvix-border pb-8 gap-6">
          <div className="space-y-3">
            <span className="font-mono text-xs uppercase tracking-widest text-orvix-crimson-bright">
              // 01 &bull; PHYSICAL MANUFACTURING
            </span>
            <h2 className="font-serif text-3xl font-bold text-white sm:text-5xl">
              Precision Additive Engineering
            </h2>
          </div>
          <p className="max-w-md font-serif text-sm text-zinc-400">
            We operate an industrial print farm engineered for functional end-use assemblies, not brittle prototypes.
          </p>
        </div>

        {/* Capabilities Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3"
        >
          {CAPABILITIES.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <motion.div
                key={i}
                variants={industrialFadeUp}
                className="group relative border border-orvix-border bg-orvix-dark p-8 transition-all hover:border-orvix-crimson-bright"
              >
                {/* Laser Corner Accent */}
                <div className="absolute top-0 right-0 h-3 w-3 border-t border-r border-transparent group-hover:border-orvix-crimson-bright transition-colors" />

                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center border border-orvix-border-crimson bg-orvix-panel text-orvix-crimson-bright group-hover:bg-orvix-crimson group-hover:text-white transition-colors">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
                    {cap.tag}
                  </span>
                </div>

                <h3 className="mt-6 font-serif text-xl font-bold text-white">
                  {cap.title}
                </h3>

                <p className="mt-3 font-serif text-xs text-zinc-400 leading-relaxed">
                  {cap.description}
                </p>

                <div className="mt-6 space-y-2 border-t border-orvix-border/60 pt-4 font-mono text-[11px] text-zinc-300">
                  {cap.specs.map((spec, sIdx) => (
                    <div key={sIdx} className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-orvix-crimson-bright shrink-0" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}
