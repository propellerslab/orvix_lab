// components/navigation/Navbar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Box, Layers, Cpu, ArrowUpRight } from 'lucide-react';
import { UserMenu } from './UserMenu';
const NAV_ITEMS = [
  { label: 'Built Products', href: '/products', icon: Box },
  { label: 'Filaments [B2B]', href: '/filaments', icon: Layers },
  { label: 'Custom Lab', href: '/custom-request', icon: Cpu },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-orvix-border bg-orvix-black/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">

        {/* Brand Core */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center border border-orvix-crimson bg-orvix-dark group-hover:border-orvix-crimson-bright transition-colors">
            <span className="font-mono text-sm font-bold text-orvix-crimson-bright group-hover:text-white">
              OX
            </span>
            <div className="absolute -bottom-1 -right-1 h-1.5 w-1.5 bg-orvix-crimson-bright" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-lg font-bold tracking-wider text-orvix-light">
              ORVIX LAB
            </span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-orvix-muted">
              Physical Systems &bull; 3D Dev
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group relative flex items-center gap-2 py-2 font-mono text-xs uppercase tracking-wider text-orvix-muted hover:text-white transition-colors"
              >
                <Icon className="h-3.5 w-3.5 text-orvix-crimson group-hover:text-orvix-crimson-bright" />
                <span className={isActive ? 'text-white font-semibold' : ''}>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-orvix-crimson-bright"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Flagship Notice & Action Button */}
        <div className="flex items-center gap-5">
          <div className="hidden lg:flex items-center gap-2 border border-orvix-border bg-orvix-dark px-3 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orvix-crimson-bright opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orvix-crimson"></span>
            </span>
            <span className="font-mono text-[10px] tracking-wider text-zinc-400 uppercase">
              Flagship: In Dev
            </span>
          </div>

          <Link
            href="/custom-request"
            className="flex items-center gap-2 border border-orvix-crimson bg-orvix-crimson/10 px-4 py-2 font-mono text-xs uppercase tracking-wider text-white transition-all hover:bg-orvix-crimson hover:shadow-crimson-glow"
          >
            <span>Quote Project</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
