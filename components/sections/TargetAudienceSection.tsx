// components/sections/TargetAudienceSection.tsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Building,
  Boxes,
  ArrowUpRight,
  CheckCircle2,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { industrialFadeUp, staggerContainer } from '@/lib/motion';

const SECTORS = [
  {
    icon: GraduationCap,
    badge: 'STUDENTS & HARDWARE R&D',
    title: 'Engineering Students & Robotics Teams',
    tagline: 'Rapid capstone prototypes & drone airframes',
    description:
      'Engineered for final-year engineering thesis projects, national robotics competitions, and drone builders. Eliminate brittle print failures with stress-tested functional parts.',
    institutions: [
      'IOE Pulchowk & Thapathali Campuses',
      'Kathmandu University (KU)',
      'Pokhara University (PoU) Affiliated Colleges',
      'Independent Drone & UAV Builder Cohorts',
    ],
    perks: ['Special student batch pricing', '24–48h rapid turnaround in Valley', 'FEA stress & infill consulting'],
    ctaLabel: 'Submit Student Project',
    ctaHref: '/custom-request',
  },
  {
    icon: Building,
    badge: 'ARCHITECTURE & SPATIAL DESIGN',
    title: 'Architectural Studios & Scale Models',
    tagline: 'Topographic contour models & physical massing',
    description:
      'High-precision physical models representing complex terrain, masterplans, and resin facades. Perfect for client presentations, municipal approvals, and heritage documentation.',
    institutions: [
      'Himalayan & Valley Contour Topography',
      'Urban Planning Masterplan Maquettes',
      'Interior Shells & Structural Sectionals',
      'Heritage Restoration Visualization',
    ],
    perks: ['Ultra-fine 18-micron resin detail', 'Modular interlocking terrain tiles', 'Matte architectural finishes'],
    ctaLabel: 'Commission Scale Model',
    ctaHref: '/custom-request',
  },
  {
    icon: Boxes,
    badge: 'NATIONWIDE B2B FILAMENT SUPPLY',
    title: '3D Print Hubs, Makerspaces & Schools',
    tagline: 'Industrial spool wholesale across Nepal',
    description:
      'Reliable filament supply calibrated for automated print farms and educational labs. Certified ±0.02 mm diameter tolerance, vacuum-sealed with active desiccant packs.',
    institutions: [
      'Local Print Farms & Prototyping Labs',
      'University Fabrication & STEAM Labs',
      'Makerspaces in Kathmandu & Pokhara',
      'Regional Commercial Production Units',
    ],
    perks: ['Wholesale rates for 5+ spools', 'Same-day Kathmandu Valley delivery', 'Nationwide courier via Pathao / Freight'],
    ctaLabel: 'Explore B2B Filaments',
    ctaHref: '/filaments',
  },
];

export function TargetAudienceSection() {
  return (
    <section className="relative border-b border-zinc-200 bg-[#FAFAFA] px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header Telemetry */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-zinc-200 pb-8 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#E20000]">
              <MapPin className="h-4 w-4" />
              <span>// LOCAL ECOSYSTEM &bull; PROUDLY FABRICATED IN NEPAL</span>
            </div>
            <h2 className="font-serif text-3xl font-bold text-[#242424] sm:text-5xl">
              Engineered for Nepal’s Innovators
            </h2>
          </div>
          <p className="max-w-md font-serif text-sm text-zinc-600 leading-relaxed">
            From Pulchowk campus robotics labs to boutique architectural studios in Patan and print farms in Pokhara, we deliver precision hardware locally.
          </p>
        </div>

        {/* 3-Column Ecosystem Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3"
        >
          {SECTORS.map((sector, idx) => {
            const Icon = sector.icon;
            return (
              <motion.div
                key={idx}
                variants={industrialFadeUp}
                className="group relative flex flex-col justify-between border border-zinc-200 bg-white p-8 shadow-sm transition-all hover:border-[#002339] hover:shadow-md"
              >
                {/* Structural Top Accent Line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-transparent group-hover:bg-[#E20000] transition-colors" />

                <div>
                  {/* Badge & Icon Header */}
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-[#002339] font-bold">
                      {sector.badge}
                    </span>
                    <div className="flex h-9 w-9 items-center justify-center border border-zinc-200 bg-[#FAFAFA] text-[#E20000] group-hover:bg-[#002339] group-hover:text-white transition-colors">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="mt-5 font-serif text-xl font-bold text-[#242424]">
                    {sector.title}
                  </h3>
                  <p className="mt-1 font-mono text-[11px] text-[#E20000] font-semibold uppercase tracking-wider">
                    {sector.tagline}
                  </p>

                  <p className="mt-3 font-serif text-xs text-zinc-600 leading-relaxed">
                    {sector.description}
                  </p>

                  {/* Ecosystem Trust List */}
                  <div className="mt-6 border-t border-zinc-100 pt-4 space-y-2">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 block">
                      SUPPORTING LOCAL HUBS:
                    </span>
                    <div className="space-y-1.5 font-mono text-xs text-zinc-700">
                      {sector.institutions.map((inst, i) => (
                        <div key={i} className="flex items-center gap-2 text-[11px]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#002339] shrink-0" />
                          <span className="truncate">{inst}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Feature Highlights */}
                  <div className="mt-6 border-t border-zinc-100 pt-4 space-y-2">
                    {sector.perks.map((perk, pIdx) => (
                      <div key={pIdx} className="flex items-center gap-2 font-mono text-[10px] text-zinc-600">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Call-to-action button */}
                <div className="mt-8 pt-4 border-t border-zinc-100">
                  <Link
                    href={sector.ctaHref}
                    className="flex items-center justify-between border border-zinc-300 bg-[#FAFAFA] px-4 py-2.5 font-mono text-xs uppercase font-bold text-[#242424] hover:border-[#002339] hover:bg-[#002339] hover:text-white transition-all shadow-sm"
                  >
                    <span>{sector.ctaLabel}</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom Proof Strip */}
        <div className="mt-12 border border-zinc-200 bg-white p-4 font-mono text-xs flex flex-wrap items-center justify-between gap-4 text-zinc-600 shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#E20000]" />
            <span className="font-bold text-[#242424]">Need an urgent capstone demo or architectural presentation model?</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Valley Delivery: <strong className="text-[#002339]">Within 24 Hours</strong></span>
            <span className="hidden sm:inline">&bull;</span>
            <span>All 7 Provinces: <strong className="text-[#002339]">Air &amp; Courier Freight</strong></span>
          </div>
        </div>

      </div>
    </section>
  );
}
