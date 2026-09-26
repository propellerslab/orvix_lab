// app/admin/marketing/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Tag, Image as ImageIcon, Plus, Percent } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AdminMarketingPage() {
  const supabase = createClient();
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);

  // New Discount Form State
  const [discountCode, setDiscountCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed_amount'>('percentage');
  const [discountValue, setDiscountValue] = useState('');

  const fetchMarketingData = async () => {
    const [{ data: dList }, { data: bList }] = await Promise.all([
      supabase.from('discounts').select('*').is('deleted_at', null),
      supabase.from('banners').select('*').is('deleted_at', null),
    ]);
    if (dList) setDiscounts(dList);
    if (bList) setBanners(bList);
  };

  useEffect(() => {
    fetchMarketingData();
  }, []);

  const handleCreateDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('discounts').insert({
        code: discountCode.toUpperCase(),
        discount_type: discountType,
        value: parseFloat(discountValue),
        is_active: true,
      });

      if (error) throw error;
      setDiscountCode('');
      setDiscountValue('');
      fetchMarketingData();
    } catch (err: any) {
      alert(`Error creating coupon: ${err.message}`);
    }
  };

  return (
    <div className="space-y-10">

      {/* Header */}
      <div className="border-b border-orvix-border pb-6">
        <span className="font-mono text-xs uppercase tracking-widest text-orvix-crimson-bright">
          // CONVERSION &amp; PROMOTIONS
        </span>
        <h1 className="mt-1 font-serif text-3xl font-bold text-white sm:text-4xl">
          Marketing, Banners &amp; Offers
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Discounts Panel */}
        <div className="border border-orvix-border bg-orvix-dark p-6 space-y-6">
          <div className="flex items-center gap-2 font-mono text-xs uppercase text-white border-b border-orvix-border pb-3">
            <Percent className="h-4 w-4 text-orvix-crimson-bright" />
            <span>DISCOUNT CODE GENERATOR</span>
          </div>

          <form onSubmit={handleCreateDiscount} className="space-y-4 font-mono text-xs">
            <div>
              <label className="text-[10px] text-zinc-400">PROMO CODE *</label>
              <input
                type="text"
                required
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                placeholder="e.g. ORVIX2026"
                className="mt-1 w-full border border-orvix-border bg-black px-3 py-2 text-white uppercase focus:border-orvix-crimson-bright focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-zinc-400">TYPE</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as any)}
                  className="mt-1 w-full border border-orvix-border bg-black px-3 py-2 text-white focus:border-orvix-crimson-bright focus:outline-none"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed_amount">Fixed Amount ($)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400">VALUE *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder="e.g. 15"
                  className="mt-1 w-full border border-orvix-border bg-black px-3 py-2 text-white focus:border-orvix-crimson-bright focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 border border-orvix-crimson-bright bg-orvix-crimson py-2.5 uppercase tracking-wider text-white hover:bg-orvix-crimson-bright transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Deploy Promotion</span>
            </button>
          </form>

          {/* Active Discounts List */}
          <div className="border-t border-orvix-border/70 pt-4 space-y-2 font-mono text-xs">
            <span className="text-[10px] text-zinc-500 uppercase">ACTIVE DISCOUNTS:</span>
            {discounts.map((d) => (
              <div key={d.id} className="flex justify-between border border-orvix-border bg-black/40 p-2.5">
                <span className="font-bold text-white">{d.code}</span>
                <span className="text-orvix-crimson-bright">
                  {d.discount_type === 'percentage' ? `${d.value}% OFF` : `$${d.value} OFF`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Banners Panel */}
        <div className="border border-orvix-border bg-orvix-dark p-6 space-y-6">
          <div className="flex items-center gap-2 font-mono text-xs uppercase text-white border-b border-orvix-border pb-3">
            <ImageIcon className="h-4 w-4 text-orvix-crimson-bright" />
            <span>HERO &amp; SHOWCASE BANNERS</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <span className="text-[10px] text-zinc-500 uppercase">CONFIGURED BANNERS:</span>
            {banners.length === 0 ? (
              <p className="text-zinc-500 italic">No custom banners currently active.</p>
            ) : (
              banners.map((b) => (
                <div key={b.id} className="border border-orvix-border bg-black/40 p-3">
                  <p className="font-bold text-white">{b.title}</p>
                  <p className="text-[10px] text-zinc-500">{b.subtitle}</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
