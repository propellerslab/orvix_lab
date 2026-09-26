// app/orders/page.tsx
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Package, ExternalLink, Clock } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function OrdersPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?redirectTo=/orders');
  }

  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, status, total_amount, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
      <div className="border-b border-orvix-border pb-6 flex items-center justify-between">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-orvix-crimson-bright">
           // CLIENT ARCHIVE
          </span>
          <h1 className="mt-2 font-serif text-3xl font-bold text-white sm:text-4xl">
            My Production Orders
          </h1>
        </div>
        <Package className="h-8 w-8 text-zinc-600" />
      </div>

      {!orders || orders.length === 0 ? (
        <div className="mt-12 border border-orvix-border bg-orvix-dark p-12 text-center">
          <Clock className="mx-auto h-10 w-10 text-zinc-600" />
          <p className="mt-4 font-serif text-lg text-white">No active fabrication records found.</p>
          <p className="mt-1 font-mono text-xs text-zinc-400">Initialize an order via our products or filament catalog.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between border border-orvix-border bg-orvix-dark p-6 gap-4 hover:border-orvix-crimson transition-all"
            >
              <div>
                <span className="font-mono text-[10px] text-zinc-500 uppercase">
                  LOGGED: {new Date(ord.created_at).toLocaleDateString()}
                </span>
                <h3 className="font-mono text-base font-bold text-white">
                  {ord.order_number}
                </h3>
                <span className="inline-block mt-2 border border-orvix-border-crimson bg-orvix-panel px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-orvix-crimson-bright">
                  STATUS: {ord.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="flex items-center gap-6 self-end sm:self-auto">
                <span className="font-mono text-lg font-bold text-white">
                  Rs. {Number(ord.total_amount).toFixed(2)}
                </span>
                <Link
                  href={`/orders/${ord.id}`}
                  className="flex items-center gap-1.5 border border-orvix-border bg-orvix-panel px-4 py-2 font-mono text-xs uppercase tracking-wider text-zinc-300 hover:text-white hover:border-orvix-crimson-bright transition-colors"
                >
                  <span>Telemetry</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
