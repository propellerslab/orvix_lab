// app/admin/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ClipboardList,
  AlertOctagon,
  Cpu,
  Boxes,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { industrialFadeUp, staggerContainer } from '@/lib/motion';

export default function AdminDashboardPage() {
  const supabase = createClient();
  const [metrics, setMetrics] = useState({
    pendingWhatsapp: 0,
    inProduction: 0,
    lowStockFilaments: 0,
    customRequests: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [
          { count: pendingCount },
          { count: prodCount },
          { count: lowStockCount },
          { count: requestCount },
        ] = await Promise.all([
          supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'submitted_whatsapp'),
          supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'in_production'),
          supabase.from('filaments').select('*', { count: 'exact', head: true }).lt('stock_spools', 10),
          supabase.from('custom_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending_review'),
        ]);

        setMetrics({
          pendingWhatsapp: pendingCount || 0,
          inProduction: prodCount || 0,
          lowStockFilaments: lowStockCount || 0,
          customRequests: requestCount || 0,
        });
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [supabase]);

  const CARDS = [
    {
      label: 'WhatsApp Queue',
      val: metrics.pendingWhatsapp,
      desc: 'Orders awaiting verification link',
      href: '/admin/orders',
      icon: ClipboardList,
      alert: metrics.pendingWhatsapp > 0,
    },
    {
      label: 'Active Print Farm',
      val: metrics.inProduction,
      desc: 'Jobs currently on 3D print beds',
      href: '/admin/orders',
      icon: Cpu,
      alert: false,
    },
    {
      label: 'Custom CAD Inflow',
      val: metrics.customRequests,
      desc: 'Bespoke quotes awaiting review',
      href: '/admin/customers',
      icon: TrendingUp,
      alert: metrics.customRequests > 0,
    },
    {
      label: 'Low Spool Warnings',
      val: metrics.lowStockFilaments,
      desc: 'Filament spools below 10 units',
      href: '/admin/catalog',
      icon: AlertOctagon,
      alert: metrics.lowStockFilaments > 0,
    },
  ];

  return (
    <div className="space-y-10">

      {/* Telemetry Header */}
      <div className="border-b border-orvix-border pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-orvix-crimson-bright">
            // METRIC TELEMETRY
          </span>
          <h1 className="mt-1 font-serif text-3xl font-bold text-white sm:text-4xl">
            Operational Overview
          </h1>
        </div>
        <div className="flex items-center gap-2 border border-orvix-border bg-orvix-dark px-3 py-1 font-mono text-xs text-zinc-400">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>PRODUCTION SYSTEMS NORMAL</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {CARDS.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={i}
              variants={industrialFadeUp}
              className={`border p-6 transition-all ${
                card.alert
                  ? 'border-orvix-crimson-bright bg-orvix-crimson/10 shadow-crimson-glow'
                  : 'border-orvix-border bg-orvix-dark'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase text-zinc-400">{card.label}</span>
                <Icon className={`h-5 w-5 ${card.alert ? 'text-orvix-crimson-bright' : 'text-zinc-500'}`} />
              </div>
              <div className="mt-4 font-mono text-4xl font-bold text-white">
                {loading ? '...' : card.val}
              </div>
              <p className="mt-2 font-serif text-xs text-zinc-400">{card.desc}</p>
              <div className="mt-4 border-t border-orvix-border/60 pt-3">
                <Link
                  href={card.href}
                  className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-orvix-crimson-bright hover:text-white"
                >
                  <span>Inspect module</span>
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

    </div>
  );
}
