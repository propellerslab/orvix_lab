// app/admin/invoices/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  FileText,
  Download,
  Printer,
  Plus,
  Trash2,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Loader2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { numberToNepaliRupeesWords } from '@/lib/number-to-words';

interface InvoiceItem {
  id: string;
  particulars: string;
  sku: string;
  quantity: number;
  rate: number;
  amount: number;
}

export default function AdminInvoicesPage() {
  const supabase = createClient();
  const printAreaRef = useRef<HTMLDivElement>(null);

  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Logo State
  const [logoUrl, setLogoUrl] = useState<string>('');

  // Editable Header Labels & Credentials
  const [invoiceType, setInvoiceType] = useState('TAX INVOICE');
  const [companyName, setCompanyName] = useState('ORVIX LAB PVT. LTD.');
  const [companyAddress, setCompanyAddress] = useState('Kathmandu, Bagmati Province, Nepal');
  const [companyPhone, setCompanyPhone] = useState('+977 9800000000');
  const [companyEmail, setCompanyEmail] = useState('engineering@orvixlab.com');
  const [companyPan, setCompanyPan] = useState('600000000');

  // Editable Invoice Metadata
  const [invoiceNumber, setInvoiceNumber] = useState(`OL-INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState('Bank Transfer / eSewa / Khalti');

  // Editable Buyer Credentials
  const [buyerName, setBuyerName] = useState('Individual Customer / Firm');
  const [buyerAddress, setBuyerAddress] = useState('Kathmandu, Nepal');
  const [buyerPan, setBuyerPan] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');

  // Items Table State
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: '1',
      particulars: 'Custom 3D Fabrication - ASA High Temp Prototype',
      sku: 'OX-3D-PRT',
      quantity: 1,
      rate: 4500,
      amount: 4500,
    },
  ]);

  // Tax & Financial Settings
  const [applyVat, setApplyVat] = useState(true);
  const [vatRate] = useState(13); // Nepal standard VAT = 13%
  const [discountAmount, setDiscountAmount] = useState(0);

  // Legal Policies & Warranty
  const [terms, setTerms] = useState(
    `1. Dimensional Tolerances: Fabricated parts strictly comply with ISO 2768-m (±0.05mm).\n` +
    `2. Quality Inspection: Discrepancies must be reported within 48 hours of courier delivery.\n` +
    `3. Custom Fabrication Policy: Bespoke additive manufactured items are non-refundable once sliced.\n` +
    `4. Settlement: Please route payments to Orvix Lab Pvt. Ltd. Bank A/C or authorized merchant ID.`
  );

  // Fetch orders for auto-population
  useEffect(() => {
    async function loadOrders() {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (data) setOrders(data);
    }
    loadOrders();
  }, [supabase]);

  // Auto-populate when an order is selected
  const handleSelectOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    const ord = orders.find((o) => o.id === orderId);
    if (!ord) return;

    const snap = ord.customer_snapshot || {};
    setBuyerName(snap.fullName || 'Valued Client');
    setBuyerAddress(
      [snap.street, snap.city, snap.state, snap.country].filter(Boolean).join(', ') || 'Nepal'
    );
    setBuyerPhone(snap.phone || '');
    setBuyerPan(snap.taxId || '');
    setInvoiceNumber(ord.order_number?.replace('ORD-', 'INV-') || invoiceNumber);

    if (ord.order_items && ord.order_items.length > 0) {
      const mappedItems: InvoiceItem[] = ord.order_items.map((it: any, idx: number) => ({
        id: it.id || String(idx + 1),
        particulars: it.item_name || 'Fabrication Item',
        sku: it.item_type?.toUpperCase() || 'OX-SPEC',
        quantity: it.quantity || 1,
        rate: Number(it.unit_price) || 0,
        amount: Number(it.total_price) || 0,
      }));
      setItems(mappedItems);
    }

    setDiscountAmount(Number(ord.discount_amount) || 0);
    setStatusMessage({ type: 'success', text: `Loaded Order: ${ord.order_number}` });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'rate') {
            updated.amount = (Number(updated.quantity) || 0) * (Number(updated.rate) || 0);
          }
          return updated;
        }
        return item;
      })
    );
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        particulars: 'New Fabrication Particular',
        sku: 'OX-SPEC',
        quantity: 1,
        rate: 1000,
        amount: 1000,
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Financial Calculations
  const grossSubtotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const taxableAmount = Math.max(0, grossSubtotal - discountAmount);
  const vatAmount = applyVat ? (taxableAmount * vatRate) / 100 : 0;
  const grandTotal = taxableAmount + vatAmount;
  const amountInWords = numberToNepaliRupeesWords(grandTotal);

  // Modern Client-Side PDF Generation using html-to-image (Supports Tailwind v4 & lab() colors)
  const handleDownloadPDF = async () => {
    if (!printAreaRef.current) return;
    setIsExporting(true);
    setStatusMessage(null);

    try {
      const { toPng } = await import('html-to-image');
      const { jsPDF } = await import('jspdf');

      // Convert to image without color parsing errors
      const dataUrl = await toPng(printAreaRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#FFFFFF',
      });

      // Exactly standard A4 dimensions (210mm x 297mm)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      pdf.addImage(dataUrl, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
      pdf.save(`${invoiceNumber}.pdf`);

      setStatusMessage({ type: 'success', text: `Downloaded 1-page A4 PDF: ${invoiceNumber}.pdf` });
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err: any) {
      console.error('PDF Generation Failure:', err);
      setStatusMessage({
        type: 'error',
        text: 'Canvas generation interrupted. Use the Print button to save as single-page PDF.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleNativePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const payload = {
      invoiceType,
      company: { name: companyName, address: companyAddress, phone: companyPhone, email: companyEmail, pan: companyPan },
      buyer: { name: buyerName, address: buyerAddress, phone: buyerPhone, pan: buyerPan },
      metadata: { invoiceNumber, invoiceDate, paymentMode },
      financials: { grossSubtotal, discountAmount, taxableAmount, vatAmount, grandTotal, amountInWords },
      items,
      terms,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoiceNumber}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">

      {/* Strict Print Stylesheet to guarantee exactly 1 single page */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0mm !important;
          }
          html, body {
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            overflow: hidden !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Hide all UI elements, layout bars, buttons */
          body * {
            visibility: hidden;
          }
          #single-page-invoice, #single-page-invoice * {
            visibility: visible;
          }
          #single-page-invoice {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            max-height: 297mm !important;
            margin: 0 !important;
            padding: 10mm 12mm !important;
            box-sizing: border-box !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            overflow: hidden !important;
          }
        }
      `}</style>

      {/* Top Action Telemetry & Control Bar */}
      <div className="border-b border-zinc-200 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 print:hidden">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#E20000]">
            // NEPAL IRD COMPLIANT &bull; SINGLE-PAGE A4 ENGINE
          </span>
          <h1 className="mt-1 font-serif text-3xl font-bold text-[#242424] sm:text-4xl">
            Invoice Studio
          </h1>
          <p className="mt-0.5 font-serif text-xs text-zinc-500">
            Generate, customize, and stream single-page A4 tax invoices with live Nepali Rupee calculations.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 border border-zinc-300 bg-white px-3 py-1.5 shadow-sm font-mono text-xs">
            <span className="text-zinc-500 uppercase text-[10px]">Populate:</span>
            <select
              value={selectedOrderId}
              onChange={(e) => handleSelectOrder(e.target.value)}
              className="bg-transparent font-bold text-[#002339] focus:outline-none"
            >
              <option value="">-- Choose Order --</option>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.order_number} ({o.customer_snapshot?.fullName || 'Client'})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 border border-zinc-300 bg-white px-3 py-2 font-mono text-xs text-zinc-700 hover:border-black transition-colors"
          >
            <FileCode className="h-4 w-4" />
            <span>JSON</span>
          </button>

          <button
            onClick={handleNativePrint}
            className="flex items-center gap-1.5 border border-zinc-300 bg-white px-3 py-2 font-mono text-xs text-zinc-700 hover:border-black transition-colors"
          >
            <Printer className="h-4 w-4" />
            <span>Print</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="flex items-center gap-2 border border-[#E20000] bg-[#E20000] px-4 py-2 font-mono text-xs uppercase font-bold text-white shadow-sm hover:bg-[#C50000] disabled:opacity-50 transition-all"
          >
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            <span>Download A4 PDF</span>
          </button>
        </div>
      </div>

      {/* Status Alert */}
      {statusMessage && (
        <div
          className={`flex items-center gap-2 border p-3 font-mono text-xs print:hidden ${
            statusMessage.type === 'success'
              ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
              : 'border-red-600 bg-red-50 text-red-800'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Configuration Switches */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-white border border-zinc-200 p-3.5 shadow-sm font-mono text-xs print:hidden">
        <div>
          <label className="text-[10px] text-zinc-500 uppercase block mb-1">INVOICE TITLE</label>
          <input
            type="text"
            value={invoiceType}
            onChange={(e) => setInvoiceType(e.target.value)}
            className="w-full border border-zinc-300 p-1 font-bold uppercase text-[#002339]"
          />
        </div>

        <div>
          <label className="text-[10px] text-zinc-500 uppercase block mb-1">TAX STATUS</label>
          <button
            onClick={() => setApplyVat(!applyVat)}
            className={`w-full py-1 border font-bold uppercase text-[11px] ${
              applyVat ? 'border-[#002339] bg-[#002339] text-white' : 'border-zinc-300 bg-zinc-100 text-zinc-600'
            }`}
          >
            {applyVat ? '13% VAT INCLUDED' : 'NON-VAT / PAN BILL'}
          </button>
        </div>

        <div>
          <label className="text-[10px] text-zinc-500 uppercase block mb-1">DISCOUNT DEDUCTION (RS.)</label>
          <input
            type="number"
            value={discountAmount}
            onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
            className="w-full border border-zinc-300 p-1 font-bold text-[#E20000]"
          />
        </div>

        <div>
          <label className="text-[10px] text-zinc-500 uppercase block mb-1">REPLACE LOGO</label>
          <label className="flex items-center justify-center gap-1.5 border border-dashed border-zinc-300 p-1 cursor-pointer hover:border-black text-zinc-600">
            <Upload className="h-3 w-3" />
            <span className="text-[10px] truncate">Upload Logo</span>
            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EXACT SINGLE-PAGE A4 SHEET (210mm x 297mm LOCKED) */}
      {/* ========================================================================= */}
      <div className="flex justify-center overflow-x-auto pb-12">
        <div
          id="single-page-invoice"
          ref={printAreaRef}
          className="w-[210mm] h-[297mm] max-h-[297mm] bg-white border border-zinc-300 shadow-xl p-[10mm] text-[#242424] flex flex-col justify-between overflow-hidden"
          style={{ boxSizing: 'border-box' }}
        >
          {/* Top Section */}
          <div className="space-y-4">

            {/* Header: Logo & Credentials */}
            <div className="flex justify-between items-start border-b-2 border-[#002339] pb-3">
              <div className="space-y-0.5 max-w-[62%]">
                {logoUrl ? (
                  <div className="relative h-12 w-40 mb-1">
                    <Image src={logoUrl} alt="Logo" fill className="object-contain object-left" />
                  </div>
                ) : (
                  <div className="flex flex-col mb-1">
                    <div className="flex items-baseline tracking-tight font-bold font-mono text-2xl leading-none">
                      <span className="text-[#E20000]">ORVI</span>
                      <span className="text-[#002339]">X</span>
                      <span className="ml-1 text-xs text-[#242424] font-normal lowercase">lab</span>
                    </div>
                    <div className="mt-0.5 h-[2px] w-20 bg-[#002339]" />
                  </div>
                )}

                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="font-serif text-base font-bold text-[#242424] w-full border-b border-transparent hover:border-zinc-300 focus:outline-none"
                />
                <input
                  type="text"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  className="text-[11px] text-zinc-600 w-full border-b border-transparent hover:border-zinc-300 focus:outline-none"
                />
                <div className="flex gap-4 text-[10px] text-zinc-600 font-mono">
                  <input
                    type="text"
                    value={`Tel: ${companyPhone}`}
                    onChange={(e) => setCompanyPhone(e.target.value.replace('Tel: ', ''))}
                    className="border-b border-transparent hover:border-zinc-300 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={`Email: ${companyEmail}`}
                    onChange={(e) => setCompanyEmail(e.target.value.replace('Email: ', ''))}
                    className="border-b border-transparent hover:border-zinc-300 focus:outline-none"
                  />
                </div>
              </div>

              {/* Document Title & PAN */}
              <div className="text-right space-y-1">
                <input
                  type="text"
                  value={invoiceType}
                  onChange={(e) => setInvoiceType(e.target.value)}
                  className="font-mono text-lg font-bold uppercase text-[#E20000] text-right border-b border-transparent hover:border-zinc-300 focus:outline-none"
                />
                <div className="border border-[#002339] bg-[#002339]/5 px-2.5 py-0.5 font-mono text-xs inline-block text-right">
                  <span className="text-zinc-500 uppercase text-[8px] block">SELLER PAN / VAT:</span>
                  <input
                    type="text"
                    value={companyPan}
                    onChange={(e) => setCompanyPan(e.target.value)}
                    className="font-bold text-[#002339] text-right w-24 bg-transparent focus:outline-none text-[11px]"
                  />
                </div>
              </div>
            </div>

            {/* Buyer & Invoice Meta */}
            <div className="grid grid-cols-2 gap-4 border-b border-zinc-200 pb-3 font-mono text-xs">
              <div className="space-y-1">
                <span className="text-[9px] text-zinc-400 uppercase tracking-widest block font-bold">
                  BILLED TO (BUYER DETAILS):
                </span>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="font-bold text-[#242424] w-full text-xs border-b border-transparent hover:border-zinc-300 focus:outline-none"
                />
                <input
                  type="text"
                  value={buyerAddress}
                  onChange={(e) => setBuyerAddress(e.target.value)}
                  className="text-[11px] text-zinc-600 w-full border-b border-transparent hover:border-zinc-300 focus:outline-none"
                />
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <input
                    type="text"
                    placeholder="Buyer PAN/VAT"
                    value={buyerPan}
                    onChange={(e) => setBuyerPan(e.target.value)}
                    className="text-zinc-700 border-b border-transparent hover:border-zinc-300 focus:outline-none font-bold"
                  />
                  <input
                    type="text"
                    placeholder="Contact No"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    className="text-zinc-700 border-b border-transparent hover:border-zinc-300 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1 text-right text-[11px]">
                <div>
                  <span className="text-[8px] text-zinc-400 uppercase block">INVOICE NUMBER:</span>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="font-bold text-[#242424] text-xs text-right border-b border-transparent hover:border-zinc-300 focus:outline-none"
                  />
                </div>
                <div>
                  <span className="text-[8px] text-zinc-400 uppercase block">DATE (AD / BS):</span>
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="font-bold text-zinc-700 text-right border-b border-transparent hover:border-zinc-300 focus:outline-none"
                  />
                </div>
                <div>
                  <span className="text-[8px] text-zinc-400 uppercase block">PAYMENT MODE:</span>
                  <input
                    type="text"
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="text-zinc-700 text-right border-b border-transparent hover:border-zinc-300 focus:outline-none text-[10px]"
                  />
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div>
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-y-2 border-[#002339] text-[#002339] uppercase text-[9px]">
                    <th className="py-1.5 px-1.5 w-8 text-center">S.N.</th>
                    <th className="py-1.5 px-2">Description &bull; Particulars</th>
                    <th className="py-1.5 px-2 w-24">SKU/HSN</th>
                    <th className="py-1.5 px-1.5 w-12 text-center">Qty</th>
                    <th className="py-1.5 px-2 w-20 text-right">Rate</th>
                    <th className="py-1.5 px-2 w-24 text-right">Total (Rs.)</th>
                    <th className="py-1.5 px-1 w-6 text-center print:hidden"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {items.map((item, idx) => (
                    <tr key={item.id} className="text-[11px]">
                      <td className="py-1.5 px-1 text-center text-zinc-500">{idx + 1}</td>
                      <td className="py-1.5 px-2">
                        <input
                          type="text"
                          value={item.particulars}
                          onChange={(e) => handleItemChange(item.id, 'particulars', e.target.value)}
                          className="w-full font-serif font-semibold text-[#242424] bg-transparent border-b border-transparent hover:border-zinc-300 focus:outline-none"
                        />
                      </td>
                      <td className="py-1.5 px-2">
                        <input
                          type="text"
                          value={item.sku}
                          onChange={(e) => handleItemChange(item.id, 'sku', e.target.value)}
                          className="w-full text-zinc-600 bg-transparent border-b border-transparent hover:border-zinc-300 focus:outline-none text-[10px]"
                        />
                      </td>
                      <td className="py-1.5 px-1 text-center">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                          className="w-10 text-center font-bold text-[#242424] bg-transparent border-b border-transparent hover:border-zinc-300 focus:outline-none"
                        />
                      </td>
                      <td className="py-1.5 px-2 text-right">
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) => handleItemChange(item.id, 'rate', Number(e.target.value))}
                          className="w-16 text-right font-bold text-[#242424] bg-transparent border-b border-transparent hover:border-zinc-300 focus:outline-none"
                        />
                      </td>
                      <td className="py-1.5 px-2 text-right font-bold text-[#002339]">
                        {item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-1.5 px-1 text-center print:hidden">
                        <button onClick={() => handleRemoveItem(item.id)} className="text-zinc-400 hover:text-red-600">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pt-1 print:hidden">
                <button
                  onClick={handleAddItem}
                  className="flex items-center gap-1 font-mono text-[10px] text-[#002339] hover:text-[#E20000] font-bold"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Line Item</span>
                </button>
              </div>
            </div>

            {/* Calculations & Words */}
            <div className="grid grid-cols-12 gap-4 border-t-2 border-[#002339] pt-3 font-mono text-xs">
              <div className="col-span-7 space-y-2">
                <div className="border border-zinc-200 bg-[#FAFAFA] p-2">
                  <span className="text-[8px] text-zinc-400 uppercase tracking-widest block font-bold">
                    AMOUNT IN WORDS (NPR):
                  </span>
                  <p className="font-serif text-xs font-bold text-[#242424] leading-tight">
                    {amountInWords}
                  </p>
                </div>
                <p className="text-[9px] text-zinc-500 leading-tight">
                  Official commercial invoice for custom physical computing and 3D fabrication services.
                </p>
              </div>

              <div className="col-span-5 space-y-1 border-l border-zinc-200 pl-3 text-[11px]">
                <div className="flex justify-between text-zinc-600">
                  <span>Gross Subtotal:</span>
                  <span className="font-bold text-[#242424]">
                    Rs. {grossSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#E20000]">
                    <span>Discount:</span>
                    <span>- Rs. {discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                <div className="flex justify-between text-zinc-600 border-t border-zinc-200 pt-0.5">
                  <span>Taxable Base:</span>
                  <span className="font-bold text-[#242424]">
                    Rs. {taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {applyVat ? (
                  <div className="flex justify-between text-zinc-600">
                    <span>VAT (13%):</span>
                    <span className="font-bold text-[#242424]">
                      Rs. {vatAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-between text-zinc-400 italic text-[9px]">
                    <span>Non-VAT / Exempt:</span>
                    <span>Rs. 0.00</span>
                  </div>
                )}

                <div className="flex justify-between text-sm font-bold text-[#002339] border-t-2 border-[#002339] pt-1">
                  <span>Grand Total:</span>
                  <span className="text-[#E20000]">
                    Rs. {grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Section: Terms & Signatures (Anchored inside 297mm) */}
          <div className="space-y-4 pt-3 border-t border-zinc-200 font-mono text-[9px]">
            <div>
              <span className="text-[8px] text-zinc-400 uppercase tracking-widest block font-bold mb-0.5">
                TERMS &amp; CONDITIONS / FABRICATION POLICY:
              </span>
              <textarea
                rows={3}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                className="w-full text-zinc-600 bg-transparent border border-transparent hover:border-zinc-300 focus:outline-none leading-relaxed p-0.5"
              />
            </div>

            <div className="flex justify-between items-end pt-4 pb-1">
              <div className="text-center w-40 border-t border-zinc-400 pt-0.5">
                <span className="text-[9px] text-zinc-500 uppercase block">Customer Acceptance</span>
                <span className="text-[8px] text-zinc-400">Signature &bull; Stamp</span>
              </div>

              <div className="text-center w-40 border-t-2 border-[#002339] pt-0.5">
                <span className="text-[9px] font-bold text-[#002339] uppercase block">
                  For Orvix Lab Pvt. Ltd.
                </span>
                <span className="text-[8px] text-zinc-400">Authorized Signatory</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
