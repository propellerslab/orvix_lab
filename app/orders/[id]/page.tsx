// app/orders/[id]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Clock, Send, Package, Truck } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const STATUS_STAGES = [
  { key: 'submitted_whatsapp', label: 'Transmitted to WhatsApp', icon: Send },
  { key: 'confirmed', label: 'Order Confirmed', icon: CheckCircle2 },
  { key: 'in_production', label: '3D Printing & Assembly', icon: Clock },
  { key: 'shipped', label: 'Dispatched via Carrier', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Package },
];

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .eq('id', id)
    .single();

  if (!order) {
    notFound();
  }

  const currentStageIndex = STATUS_STAGES.findIndex((s) => s.key === order.status);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 lg:px-8">

      <Link
        href="/orders"
        className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-zinc-400 hover:text-white mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Order Archive</span>
      </Link>

      <div className="border border-orvix-border bg-orvix-dark p-8">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-orvix-border pb-6">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-orvix-crimson-bright">
              TRANSMISSION TELEMETRY
            </span>
            <h1 className="font-mono text-2xl font-bold text-white sm:text-3xl">
              {order.order_number}
            </h1>
          </div>
          <div className="font-mono text-right">
            <span className="text-[10px] text-zinc-500 uppercase block">Total Value</span>
            <span className="text-xl font-bold text-white">Rs. {Number(order.total_amount).toFixed(2)} USD</span>
          </div>
        </div>

        {/* Visual Pipeline Progression */}
        <div className="mt-8 border-b border-orvix-border pb-8">
          <span className="font-mono text-xs uppercase tracking-widest text-zinc-400 block mb-6">
            Production Stage
          </span>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {STATUS_STAGES.map((stage, idx) => {
              const Icon = stage.icon;
              const isPassed = currentStageIndex >= idx;
              const isCurrent = currentStageIndex === idx;

              return (
                <div
                  key={stage.key}
                  className={`border p-3 flex flex-col justify-between h-24 ${
                    isCurrent
                      ? 'border-orvix-crimson-bright bg-orvix-crimson/10'
                      : isPassed
                      ? 'border-zinc-700 bg-black/60'
                      : 'border-orvix-border/40 bg-black/20 opacity-40'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isCurrent ? 'text-orvix-crimson-bright' : isPassed ? 'text-white' : 'text-zinc-600'}`} />
                  <span className="font-mono text-[10px] font-semibold text-zinc-300">
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Itemized Manifest */}
        <div className="mt-8">
          <span className="font-mono text-xs uppercase tracking-widest text-zinc-400 block mb-4">
            Fabricated Bill of Materials
          </span>

          <div className="space-y-3 font-mono text-xs">
            {order.order_items?.map((item: any) => (
              <div
                key={item.id}
                className="flex items-center justify-between border border-orvix-border bg-black/40 p-4"
              >
                <div>
                  <p className="font-bold text-white">{item.item_name}</p>
                  <p className="text-[10px] text-zinc-500">
                    Qty: {item.quantity} &bull; Unit: Rs. {Number(item.unit_price).toFixed(2)}
                  </p>
                </div>
                <span className="font-bold text-white">Rs. {Number(item.total_price).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
