// components/sections/TechSupportSection.tsx
'use client';

import Link from 'next/link';
import { Cpu, Wrench, ShieldCheck, ArrowRight } from 'lucide-react';

const SERVICES = [
  {
    icon: Cpu,
    title: 'Embedded Hardware & Enclosures',
    desc: 'Bespoke chassis designed around PCB geometries with thermal vent paths, EMI shielding channels, and gasket seals.',
  },
  {
    icon: Wrench,
    title: 'Topology Optimization & CAD',
    desc: 'FEA stress-simulation to shed non-critical mass while multiplying tensile strength across high-load axes.',
  },
  {
    icon: ShieldCheck,
    title: 'Dedicated Engineering Support',
    desc: 'Direct consultation on material selection, slicing orientation, shear resistance, and post-processing treatments.',
  },
];

export function TechSupportSection() {
  return (
    <section className="relative border-b border-orvix-border bg-orvix-dark px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          <div className="lg:col-span-5 space-y-6">
            <span className="font-mono text-xs uppercase tracking-widest text-orvix-crimson-bright">
              // 02 &bull; DIGITAL PROBLEM-SOLVING
            </span>
            <h2 className="font-serif text-3xl font-bold text-white sm:text-5xl leading-tight">
              Beyond printing. Full-stack hardware engineering.
            </h2>
            <p className="font-serif text-sm text-zinc-400 leading-relaxed">
              Orvix Lab doesn’t just output G-code. We assist your team in converting conceptual CAD models into field-ready mechanical hardware with industrial electronics integration.
            </p>
            <div className="pt-2">
              <Link
                href="/custom-request"
                className="inline-flex items-center gap-2 border border-orvix-border bg-orvix-panel px-5 py-3 font-mono text-xs uppercase tracking-wider text-zinc-800 hover:border-orvix-crimson-bright hover:bg-orvix-crimson/10 transition-colors"
              >
                <span>Consult with an Engineer</span>
                <ArrowRight className="h-4 w-4 text-orvix-crimson-bright" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 gap-6">
            {SERVICES.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row items-start gap-4 border border-orvix-border bg-orvix-black p-6 transition-all hover:border-orvix-border-crimson"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-orvix-crimson bg-orvix-dark text-orvix-crimson-bright">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-serif text-lg font-bold text-white">
                      {item.title}
                    </h3>
                    <p className="font-serif text-xs text-zinc-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
