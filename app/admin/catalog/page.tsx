// app/admin/catalog/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Layers,
  Box,
  Plus,
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AdminCatalogPage() {
  const supabase = createClient();
  const [tab, setTab] = useState<'products' | 'filaments'>('products');
  const [products, setProducts] = useState<any[]>([]);
  const [filaments, setFilaments] = useState<any[]>([]);
  const [bulkInput, setBulkInput] = useState('');
  const [bulkMessage, setBulkMessage] = useState<string | null>(null);

  // Single Item Creation Form State
  const [newProduct, setNewProduct] = useState({
    sku: '',
    name: '',
    slug: '',
    base_price: '',
    stock_quantity: '',
  });

  const fetchData = async () => {
    const [{ data: prods }, { data: fils }] = await Promise.all([
      supabase.from('products').select('*').is('deleted_at', null).order('created_at', { ascending: false }),
      supabase.from('filaments').select('*').is('deleted_at', null).order('created_at', { ascending: false }),
    ]);
    if (prods) setProducts(prods);
    if (fils) setFilaments(fils);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Bulk JSON Upload
  const handleBulkUpload = async () => {
    try {
      const parsed = JSON.parse(bulkInput);
      if (!Array.isArray(parsed)) throw new Error('Data payload must be a JSON array of objects.');

      if (tab === 'products') {
        const { error } = await supabase.from('products').insert(parsed);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('filaments').insert(parsed);
        if (error) throw error;
      }

      setBulkMessage(`Successfully ingested ${parsed.length} entries into ${tab} registry.`);
      setBulkInput('');
      fetchData();
    } catch (err: any) {
      alert(`Bulk ingestion failed: ${err.message}`);
    }
  };

  const handleCreateSingleProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('products').insert({
        sku: newProduct.sku,
        name: newProduct.name,
        slug: newProduct.slug,
        base_price: parseFloat(newProduct.base_price),
        stock_quantity: parseInt(newProduct.stock_quantity),
        images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'],
      });

      if (error) throw error;
      setNewProduct({ sku: '', name: '', slug: '', base_price: '', stock_quantity: '' });
      fetchData();
    } catch (err: any) {
      alert(`Error creating product: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="border-b border-orvix-border pb-6 flex items-center justify-between">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-orvix-crimson-bright">
            // PHYSICAL INVENTORY DISPATCH
          </span>
          <h1 className="mt-1 font-serif text-3xl font-bold text-white sm:text-4xl">
            Catalog &amp; Hardware Depot
          </h1>
        </div>

        {/* Tab Switcher */}
        <div className="flex border border-orvix-border bg-orvix-dark">
          <button
            onClick={() => setTab('products')}
            className={`flex items-center gap-2 px-4 py-2 font-mono text-xs uppercase transition-colors ${
              tab === 'products' ? 'bg-orvix-crimson text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Box className="h-4 w-4" />
            <span>Built Products</span>
          </button>
          <button
            onClick={() => setTab('filaments')}
            className={`flex items-center gap-2 px-4 py-2 font-mono text-xs uppercase transition-colors ${
              tab === 'filaments' ? 'bg-orvix-crimson text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>B2B Filaments</span>
          </button>
        </div>
      </div>

      {/* Bulk Upload Section */}
      <div className="border border-orvix-border bg-orvix-dark p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-white">
            <FileSpreadsheet className="h-4 w-4 text-orvix-crimson-bright" />
            <span>BULK INGESTION MATRIX (JSON ARRAY)</span>
          </div>
          <span className="font-mono text-[10px] text-zinc-500 uppercase">Target: {tab.toUpperCase()}</span>
        </div>

        {bulkMessage && (
          <div className="flex items-center gap-2 border border-emerald-800 bg-emerald-950/30 p-3 font-mono text-xs text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <span>{bulkMessage}</span>
          </div>
        )}

        <textarea
          rows={3}
          value={bulkInput}
          onChange={(e) => setBulkInput(e.target.value)}
          placeholder={`[{"sku": "OX-TEST-01", "name": "Custom Arm", "slug": "custom-arm", "base_price": 120.0, "stock_quantity": 10}]`}
          className="w-full border border-orvix-border bg-black p-3 font-mono text-xs text-white focus:border-orvix-crimson-bright focus:outline-none"
        />

        <button
          onClick={handleBulkUpload}
          disabled={!bulkInput.trim()}
          className="flex items-center gap-2 border border-orvix-border bg-orvix-panel px-4 py-2 font-mono text-xs uppercase tracking-wider text-white hover:border-orvix-crimson-bright disabled:opacity-40 transition-colors"
        >
          <UploadCloud className="h-4 w-4 text-orvix-crimson-bright" />
          <span>Execute Bulk Upload</span>
        </button>
      </div>

      {/* Inventory Table */}
      <div className="border border-orvix-border bg-orvix-dark">
        <div className="border-b border-orvix-border p-4 font-mono text-xs text-zinc-400">
          REGISTERED {tab.toUpperCase()} COUNT: {tab === 'products' ? products.length : filaments.length}
        </div>

        <div className="divide-y divide-orvix-border/50">
          {(tab === 'products' ? products : filaments).map((item) => (
            <div key={item.id} className="p-4 flex items-center justify-between font-mono text-xs">
              <div>
                <p className="font-bold text-white text-sm">{item.name}</p>
                <p className="text-[10px] text-zinc-500">
                  SKU: {item.sku} &bull; SLUG: {item.slug}
                </p>
              </div>

              <div className="flex items-center gap-6">
                <span className="text-zinc-300">
                  STOCK: <strong className="text-white">{item.stock_quantity ?? item.stock_spools}</strong>
                </span>
                <span className="font-bold text-orvix-crimson-bright">
                  ${(item.base_price ?? item.retail_price)?.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
