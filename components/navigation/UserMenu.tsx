// components/navigation/UserMenu.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/providers/auth-provider';
import { Shield, Package, LogOut, User as UserIcon } from 'lucide-react';

export function UserMenu() {
  const { user, profile, isAdmin, isLoading, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isLoading) {
    return <div className="h-8 w-8 animate-pulse bg-orvix-border rounded-none" />;
  }

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="border border-orvix-border bg-orvix-dark px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-zinc-300 transition-colors hover:border-orvix-crimson-bright hover:text-white"
      >
        Sign In
      </Link>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 border border-orvix-border bg-orvix-dark p-1 hover:border-orvix-crimson-bright transition-all"
      >
        {profile?.avatar_url ? (
          <Image
            src={profile.avatar_url}
            alt={profile.full_name || 'User'}
            width={28}
            height={28}
            className="border border-orvix-border"
          />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center bg-orvix-panel text-white font-mono text-xs">
            {profile?.full_name?.charAt(0) || 'U'}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 border border-orvix-border bg-orvix-dark/95 shadow-2xl backdrop-blur-md z-50">
          <div className="border-b border-orvix-border p-3">
            <p className="font-serif text-sm font-semibold text-white truncate">
              {profile?.full_name || 'Lab Operator'}
            </p>
            <p className="font-mono text-[10px] text-zinc-400 truncate">
              {user.email}
            </p>
            <div className="mt-1 flex items-center gap-1.5">
              <span className={`inline-block h-1.5 w-1.5 ${isAdmin ? 'bg-orvix-crimson-bright' : 'bg-emerald-500'}`} />
              <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400">
                {profile?.role || 'customer'}
              </span>
            </div>
          </div>

          <div className="p-1 font-mono text-xs">
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-orvix-crimson-bright hover:bg-orvix-panel transition-colors"
              >
                <Shield className="h-3.5 w-3.5" />
                <span>Admin Console</span>
              </Link>
            )}

            <Link
              href="/orders"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-zinc-300 hover:bg-orvix-panel hover:text-white transition-colors"
            >
              <Package className="h-3.5 w-3.5" />
              <span>My Orders</span>
            </Link>

            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-zinc-300 hover:bg-orvix-panel hover:text-white transition-colors"
            >
              <UserIcon className="h-3.5 w-3.5" />
              <span>Specs & Address</span>
            </Link>

            <button
              onClick={() => {
                setIsOpen(false);
                signOut();
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-zinc-400 hover:bg-orvix-panel hover:text-red-400 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Disconnect</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
