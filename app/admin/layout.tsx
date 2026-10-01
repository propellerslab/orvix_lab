// app/admin/layout.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldAlert,
  LayoutDashboard,
  ClipboardList,
  Layers,
  Tag,
  Users,
  LogOut,
  Sliders,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';

const NAV_LINKS = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Order Pipeline', icon: ClipboardList },
  { href: '/admin/invoices', label: 'Invoice Studio', icon: FileText },
  { href: '/admin/catalog', label: 'Catalog & Inventory', icon: Layers },
  { href: '/admin/marketing', label: 'Banners & Offers', icon: Tag },
  { href: '/admin/customers', label: 'Client Accounts', icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();

  return (
    <div className="flex min-h-[calc(100vh-5rem)] border-t border-orvix-border bg-orvix-black text-orvix-light">

      {/* Lateral Navigation Sidebar */}
      <aside className="w-64 shrink-0 border-r border-orvix-border bg-orvix-dark/95 flex flex-col justify-between hidden md:flex">
        <div>
          {/* Header Badge */}
          <div className="border-b border-orvix-border p-5">
            <div className="flex items-center gap-2 text-orvix-crimson-bright font-mono text-xs uppercase tracking-widest">
              <ShieldAlert className="h-4 w-4" />
              <span>SECURITY LEVEL: 0</span>
            </div>
            <h2 className="mt-1 font-serif text-lg font-bold text-white tracking-wide">
              Command Terminal
            </h2>
            <p className="font-mono text-[10px] text-zinc-500">
              OPERATOR: {profile?.full_name || 'Admin Officer'}
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 font-mono text-xs">
            {NAV_LINKS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 transition-all ${
                    isActive
                      ? 'border-l-2 border-orvix-crimson-bright bg-orvix-panel text-white font-semibold'
                      : 'text-zinc-400 hover:bg-orvix-panel hover:text-white'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-orvix-crimson-bright' : 'text-zinc-500'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-orvix-border p-4 font-mono text-xs space-y-2">
          <Link
            href="/"
            className="flex items-center justify-between text-zinc-400 hover:text-white p-2 hover:bg-orvix-panel transition-colors"
          >
            <span>Public Site</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-2 text-red-400 hover:text-red-300 p-2 hover:bg-orvix-panel transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden p-6 lg:p-10">
        {children}
      </main>

    </div>
  );
}
