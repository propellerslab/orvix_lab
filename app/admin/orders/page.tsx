// app/admin/orders/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ClipboardList,
  Layers,
  FileCode,
  ExternalLink,
  Download,
  Send,
  CheckCircle2,
  Clock,
  ChevronRight,
  User,
  Phone,
  Mail,
  DollarSign,
  AlertCircle,
  FileText,
  MapPin,
  MessageSquare,
  Shield,
  Loader2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AdminOrdersPage() {
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<'custom_requests' | 'standard_orders'>('custom_requests');

  // Custom Requests State
  const [customRequests, setCustomRequests] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [quotePrice, setQuotePrice] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [isQuoting, setIsQuoting] = useState<boolean>(false);
  const [quoteSuccess, setQuoteSuccess] = useState<boolean>(false);

  // Standard Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  const [loading, setLoading] = useState(true);

  // Fetch both pipelines
  const fetchData = async () => {
    setLoading(true);
    try {
      const [{ data: reqs }, { data: ords }] = await Promise.all([
        supabase
          .from('custom_requests')
          .select('*')
          .is('deleted_at', null)
          .order('created_at', { ascending: false }),
        supabase
          .from('orders')
          .select('*, order_items(*)')
          .is('deleted_at', null)
          .order('created_at', { ascending: false }),
      ]);

      if (reqs) setCustomRequests(reqs);
      if (ords) setOrders(ords);

      // Default selection if available
      if (reqs && reqs.length > 0 && !selectedRequest) {
        setSelectedRequest(reqs[0]);
        setQuotePrice(reqs[0].quoted_price ? String(reqs[0].quoted_price) : '');
        setAdminNotes(reqs[0].admin_notes || '');
      }
    } catch (err) {
      console.error('Failed to load orders/requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Sync state when selecting a request
  const handleSelectRequest = (req: any) => {
    setSelectedRequest(req);
    setQuotePrice(req.quoted_price ? String(req.quoted_price) : '');
    setAdminNotes(req.admin_notes || '');
    setQuoteSuccess(false);
  };

  // Sync state when selecting an order
  const handleSelectOrder = async (ord: any) => {
    setSelectedOrder(ord);
    const { data: logs } = await supabase
      .from('order_status_audit_logs')
      .select('*')
      .eq('order_id', ord.id)
      .order('created_at', { ascending: false });
    setAuditLogs(logs || []);
  };

  // Handle saving and committing the quote
  const handleSaveQuote = async (status: string = 'quoted') => {
    if (!selectedRequest) return;
    setIsQuoting(true);
    setQuoteSuccess(false);

    try {
      const priceNum = quotePrice ? parseFloat(quotePrice) : null;

      const { error } = await supabase
        .from('custom_requests')
        .update({
          quoted_price: priceNum,
          admin_notes: adminNotes,
          status: status,
        })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      setQuoteSuccess(true);
      fetchData();
    } catch (err: any) {
      alert(`Failed to save quote: ${err.message}`);
    } finally {
      setIsQuoting(false);
    }
  };

  // Dispatch Quote to WhatsApp
  const handleDispatchWhatsAppQuote = () => {
    if (!selectedRequest) return;
    const cleanPhone = (selectedRequest.contact_phone || '').replace(/[^0-9]/g, '');

    const message = `*ORVIX LAB // BESPOKE FABRICATION QUOTATION*
====================================
*PROJECT:* ${selectedRequest.project_title}
*CLIENT:* ${selectedRequest.contact_name}
*REFERENCE ID:* \`${selectedRequest.id.substring(0, 8).toUpperCase()}\`

*ENGINEERING PARAMETERS:*
• *Target Material:* ${selectedRequest.target_material || 'Engineer Select'}
• *Batch Volume:* ${selectedRequest.target_quantity} units
• *Estimated Client Budget:* ${selectedRequest.estimated_budget ? `$${selectedRequest.estimated_budget} USD` : 'Open'}

*FORMAL LABORATORY QUOTE:*
• *Total Quoted Fabrication:* *$${quotePrice || '0.00'} USD*
${adminNotes ? `• *Lead Time / Technical Notes:* _${adminNotes}_\n` : ''}
====================================
_Please reply to this transmission to authorize G-code generation and reserve production scheduling._`;

    // Save as quoted first
    handleSaveQuote('quoted');

    // Open WhatsApp
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Update Standard Order Status
  const handleUpdateOrderStatus = async (newStatus: string) => {
    if (!selectedOrder) return;
    setIsUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', selectedOrder.id);

      if (error) throw error;

      fetchData();
      handleSelectOrder({ ...selectedOrder, status: newStatus });
    } catch (err: any) {
      alert(`Status transition failed: ${err.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-zinc-200 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#E20000]">
            // MANUFACTURING &amp; QUOTATION PIPELINE
          </span>
          <h1 className="mt-1 font-serif text-3xl font-bold text-[#242424] sm:text-4xl">
            Order &amp; Quote Dispatch
          </h1>
          <p className="mt-1 font-serif text-xs text-zinc-500">
            Inspect CAD geometry, analyze Pinterest moodboards, transmit formal quotations, and track production.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border border-zinc-200 bg-white shadow-sm font-mono text-xs">
          <button
            onClick={() => setActiveTab('custom_requests')}
            className={`flex items-center gap-2 px-4 py-2.5 uppercase font-bold transition-colors ${
              activeTab === 'custom_requests'
                ? 'bg-[#E20000] text-white'
                : 'text-zinc-600 hover:text-black'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Custom CAD Requests ({customRequests.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('standard_orders')}
            className={`flex items-center gap-2 px-4 py-2.5 uppercase font-bold transition-colors ${
              activeTab === 'standard_orders'
                ? 'bg-[#002339] text-white'
                : 'text-zinc-600 hover:text-black'
            }`}
          >
            <ClipboardList className="h-4 w-4" />
            <span>Commercial Orders ({orders.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: BESPOKE CUSTOM CAD REQUESTS (INSPECTION & QUOTE BUILDER) */}
      {/* ========================================================================= */}
      {activeTab === 'custom_requests' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Requests List Column */}
          <div className="lg:col-span-5 border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-200 p-4 font-mono text-xs text-zinc-500 flex justify-between">
              <span>ACTIVE CAD INTAKE QUEUE</span>
              <span>{customRequests.filter((r) => r.status === 'pending_review').length} Awaiting Quote</span>
            </div>

            {loading ? (
              <div className="p-12 text-center font-mono text-xs text-zinc-400">Loading CAD queue...</div>
            ) : customRequests.length === 0 ? (
              <div className="p-12 text-center font-mono text-xs text-zinc-400">No bespoke requests logged yet.</div>
            ) : (
              <div className="divide-y divide-zinc-100 max-h-[750px] overflow-y-auto">
                {customRequests.map((req) => {
                  const isSelected = selectedRequest?.id === req.id;
                  const isPending = req.status === 'pending_review';

                  return (
                    <div
                      key={req.id}
                      onClick={() => handleSelectRequest(req)}
                      className={`p-4 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-l-4 border-[#E20000] bg-zinc-50'
                          : 'hover:bg-zinc-50/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-mono text-[10px] text-zinc-400 uppercase">
                          {new Date(req.created_at).toLocaleDateString()} &bull; QTY: {req.target_quantity}
                        </span>
                        <span
                          className={`px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider border ${
                            isPending
                              ? 'border-[#E20000] bg-[#E20000]/10 text-[#E20000]'
                              : req.status === 'quoted'
                              ? 'border-[#002339] bg-[#002339]/10 text-[#002339]'
                              : 'border-zinc-200 bg-zinc-100 text-zinc-600'
                          }`}
                        >
                          {req.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <h3 className="font-serif text-sm font-bold text-[#242424] mt-1 truncate">
                        {req.project_title}
                      </h3>

                      <div className="mt-2 flex items-center justify-between font-mono text-xs">
                        <span className="text-zinc-500">{req.contact_name}</span>
                        {req.quoted_price ? (
                          <span className="font-bold text-[#002339]">${req.quoted_price.toFixed(2)}</span>
                        ) : req.estimated_budget ? (
                          <span className="text-zinc-400">Est: ${req.estimated_budget}</span>
                        ) : (
                          <span className="text-[#E20000] font-bold text-[10px]">NEEDS QUOTE</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Request Dossier & Formal Quotation Stage */}
          <div className="lg:col-span-7">
            {selectedRequest ? (
              <div className="border border-zinc-200 bg-white p-6 shadow-sm space-y-6 sticky top-28">

                {/* Dossier Header */}
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-200 pb-4">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#E20000]">
                      PROJECT DOSSIER: #{selectedRequest.id.substring(0, 8).toUpperCase()}
                    </span>
                    <h2 className="font-serif text-2xl font-bold text-[#242424] mt-1">
                      {selectedRequest.project_title}
                    </h2>
                    <span className="font-mono text-xs text-zinc-500">
                      Logged: {new Date(selectedRequest.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-[10px] text-zinc-400 uppercase block">CURRENT STATUS</span>
                    <span className="inline-block mt-1 px-2.5 py-0.5 font-bold uppercase text-xs border border-[#002339] bg-[#002339]/5 text-[#002339]">
                      {selectedRequest.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Client Contact Credentials */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border border-zinc-200 bg-[#FAFAFA] p-3 font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-[#002339] shrink-0" />
                    <span className="truncate font-bold text-[#242424]">{selectedRequest.contact_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-zinc-400 shrink-0" />
                    <a href={`mailto:${selectedRequest.contact_email}`} className="truncate hover:underline text-zinc-600">
                      {selectedRequest.contact_email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-emerald-600 shrink-0" />
                    <a href={`https://wa.me/${selectedRequest.contact_phone?.replace(/[^0-9]/g, '')}`} target="_blank" className="font-bold text-emerald-700 hover:underline">
                      {selectedRequest.contact_phone}
                    </a>
                  </div>
                </div>

                {/* Engineering Scope & Physical Constraints */}
                <div className="space-y-3 font-mono text-xs">
                  <div className="grid grid-cols-3 gap-3 border-b border-zinc-100 pb-3">
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase block">TARGET MATERIAL</span>
                      <span className="font-bold text-[#242424]">{selectedRequest.target_material || 'Open Recommendation'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase block">UNITS REQUIRED</span>
                      <span className="font-bold text-[#242424]">{selectedRequest.target_quantity} pcs</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase block">ESTIMATED BUDGET</span>
                      <span className="font-bold text-[#E20000]">
                        {selectedRequest.estimated_budget ? `${selectedRequest.estimated_budget} NPR` : 'Not Specified'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase block mb-1">ENGINEERING SCOPE &amp; NOTES</span>
                    <p className="font-serif text-sm text-[#242424] bg-[#FAFAFA] border border-zinc-200 p-3 leading-relaxed">
                      {selectedRequest.description}
                    </p>
                  </div>
                </div>

                {/* Inspiration References (Pinterest / URLs) */}
                <div className="space-y-2 border-t border-zinc-200 pt-4">
                  <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block">
                    INSPIRATION MOODBOARDS &amp; URL REFERENCES ({selectedRequest.inspiration_urls?.length || 0})
                  </span>

                  {!selectedRequest.inspiration_urls || selectedRequest.inspiration_urls.length === 0 ? (
                    <p className="font-mono text-xs text-zinc-400 italic">No external web references provided.</p>
                  ) : (
                    <div className="space-y-1.5 font-mono text-xs">
                      {selectedRequest.inspiration_urls.map((url: string, idx: number) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between border border-zinc-200 bg-[#FAFAFA] p-2 hover:border-[#002339] text-[#002339] transition-colors"
                        >
                          <span className="truncate max-w-md">{url}</span>
                          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Uploaded CAD Files (STL, STEP, OBJ, ZIP) */}
                <div className="space-y-2 border-t border-zinc-200 pt-4">
                  <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block">
                    TRANSMITTED CAD ASSETS &amp; SCHEMATICS ({selectedRequest.file_urls?.length || 0})
                  </span>

                  {!selectedRequest.file_urls || selectedRequest.file_urls.length === 0 ? (
                    <p className="font-mono text-xs text-zinc-400 italic">No CAD files were attached.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
                      {selectedRequest.file_urls.map((fileUrl: string, idx: number) => {
                        const filename = fileUrl.split('/').pop() || `Asset-${idx + 1}`;
                        const ext = filename.split('.').pop()?.toUpperCase() || 'FILE';

                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between border border-zinc-200 bg-white p-2.5 shadow-sm"
                          >
                            <div className="flex items-center gap-2 truncate pr-2">
                              <span className="border border-[#002339] bg-[#002339]/10 px-1.5 py-0.5 text-[9px] font-bold text-[#002339]">
                                {ext}
                              </span>
                              <span className="truncate text-zinc-700">{filename}</span>
                            </div>

                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                              className="flex items-center gap-1 border border-zinc-300 bg-zinc-50 px-2 py-1 text-[10px] uppercase font-bold text-zinc-700 hover:bg-[#002339] hover:text-white transition-colors shrink-0"
                            >
                              <Download className="h-3 w-3" />
                              <span>Inspect</span>
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Formal Quotation Engine */}
                <div className="border border-[#002339]/30 bg-[#FAFAFA] p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs uppercase font-bold text-[#002339] flex items-center gap-1.5">

                      <span>COMMERCIAL QUOTATION ENGINE</span>
                    </span>
                    {quoteSuccess && (
                      <span className="font-mono text-xs text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Quote Committed</span>
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                    <div>
                      <label className="text-[10px] text-zinc-500 uppercase block mb-1">
                        FINAL QUOTED PRICE (NPR) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={quotePrice}
                        onChange={(e) => setQuotePrice(e.target.value)}
                        placeholder="e.g. 185.00"
                        className="w-full border border-zinc-300 bg-white p-2 font-bold text-[#242424] focus:border-[#E20000] focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-zinc-500 uppercase block mb-1">
                        LEAD TIME, TOLERANCE &amp; SLICING NOTES
                      </label>
                      <input
                        type="text"
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="e.g. 48h print cycle, 0.12mm layer height, ASA Crimson..."
                        className="w-full border border-zinc-300 bg-white p-2 text-[#242424] focus:border-[#E20000] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      onClick={() => handleSaveQuote('quoted')}
                      disabled={isQuoting || !quotePrice}
                      className="flex-1 flex items-center justify-center gap-2 border border-zinc-300 bg-white py-2.5 font-mono text-xs uppercase font-bold text-zinc-700 hover:border-black disabled:opacity-50 transition-colors"
                    >
                      {isQuoting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      <span>Save Quote in Database</span>
                    </button>

                    <button
                      onClick={handleDispatchWhatsAppQuote}
                      disabled={!quotePrice}
                      className="flex-1 flex items-center justify-center gap-2 border border-emerald-600 bg-emerald-600 py-2.5 font-mono text-xs uppercase font-bold text-white hover:bg-emerald-500 shadow-sm disabled:opacity-50 transition-colors"
                    >
                      <Send className="h-4 w-4" />
                      <span>Transmit Quote via WhatsApp</span>
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="border border-zinc-200 bg-white p-12 text-center font-mono text-xs text-zinc-400 shadow-sm">
                Select a bespoke CAD request from the list to inspect specs and issue a quotation.
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: COMMERCIAL CATALOG ORDERS (DISPATCHES & AUDIT) */}
      {/* ========================================================================= */}
      {activeTab === 'standard_orders' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Orders List */}
          <div className="lg:col-span-5 border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-200 p-4 font-mono text-xs text-zinc-500 flex justify-between">
              <span>ACTIVE COMMERCIAL ORDERS ({orders.length})</span>
              <span>RLS VERIFIED</span>
            </div>

            <div className="divide-y divide-zinc-100 max-h-[750px] overflow-y-auto">
              {orders.map((ord) => {
                const isSelected = selectedOrder?.id === ord.id;
                return (
                  <div
                    key={ord.id}
                    onClick={() => handleSelectOrder(ord)}
                    className={`p-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-l-4 border-[#002339] bg-zinc-50'
                        : 'hover:bg-zinc-50/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-zinc-400 uppercase">
                        {new Date(ord.created_at).toLocaleDateString()} &bull; {ord.order_items?.length || 0} ITEMS
                      </span>
                      <span className="font-mono text-[9px] uppercase px-2 py-0.5 border border-zinc-200 bg-white font-bold text-orvix-navy">
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <p className="font-mono text-sm font-bold text-[#242424] mt-1">
                      {ord.order_number}
                    </p>
                    <p className="font-serif text-xs text-zinc-500">
                      {ord.customer_snapshot?.fullName || 'Anonymous Client'}
                    </p>

                    <div className="mt-2 flex justify-between items-baseline font-mono text-xs">
                      <span className="text-zinc-400">{ord.customer_snapshot?.phone || 'No phone'}</span>
                      <span className="font-bold text-[#E20000]">Rs.{Number(ord.total_amount).toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Details & Lifecycle Controller */}
          <div className="lg:col-span-7">
            {selectedOrder ? (
              <div className="border border-zinc-200 bg-white p-6 shadow-sm space-y-6 sticky top-28">

                {/* Header */}
                <div className="flex justify-between items-start border-b border-zinc-200 pb-4">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#002339]">
                      COMMERCIAL DISPATCH MANIFEST
                    </span>
                    <h2 className="font-mono text-2xl font-bold text-[#242424]">
                      {selectedOrder.order_number}
                    </h2>
                    <p className="font-mono text-xs text-zinc-500">
                      Submitted: {new Date(selectedOrder.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-[10px] text-zinc-400 uppercase block">ORDER TOTAL</span>
                    <span className="text-2xl font-bold text-[#E20000]">
                      Rs.{Number(selectedOrder.total_amount).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Customer Snapshot & Address */}
                <div className="border border-zinc-200 bg-[#FAFAFA] p-4 font-mono text-xs space-y-2">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-widest block border-b border-zinc-200 pb-1">
                    CLIENT LOGISTICS &amp; DESTINATION
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-zinc-600">
                    <div>
                      <span className="text-zinc-400 block text-[10px]">CLIENT:</span>
                      <strong className="text-[#242424]">{selectedOrder.customer_snapshot?.fullName}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[10px]">CONTACT:</span>
                      <span>{selectedOrder.customer_snapshot?.phone}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-zinc-400 block text-[10px]">DELIVERY ADDRESS:</span>
                      <span className="text-[#242424]">
                        {selectedOrder.customer_snapshot?.street}, {selectedOrder.customer_snapshot?.city},{' '}
                        {selectedOrder.customer_snapshot?.state} {selectedOrder.customer_snapshot?.postalCode},{' '}
                        {selectedOrder.customer_snapshot?.country}
                      </span>
                    </div>
                    {selectedOrder.customer_snapshot?.notes && (
                      <div className="col-span-2 bg-white p-2 border border-zinc-200 mt-1">
                        <span className="text-[#E20000] font-bold text-[10px] block">CLIENT NOTES:</span>
                        <span className="italic">{selectedOrder.customer_snapshot.notes}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Transition Lifecycle */}
                <div className="space-y-2">
                  <label className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block">
                    TRANSITION ORDER LIFECYCLE (TRIGGERS DB AUDIT LOG)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[10px]">
                    {[
                      'submitted_whatsapp',
                      'confirmed',
                      'in_production',
                      'ready_for_shipping',
                      'shipped',
                      'delivered',
                      'cancelled',
                    ].map((st) => (
                      <button
                        key={st}
                        disabled={isUpdatingStatus || selectedOrder.status === st}
                        onClick={() => handleUpdateOrderStatus(st)}
                        className={`border p-2 text-center uppercase font-bold transition-colors ${
                          selectedOrder.status === st
                            ? 'border-[#002339] bg-[#002339] text-white'
                            : 'border-zinc-200 bg-white text-zinc-600 hover:border-black'
                        }`}
                      >
                        {st.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Itemized Manifest */}
                <div className="space-y-2 border-t border-zinc-200 pt-4">
                  <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block">
                    FABRICATED LINE ITEMS ({selectedOrder.order_items?.length || 0})
                  </span>
                  <div className="space-y-2 font-mono text-xs max-h-48 overflow-y-auto">
                    {selectedOrder.order_items?.map((item: any) => (
                      <div key={item.id} className="border border-zinc-200 bg-white p-3 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-[#242424]">{item.item_name}</p>
                          <p className="text-[10px] text-zinc-400">
                            Qty: {item.quantity} &bull; Unit: ${Number(item.unit_price).toFixed(2)}
                          </p>
                          {item.configuration && Object.keys(item.configuration).length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {Object.entries(item.configuration).map(([k, v]) => (
                                <span key={k} className="border border-zinc-200 bg-zinc-50 px-1.5 py-0.2 text-[9px] text-zinc-600">
                                  {k}: {String(v)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className="font-bold text-[#002339]">Rs.{Number(item.total_price).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Audit Trail History */}
                <div className="space-y-2 border-t border-zinc-200 pt-4">
                  <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block">
                    IMMUTABLE AUDIT TRAIL ({auditLogs.length})
                  </span>
                  <div className="space-y-1.5 font-mono text-[10px] text-zinc-600 max-h-32 overflow-y-auto">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="border-l-2 border-[#E20000] pl-2 py-0.5">
                        <span className="font-bold text-[#242424]">{log.old_status || 'INITIAL'}</span> &rarr;{' '}
                        <span className="font-bold text-[#002339]">{log.new_status}</span> &bull;{' '}
                        <span className="text-zinc-400">{new Date(log.created_at).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="border border-zinc-200 bg-white p-12 text-center font-mono text-xs text-zinc-400 shadow-sm">
                Select a commercial catalog order to review logistics and manage status transitions.
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
