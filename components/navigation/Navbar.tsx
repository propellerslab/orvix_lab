// components/navigation/Navbar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Box, Layers, Cpu, ArrowUpRight, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { UserMenu } from './UserMenu';

const NAV_ITEMS = [
  { label: 'Built Products', href: '/products', icon: Box },
  { label: 'Filaments [B2B]', href: '/filaments', icon: Layers },
  { label: 'Custom Lab', href: '/custom-request', icon: Cpu },
];

export function Navbar() {
  const pathname = usePathname();
  const { itemCount, setIsCartOpen } = useCart();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-orvix-border bg-orvix-black/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">

        {/* Brand */}
        <Link href="/" className="group flex items-center gap-3">
          {/* Geometric Orvix Wordmark matching your logo */}
          <div className="flex flex-col">
            <div className="flex items-baseline tracking-tight font-bold font-mono text-2xl leading-none">
              <span className="text-[#E20000]">ORVI</span>
              <span className="text-orvix-navy">X</span>
              <span className="ml-1 text-xs text-orvix-charcoal font-normal tracking-normal lowercase">lab</span>
            </div>
            {/* The structural horizontal line underneath */}
            <div className="mt-1 h-[2.5px] w-full bg-orvix-navy" />
          </div>
        </Link>

        {/* Navigation */}
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
                <span className={isActive ? 'text-orvix-crimson font-semibold' : ''}>{item.label}</span>
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

        {/* Actions (Cart, User, Quote) */}
        <div className="flex items-center gap-4">
          {/* Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 border border-orvix-border bg-orvix-dark px-3 py-2 text-zinc-300 hover:border-orvix-crimson-bright hover:text-white transition-colors"
            title="Open Cart"
          >
            <ShoppingBag className="h-4 w-4 text-orvix-crimson-bright" />
            <span className="font-mono text-xs font-bold">{itemCount}</span>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orvix-crimson-bright opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orvix-crimson-bright"></span>
              </span>
            )}
          </button>

          <UserMenu />

          <Link
            href="/custom-request"
            className="hidden sm:flex items-center gap-2 border border-orvix-crimson bg-orvix-crimson/10 px-4 py-2 font-mono text-xs uppercase tracking-wider text-black font-semibold  hover:bg-orvix-crimson hover:shadow-crimson-glow transition-all"
          >
            <span>Quote</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

      </div>
    </header>
  );
}
