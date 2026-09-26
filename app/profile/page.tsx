// app/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, MapPin, Cpu, Save, CheckCircle2, Loader2, Shield } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { createClient } from '@/lib/supabase/client';

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, isLoading } = useAuth();
  const supabase = createClient();

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    companyName: '',
    taxId: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    defaultMaterial: 'CARBON_FIBER',
    layerResolution: '0.12mm',
  });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login?redirectTo=/profile');
    }

    if (profile) {
      const addr = profile.default_shipping_address || {};
      setFormData({
        fullName: profile.full_name || '',
        phone: profile.phone || '',
        companyName: profile.company_name || '',
        taxId: profile.tax_id || '',
        street: addr.street || '',
        city: addr.city || '',
        state: addr.state || '',
        postalCode: addr.postalCode || '',
        country: addr.country || 'Nepal',
        defaultMaterial: addr.defaultMaterial || 'CARBON_FIBER',
        layerResolution: addr.layerResolution || '0.12mm',
      });
    }
  }, [profile, user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSuccess(false);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          phone: formData.phone,
          company_name: formData.companyName,
          tax_id: formData.taxId,
          default_shipping_address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode,
            country: formData.country,
            defaultMaterial: formData.defaultMaterial,
            layerResolution: formData.layerResolution,
          },
        })
        .eq('id', user.id);

      if (error) throw error;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center font-mono text-xs text-zinc-500">
        // ACCESSING PROFILE REGISTRY...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 lg:px-8">

      {/* Header */}
      <div className="border-b border-orvix-border pb-6 flex items-center justify-between">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-orvix-crimson-bright">
            // OPERATOR REGISTRY
          </span>
          <h1 className="mt-1 font-serif text-3xl font-bold text-white sm:text-4xl">
            Specs &amp; Dispatch Destination
          </h1>
          <p className="mt-1 font-mono text-xs text-zinc-400">
            Account: {user?.email} &bull; Role: {profile?.role?.toUpperCase()}
          </p>
        </div>
        <Shield className="h-8 w-8 text-orvix-crimson" />
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">

        {success && (
          <div className="flex items-center gap-2 border border-emerald-800 bg-emerald-950/30 p-4 font-mono text-xs text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <span>OPERATOR SPECIFICATIONS &amp; SHIPPING LOGISTICS UPDATED.</span>
          </div>
        )}

        {/* 1. Identity & B2B Profile */}
        <div className="border border-orvix-border bg-orvix-dark p-6 space-y-4">
          <div className="flex items-center gap-2 font-mono text-xs uppercase text-white border-b border-orvix-border pb-3">
            <User className="h-4 w-4 text-orvix-crimson-bright" />
            <span>OPERATOR CREDENTIALS</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
            <div>
              <label className="text-[10px] text-zinc-400">FULL NAME</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="mt-1 w-full border border-orvix-border bg-orvix-panel px-3 py-2 text-white focus:border-orvix-crimson-bright focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-400">WHATSAPP / PHONE NUMBER</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1234567890"
                className="mt-1 w-full border border-orvix-border bg-orvix-panel px-3 py-2 text-white focus:border-orvix-crimson-bright focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-400">COMPANY / ENTITY (FOR B2B INVOICES)</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="mt-1 w-full border border-orvix-border bg-orvix-panel px-3 py-2 text-white focus:border-orvix-crimson-bright focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-400">VAT / TAX ID NUMBER</label>
              <input
                type="text"
                value={formData.taxId}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                className="mt-1 w-full border border-orvix-border bg-orvix-panel px-3 py-2 text-white focus:border-orvix-crimson-bright focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 2. Default Shipping Address */}
        <div className="border border-orvix-border bg-orvix-dark p-6 space-y-4">
          <div className="flex items-center gap-2 font-mono text-xs uppercase text-white border-b border-orvix-border pb-3">
            <MapPin className="h-4 w-4 text-orvix-crimson-bright" />
            <span>DEFAULT DISPATCH DESTINATION</span>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div>
              <label className="text-[10px] text-zinc-400">STREET ADDRESS</label>
              <input
                type="text"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                className="mt-1 w-full border border-orvix-border bg-orvix-panel px-3 py-2 text-white focus:border-orvix-crimson-bright focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-[10px] text-zinc-400">CITY</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="mt-1 w-full border border-orvix-border bg-orvix-panel px-3 py-2 text-white focus:border-orvix-crimson-bright focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-400">STATE / PROV</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="mt-1 w-full border border-orvix-border bg-orvix-panel px-3 py-2 text-white focus:border-orvix-crimson-bright focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-400">POSTAL CODE</label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="mt-1 w-full border border-orvix-border bg-orvix-panel px-3 py-2 text-white focus:border-orvix-crimson-bright focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-400">COUNTRY</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="mt-1 w-full border border-orvix-border bg-orvix-panel px-3 py-2 text-white focus:border-orvix-crimson-bright focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Preferred Manufacturing Preferences */}
        <div className="border border-orvix-border bg-orvix-dark p-6 space-y-4">
          <div className="flex items-center gap-2 font-mono text-xs uppercase text-white border-b border-orvix-border pb-3">
            <Cpu className="h-4 w-4 text-orvix-crimson-bright" />
            <span>CAD &amp; PRINTING DEFAULTS</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
            <div>
              <label className="text-[10px] text-zinc-400">DEFAULT MATERIAL PREFERENCE</label>
              <select
                value={formData.defaultMaterial}
                onChange={(e) => setFormData({ ...formData, defaultMaterial: e.target.value })}
                className="mt-1 w-full border border-orvix-border bg-orvix-panel px-3 py-2 text-white focus:border-orvix-crimson-bright focus:outline-none"
              >
                <option value="CARBON_FIBER">Carbon-Fiber Reinforced PETG</option>
                <option value="ASA">UV-Stabilized ASA</option>
                <option value="TPU">High-Rebound Elastic TPU</option>
                <option value="RESIN">Ultra-High Detail SLA Resin</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-zinc-400">TARGET LAYER HEIGHT</label>
              <select
                value={formData.layerResolution}
                onChange={(e) => setFormData({ ...formData, layerResolution: e.target.value })}
                className="mt-1 w-full border border-orvix-border bg-orvix-panel px-3 py-2 text-white focus:border-orvix-crimson-bright focus:outline-none"
              >
                <option value="0.08mm">0.08mm (Ultra Fine)</option>
                <option value="0.12mm">0.12mm (Standard High Precision)</option>
                <option value="0.20mm">0.20mm (Rapid Functional)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 border border-orvix-crimson-bright bg-orvix-crimson py-3 font-mono text-xs uppercase tracking-widest text-white shadow-crimson-glow hover:bg-orvix-crimson-bright transition-all disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>COMMITTING TO DATABASE...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Save Specifications &amp; Address</span>
            </>
          )}
        </button>

      </form>
    </div>
  );
}
