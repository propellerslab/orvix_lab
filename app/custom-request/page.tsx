// app/custom-request/page.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Plus, Trash2, UploadCloud, CheckCircle2, Loader2, Link as LinkIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/auth-provider';
import { industrialFadeUp, staggerContainer } from '@/lib/motion';

export default function CustomRequestPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    contactName: '',
    contactEmail: user?.email || '',
    contactPhone: '',
    projectTitle: '',
    description: '',
    targetMaterial: 'CARBON_FIBER',
    targetQuantity: 1,
    estimatedBudget: '',
  });

  const [inspirationUrls, setInspirationUrls] = useState<string[]>(['']);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successReference, setSuccessReference] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Inspiration URL array handlers
  const handleAddUrl = () => setInspirationUrls([...inspirationUrls, '']);
  const handleUpdateUrl = (index: number, val: string) => {
    const updated = [...inspirationUrls];
    updated[index] = val;
    setInspirationUrls(updated);
  };
  const handleRemoveUrl = (index: number) => {
    setInspirationUrls(inspirationUrls.filter((_, i) => i !== index));
  };

  // File selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const uploadedFileUrls: string[] = [];

      // 1. Upload CAD files to Supabase Storage bucket
      for (const file of selectedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `requests/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('custom-requests')
          .upload(filePath, file);

        if (uploadError) {
          console.warn('Storage upload note:', uploadError.message);
        } else {
          const { data: publicUrlData } = supabase.storage
            .from('custom-requests')
            .getPublicUrl(filePath);
          uploadedFileUrls.push(publicUrlData.publicUrl);
        }
      }

      // 2. Insert record into custom_requests table
      const cleanUrls = inspirationUrls.filter((u) => u.trim() !== '');

      const { data: requestRecord, error: dbError } = await supabase
        .from('custom_requests')
        .insert({
          user_id: user?.id || null,
          contact_name: formData.contactName,
          contact_email: formData.contactEmail,
          contact_phone: formData.contactPhone,
          project_title: formData.projectTitle,
          description: formData.description,
          target_material: formData.targetMaterial,
          target_quantity: Number(formData.targetQuantity),
          estimated_budget: formData.estimatedBudget ? Number(formData.estimatedBudget) : null,
          inspiration_urls: cleanUrls,
          file_urls: uploadedFileUrls,
          status: 'pending_review',
        })
        .select('id')
        .single();

      if (dbError) throw dbError;

      setSuccessReference(requestRecord.id);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to submit custom project specification.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 lg:px-8">

      {/* Telemetry Header */}
      <div className="border-b border-orvix-border pb-8">
        <div className="flex items-center gap-2 font-mono text-xs text-orvix-crimson-bright uppercase tracking-widest">
          <Cpu className="h-4 w-4" />
          <span>// BESPOKE ADDITIVE INTAKE</span>
        </div>
        <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Commission Custom Fabrication
        </h1>
        <p className="mt-3 font-serif text-sm text-zinc-400 leading-relaxed">
          Submit design constraints, Pinterest/moodboard references, or CAD geometry (STL, OBJ, STEP, CAD) for an engineering review and quotation.
        </p>
      </div>

      {successReference ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-12 border border-emerald-800 bg-emerald-950/20 p-8 text-center"
        >
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
          <h2 className="mt-4 font-serif text-2xl font-bold text-white">
            Engineering Specification Logged
          </h2>
          <p className="mt-2 font-mono text-xs text-zinc-400">
            Internal Reference UUID: <span className="text-white">{successReference}</span>
          </p>
          <p className="mt-4 font-serif text-sm text-zinc-300 max-w-md mx-auto">
            Our lab engineers will inspect your geometry and tolerances. We will provide pricing and material validation within 24 operational hours.
          </p>
          <div className="mt-8">
            <button
              onClick={() => {
                setSuccessReference(null);
                setSelectedFiles([]);
                setInspirationUrls(['']);
              }}
              className="border border-orvix-border bg-orvix-dark px-6 py-2.5 font-mono text-xs uppercase tracking-wider text-white hover:border-orvix-crimson-bright"
            >
              Submit Another Build
            </button>
          </div>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-12 space-y-8">

          {errorMsg && (
            <div className="border border-red-900 bg-red-950/30 p-4 font-mono text-xs text-red-300">
              {errorMsg}
            </div>
          )}

          {/* Section 1: Contact Details */}
          <div className="border border-orvix-border bg-orvix-dark p-6 space-y-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-orvix-crimson-bright">
              [01] CLIENT CREDENTIALS
            </span>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="font-mono text-[11px] text-zinc-400">OPERATOR NAME *</label>
                <input
                  type="text"
                  required
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  placeholder="e.g. Elena Vance"
                  className="mt-1 w-full border border-orvix-border bg-orvix-panel px-3 py-2 font-mono text-xs text-white focus:border-orvix-crimson-bright focus:outline-none"
                />
              </div>
              <div>
                <label className="font-mono text-[11px] text-zinc-400">CONTACT EMAIL *</label>
                <input
                  type="email"
                  required
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="elena@blackmesa.gov"
                  className="mt-1 w-full border border-orvix-border bg-orvix-panel px-3 py-2 font-mono text-xs text-white focus:border-orvix-crimson-bright focus:outline-none"
                />
              </div>
              <div>
                <label className="font-mono text-[11px] text-zinc-400">WHATSAPP / PHONE *</label>
                <input
                  type="tel"
                  required
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="+1 (555) 019-2834"
                  className="mt-1 w-full border border-orvix-border bg-orvix-panel px-3 py-2 font-mono text-xs text-white focus:border-orvix-crimson-bright focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Technical Project Specs */}
          <div className="border border-orvix-border bg-orvix-dark p-6 space-y-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-orvix-crimson-bright">
              [02] SYSTEM SPECIFICATIONS
            </span>
            <div className="space-y-4">
              <div>
                <label className="font-mono text-[11px] text-zinc-400">PROJECT / PART TITLE *</label>
                <input
                  type="text"
                  required
                  value={formData.projectTitle}
                  onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
                  placeholder="e.g. Drone Gimbal Heat-Sink Housing V3"
                  className="mt-1 w-full border border-orvix-border bg-orvix-panel px-3 py-2 font-mono text-xs text-white focus:border-orvix-crimson-bright focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-mono text-[11px] text-zinc-400">TARGET MATERIAL</label>
                  <select
                    value={formData.targetMaterial}
                    onChange={(e) => setFormData({ ...formData, targetMaterial: e.target.value })}
                    className="mt-1 w-full border border-orvix-border bg-orvix-panel px-3 py-2 font-mono text-xs text-white focus:border-orvix-crimson-bright focus:outline-none"
                  >
                    <option value="CARBON_FIBER">Carbon Fiber Composite</option>
                    <option value="ASA">ASA (UV / Heat Resistant)</option>
                    <option value="TPU">TPU (Compliant Flexible)</option>
                    <option value="RESIN">Ultra-High Detail Resin</option>
                    <option value="PLA">PLA Pro (Prototyping)</option>
                    <option value="OTHER">Other / Engineer Recommendation</option>
                  </select>
                </div>
                <div>
                  <label className="font-mono text-[11px] text-zinc-400">UNITS REQUIRED *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.targetQuantity}
                    onChange={(e) => setFormData({ ...formData, targetQuantity: Number(e.target.value) })}
                    className="mt-1 w-full border border-orvix-border bg-orvix-panel px-3 py-2 font-mono text-xs text-white focus:border-orvix-crimson-bright focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-mono text-[11px] text-zinc-400">EST. BUDGET ($ USD)</label>
                  <input
                    type="number"
                    value={formData.estimatedBudget}
                    onChange={(e) => setFormData({ ...formData, estimatedBudget: e.target.value })}
                    placeholder="Optional"
                    className="mt-1 w-full border border-orvix-border bg-orvix-panel px-3 py-2 font-mono text-xs text-white focus:border-orvix-crimson-bright focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-mono text-[11px] text-zinc-400">ENGINEERING SCOPE & REQUIREMENTS *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detail dimensional tolerances, operating temperature, mechanical load axes, or surface finish targets..."
                  className="mt-1 w-full border border-orvix-border bg-orvix-panel p-3 font-mono text-xs text-white focus:border-orvix-crimson-bright focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Inspiration URLs (Pinterest / Web) */}
          <div className="border border-orvix-border bg-orvix-dark p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-orvix-crimson-bright">
                [03] INSPIRATION & REFERENCES (PINTEREST / CAD / URLS)
              </span>
              <button
                type="button"
                onClick={handleAddUrl}
                className="flex items-center gap-1 font-mono text-xs text-zinc-400 hover:text-white"
              >
                <Plus className="h-3.5 w-3.5 text-orvix-crimson-bright" />
                <span>Add URL</span>
              </button>
            </div>

            {inspirationUrls.map((url, i) => (
              <div key={i} className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-zinc-500 shrink-0" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => handleUpdateUrl(i, e.target.value)}
                  placeholder="https://pinterest.com/pin/... or GrabCAD link"
                  className="flex-1 border border-orvix-border bg-orvix-panel px-3 py-2 font-mono text-xs text-white focus:border-orvix-crimson-bright focus:outline-none"
                />
                {inspirationUrls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveUrl(i)}
                    className="p-2 text-zinc-500 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Section 4: 3D CAD File Upload */}
          <div className="border border-orvix-border bg-orvix-dark p-6 space-y-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-orvix-crimson-bright">
              [04] CAD ASSETS & GEOMETRY (STL, STEP, OBJ, ZIP, PNG)
            </span>
            <div className="relative border-2 border-dashed border-orvix-border p-6 text-center hover:border-orvix-crimson-bright transition-colors">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <UploadCloud className="mx-auto h-8 w-8 text-zinc-500" />
              <p className="mt-2 font-mono text-xs text-zinc-300">
                Click or drag 3D files and schematics to upload
              </p>
              <p className="mt-1 font-mono text-[10px] text-zinc-500">
                Max 50MB per file &bull; Automatically transmitted to secure Supabase storage
              </p>
            </div>

            {selectedFiles.length > 0 && (
              <div className="space-y-1 font-mono text-xs text-zinc-400 pt-2">
                <span className="text-[10px] text-zinc-500 uppercase">Staged for transfer:</span>
                {selectedFiles.map((f, idx) => (
                  <div key={idx} className="flex justify-between border-b border-orvix-border/50 py-1">
                    <span className="text-white truncate max-w-xs">{f.name}</span>
                    <span>{(f.size / (1024 * 1024)).toFixed(2)} MB</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-3 border border-orvix-crimson-bright bg-orvix-crimson py-4 font-mono text-xs uppercase tracking-widest text-white shadow-crimson-glow hover:bg-orvix-crimson-bright transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>TRANSMITTING GEOMETRY &amp; SPECIFICATIONS...</span>
                </>
              ) : (
                <span>SUBMIT BUILD REQUEST FOR QUOTATION</span>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
