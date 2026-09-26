// app/admin/orders/page.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  Send,
  Truck,
  Package,
  XCircle,
  ExternalLink,
  ChevronRight,
  MessageCircle,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const STATUS_OPTIONS = [
  'submitted_whatsapp',
  'confirmed',
  'in_production',
  'ready_for_shipping',
  'shipped',
  'delivered',
  'cancelled',
];

export default function AdminOrdersPage() {
  const supabase = createClient();
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });
    if (data) setOrders(data);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSelectOrder = async (ord: any) => {
    setSelectedOrder(ord);
    // Fetch related audit logs
    const { data: logs } = await supabase
      .from('order_status_audit_logs')
      .select('*')
      .eq('order_id', ord.id)
      .order('created_at', { ascending: false });
    setAuditLogs(logs || []);
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedOrder) return;
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', selectedOrder.id);

      if (error) throw error;

      // Refresh local list & selection
      await fetchOrders();
      handleSelectOrder({ ...selectedOrder, status: newStatus });
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="border-b border-orvix-border pb-6">
        <span className="font-mono text-xs uppercase tracking-widest text-orvix-crimson-bright">
          // PIPELINE DISPATCH CONTROLLER
        </span>
        <h1 className="mt-1 font-serif text-3xl font-bold text-white sm:text-4xl">
          Order Management
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Orders Table */}
        <div className="lg:col-span-7 border border-orvix-border bg-orvix-dark">
          <div className="border-b border-orvix-border p-4 font-mono text-xs text-zinc-400">
            TOTAL ACTIVE ORDERS: {orders.length}
          </div>
          <div className="divide-y divide-orvix-border/50 max-h-[700px] overflow-y-auto">
            {orders.map((ord) => (
              <div
                key={ord.id}
                onClick={() => handleSelectOrder(ord)}
                className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                  selectedOrder?.id === ord.id
                    ? 'border-l-4 border-orvix-crimson-bright bg-orvix-panel'
                    : 'hover:bg-orvix-panel/50'
                }`}
              >
                <div>
                  <span className="font-mono text-[10px] text-zinc-500 uppercase">
                    {new Date(ord.created_at).toLocaleDateString()} &bull; {ord.order_items?.length || 0} ITEMS
                  </span>
                  <p className="font-mono text-sm font-bold text-white">
                    {ord.order_number}
                  </p>
                  <p className="font-serif text-xs text-zinc-400">
                    {ord.customer_snapshot?.fullName || 'Anonymous Client'}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-mono text-sm font-bold text-white block">
                      ${Number(ord.total_amount).toFixed(2)}
                    </span>
                    <span className="font-mono text-[9px] uppercase px-2 py-0.5 border border-orvix-border bg-black text-orvix-crimson-bright">
                      {ord.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-zinc-500" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Order Inspector & Lifecycle Controller */}
        <div className="lg:col-span-5">
          {selectedOrder ? (
            <div className="border border-orvix-border bg-orvix-dark p-6 space-y-6 sticky top-28">

              <div className="border-b border-orvix-border pb-4">
                <span className="font-mono text-[10px] uppercase text-zinc-500">SELECTED MANIFEST</span>
                <h3 className="font-mono text-lg font-bold text-white">{selectedOrder.order_number}</h3>
                <p className="font-mono text-xs text-zinc-400 mt-1">
                  Recipient: {selectedOrder.customer_snapshot?.fullName} ({selectedOrder.customer_snapshot?.phone})
                </p>
              </div>

              {/* Status Update Actions */}
              <div className="space-y-2">
                <label className="font-mono text-xs text-zinc-400 uppercase">TRANSITION LIFECYCLE STAGE</label>
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  {STATUS_OPTIONS.map((statusKey) => (
                    <button
                      key={statusKey}
                      disabled={isUpdating || selectedOrder.status === statusKey}
                      onClick={() => handleUpdateStatus(statusKey)}
                      className={`border p-2 text-left uppercase transition-colors ${
                        selectedOrder.status === statusKey
                          ? 'border-orvix-crimson-bright bg-orvix-crimson text-white font-bold'
                          : 'border-orvix-border bg-orvix-panel text-zinc-400 hover:text-white'
                      }`}
                    >
                      {statusKey.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Items Manifest */}
              <div className="space-y-2">
                <span className="font-mono text-xs text-zinc-400 uppercase">BILL OF MATERIALS</span>
                <div className="border border-orvix-border bg-black/60 p-3 space-y-2 font-mono text-xs max-h-40 overflow-y-auto">
                  {selectedOrder.order_items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between border-b border-orvix-border/40 pb-1">
                      <span className="text-white truncate max-w-[200px]">{item.item_name} x{item.quantity}</span>
                      <span className="text-zinc-400">${Number(item.total_price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Audit Log Timeline */}
              <div className="space-y-2 border-t border-orvix-border pt-4">
                <span className="font-mono text-xs text-zinc-400 uppercase">AUDIT TRAIL ({auditLogs.length})</span>
                <div className="space-y-2 font-mono text-[10px] text-zinc-400 max-h-36 overflow-y-auto">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="border-l-2 border-orvix-crimson-bright pl-2 py-0.5">
                      <p className="text-white">
                        {log.old_status || 'INITIAL'} &rarr; <span className="text-orvix-crimson-bright">{log.new_status}</span>
                      </p>
                      <p className="text-zinc-600">{new Date(log.created_at).toLocaleTimeString()}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="border border-orvix-border bg-orvix-dark p-12 text-center font-mono text-xs text-zinc-500">
              Select an order from the pipeline to inspect or update telemetry.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
