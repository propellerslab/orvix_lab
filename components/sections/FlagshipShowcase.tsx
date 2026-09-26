// components/sections/FlagshipShowcase.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Radio, BellRing, Check } from 'lucide-react';
import { industrialFadeUp } from '@/lib/motion';

export function FlagshipShowcase() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
    }
  };

  return (
    <section id="flagship" className="relative overflow-hidden border-b border-orvix-border bg-orvix-black px-6 py-28 lg:px-8">
      {/* Background Ambience */}
      <div className="pointer-events-none absolute inset-0 bg-radial-gradient-dark opacity-80" />

      <div className="relative z-10 mx-auto max-w-5xl border border-orvix-border-crimson bg-orvix-dark/90 p-8 sm:p-14 shadow-2xl backdrop-blur-md">

        {/* Hardware Status Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-orvix-border pb-6 font-mono text-xs">
          <div className="flex items-center gap-2 text-orvix-crimson-bright">
            <Radio className="h-4 w-4 animate-pulse" />
            <span className="font-bold tracking-widest uppercase">CLASSIFIED LAB INITIATIVE</span>
          </div>
          <span className="text-zinc-500 uppercase">PROJECT CODENAME: ORVIX-01</span>
        </div>

        {/* Showcase Description */}
        <motion.div
          variants={industrialFadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-8 space-y-6"
        >
          <div className="inline-flex items-center gap-2 border border-orvix-border bg-orvix-panel px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-zinc-300">
            <Lock className="h-3 w-3 text-orvix-crimson-bright" />
            <span>Proprietary Hardware &bull; Launching Soon</span>
          </div>

          <h2 className="font-serif text-4xl font-bold tracking-tight text-white sm:text-6xl">
            The next generation of in-house manufacturing hardware.
          </h2>

          <p className="max-w-3xl font-serif text-base text-zinc-300 leading-relaxed sm:text-lg">
            We are finalizing our proprietary flagship device—a convergence of advanced kinematics, closed-loop thermal regulation, and custom firmware built from the ground up inside our labs.
          </p>

          {/* Waitlist Access Capture */}
          <div className="pt-6">
            {subscribed ? (
              <div className="inline-flex items-center gap-3 border border-emerald-800 bg-emerald-950/40 px-5 py-3 font-mono text-xs text-emerald-400">
                <Check className="h-4 w-4" />
                <span>SPECIFICATION PACKET RESERVED. YOU WILL BE NOTIFIED AT LAUNCH.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@company.com"
                  required
                  className="flex-1 border border-orvix-border bg-orvix-panel px-4 py-3 font-mono text-xs text-white placeholder-zinc-500 focus:border-orvix-crimson-bright focus:outline-none"
                />
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 border border-orvix-crimson-bright bg-orvix-crimson px-5 py-3 font-mono text-xs uppercase tracking-wider text-white hover:bg-orvix-crimson-bright transition-colors shrink-0"
                >
                  <BellRing className="h-4 w-4" />
                  <span>Request Briefing</span>
                </button>
              </form>
            )}
            <p className="mt-3 font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
              Protected by NDA. Early access for B2B engineering partners.
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
