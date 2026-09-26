// app/custom-request/page.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Cpu,
  Plus,
  Trash2,
  UploadCloud,
  CheckCircle2,
  Loader2,
  Link as LinkIcon,
  AlertCircle,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/auth-provider';

interface FormErrorState {
  title: string;
  message: string;
  isRecoverableToWhatsApp?: boolean;
}

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
  const [errorState, setErrorState] = useState<FormErrorState | null>(null);

  // URL array management
  const handleAddUrl = () => setInspirationUrls([...inspirationUrls, '']);
  const handleUpdateUrl = (index: number, val: string) => {
    const updated = [...inspirationUrls];
    updated[index] = val;
    setInspirationUrls(updated);
  };
  const handleRemoveUrl = (index: number) => {
    setInspirationUrls(inspirationUrls.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  // Graceful error translator
  const parseUserFriendlyError = (err: any): FormErrorState => {
    // Log technical error details for developers
    console.error('[Orvix Lab CAD Intake Exception]:', err);

    const message = err?.message?.toLowerCase() || '';

    if (message.includes('bucket') || message.includes('storage') || message.includes('upload')) {
      return {
        title: 'File Upload Exception',
        message: 'One or more CAD files could not be uploaded. Please verify the files are under 50MB and try again.',
        isRecoverableToWhatsApp: true,
      };
    }

    if (message.includes('network') || message.includes('failed to fetch')) {
      return {
        title: 'Connection Interrupted',
        message: 'We were unable to reach the laboratory server. Please check your internet connection.',
        isRecoverableToWhatsApp: true,
      };
    }

    // Default graceful fallback for database/schema mismatches
    return {
      title: 'Submission Protocol Stalled',
      message:
        'Our automated intake queue experienced an unexpected processing error. Your input parameters have been preserved below.',
      isRecoverableToWhatsApp: true,
    };
  };

  // Compile WhatsApp fallback payload so user never loses their typed details
  const getWhatsAppFallbackUrl = () => {
    const number = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '1234567890').replace(/[^0-9]/g, '');
    const cleanUrls = inspirationUrls.filter((u) => u.trim() !== '').join(', ');

    const payload = `*ORVIX LAB // FAST-TRACK CUSTOM BUILD REQUEST*
====================================
*Client Name:* ${formData.contactName || 'N/A'}
*Contact Email:* ${formData.contactEmail || 'N/A'}
*Phone:* ${formData.contactPhone || 'N/A'}

*Project Title:* ${formData.projectTitle || 'Bespoke Fabrication'}
*Target Material:* ${formData.targetMaterial}
*Quantity Required:* ${formData.targetQuantity}
${formData.estimatedBudget ? `*Est. Budget:* $${formData.estimatedBudget} NPR\n` : ''}
*Engineering Scope:*
${formData.description || 'No description provided.'}

${cleanUrls ? `*Inspiration References:*\n${cleanUrls}\n` : ''}
====================================
_Transmitted via direct engineering fast-track._`;

    return `https://wa.me/${number}?text=${encodeURIComponent(payload)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorState(null);

    try {
      const uploadedFileUrls: string[] = [];

      // 1. Upload files to Supabase Storage
      for (const file of selectedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `requests/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('custom-requests')
          .upload(filePath, file);

        if (uploadError) {
          console.warn('Storage Notice:', uploadError.message);
        } else {
          const { data: publicUrlData } = supabase.storage
            .from('custom-requests')
            .getPublicUrl(filePath);
          uploadedFileUrls.push(publicUrlData.publicUrl);
        }
      }

      // 2. Insert to Supabase DB
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
      setErrorState(parseUserFriendlyError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
      {/* Telemetry Header */}
      <div className="border-b border-zinc-200 pb-8">
        <div className="flex items-center gap-2 font-mono text-xs text-[#E20000] uppercase tracking-widest">
          <Cpu className="h-4 w-4" />
          <span>// BESPOKE ADDITIVE INTAKE</span>
        </div>
        <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-[#242424] sm:text-5xl">
          Commission Custom Fabrication
        </h1>
        <p className="mt-3 font-serif text-sm text-zinc-600 leading-relaxed">
          Submit design constraints, Pinterest/moodboard references, or CAD geometry (STL, OBJ, STEP) for engineering review and quotation.
        </p>
      </div>

      {/* Success View */}
      {successReference ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-12 border border-emerald-600 bg-emerald-50/50 p-8 text-center"
        >
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
          <h2 className="mt-4 font-serif text-2xl font-bold text-[#242424]">
            Engineering Specification Logged
          </h2>
          <p className="mt-2 font-mono text-xs text-zinc-500">
            Internal Reference UUID: <span className="text-[#002339] font-bold">{successReference}</span>
          </p>
          <p className="mt-4 font-serif text-sm text-zinc-600 max-w-md mx-auto">
            Our lab engineers will inspect your geometry and tolerances. We will provide pricing and material validation within 24 operational hours.
          </p>
          <div className="mt-8">
            <button
              onClick={() => {
                setSuccessReference(null);
                setSelectedFiles([]);
                setInspirationUrls(['']);
              }}
              className="border border-zinc-300 bg-white px-6 py-2.5 font-mono text-xs uppercase tracking-wider text-[#242424] hover:border-[#002339] shadow-sm"
            >
              Submit Another Build
            </button>
          </div>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-10 space-y-8">

          {/* Human-Readable Error Notification with Fast-Track WhatsApp Fallback */}
          {errorState && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-l-4 border-[#E20000] border-y border-r border-zinc-200 bg-white p-5 shadow-sm space-y-3"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-[#E20000] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-serif text-sm font-bold text-[#242424]">
                    {errorState.title}
                  </h3>
                  <p className="mt-1 font-serif text-xs text-zinc-600 leading-relaxed">
                    {errorState.message}
                  </p>
                </div>
              </div>

              {/* Recovery Action: Direct WhatsApp Fast-Track */}
              {errorState.isRecoverableToWhatsApp && (
                <div className="border-t border-zinc-100 pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
                    Bypass automated queue &bull; No data lost
                  </span>
                  <a
                    href={getWhatsAppFallbackUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border border-emerald-600 bg-emerald-600 px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-white shadow-sm hover:bg-emerald-500 transition-colors"
                  >
                    <span>Transmit via WhatsApp Desk</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}
            </motion.div>
          )}

          {/* Section 1: Contact Details */}
          <div className="border border-zinc-200 bg-white p-6 space-y-4 shadow-sm">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#E20000]">
              [01] CLIENT CREDENTIALS
            </span>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 font-mono text-xs">
              <div>
                <label className="text-[10px] text-zinc-500">YOUR NAME</label>
                <input
                  type="text"
                  required
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  placeholder="e.g. Elena Vance"
                  className="mt-1 w-full border border-zinc-300 bg-white px-3 py-2 text-[#242424] focus:border-[#002339] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500">CONTACT EMAIL *</label>
                <input
                  type="email"
                  required
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="elena@company.com"
                  className="mt-1 w-full border border-zinc-300 bg-white px-3 py-2 text-[#242424] focus:border-[#002339] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500">WHATSAPP / PHONE *</label>
                <input
                  type="tel"
                  required
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="98xxxxxxxx"
                  className="mt-1 w-full border border-zinc-300 bg-white px-3 py-2 text-[#242424] focus:border-[#002339] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Technical Project Specs */}
          <div className="border border-zinc-200 bg-white p-6 space-y-4 shadow-sm font-mono text-xs">
            <span className="text-[10px] uppercase tracking-widest text-[#E20000]">
              [02] SYSTEM SPECIFICATIONS
            </span>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-zinc-500">PROJECT / PART TITLE *</label>
                <input
                  type="text"
                  required
                  value={formData.projectTitle}
                  onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
                  placeholder="e.g. Drone Gimbal Heat-Sink Housing V3"
                  className="mt-1 w-full border border-zinc-300 bg-white px-3 py-2 text-[#242424] focus:border-[#002339] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] text-zinc-500">TARGET MATERIAL</label>
                  <select
                    value={formData.targetMaterial}
                    onChange={(e) => setFormData({ ...formData, targetMaterial: e.target.value })}
                    className="mt-1 w-full border border-zinc-300 bg-white px-3 py-2 text-[#242424] focus:border-[#002339] focus:outline-none"
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
                  <label className="text-[10px] text-zinc-500">UNITS REQUIRED *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.targetQuantity}
                    onChange={(e) => setFormData({ ...formData, targetQuantity: Number(e.target.value) })}
                    className="mt-1 w-full border border-zinc-300 bg-white px-3 py-2 text-[#242424] focus:border-[#002339] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500">EST. BUDGET (NPR)</label>
                  <input
                    type="number"
                    value={formData.estimatedBudget}
                    onChange={(e) => setFormData({ ...formData, estimatedBudget: e.target.value })}
                    placeholder="Optional"
                    className="mt-1 w-full border border-zinc-300 bg-white px-3 py-2 text-[#242424] focus:border-[#002339] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-500">ENGINEERING SCOPE &amp; REQUIREMENTS *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detail dimensional tolerances, operating temperature, mechanical load axes, or surface finish targets..."
                  className="mt-1 w-full border border-zinc-300 bg-white p-3 text-[#242424] focus:border-[#002339] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Inspiration URLs */}
          <div className="border border-zinc-200 bg-white p-6 space-y-4 shadow-sm font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-[#E20000]">
                [03] INSPIRATION &amp; REFERENCES (PINTEREST / CAD / URLS)
              </span>
              <button
                type="button"
                onClick={handleAddUrl}
                className="flex items-center gap-1 text-zinc-600 hover:text-[#002339]"
              >
                <Plus className="h-3.5 w-3.5 text-[#E20000]" />
                <span>Add URL</span>
              </button>
            </div>

            {inspirationUrls.map((url, i) => (
              <div key={i} className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-zinc-400 shrink-0" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => handleUpdateUrl(i, e.target.value)}
                  placeholder="https://pinterest.com/pin/... or GrabCAD link"
                  className="flex-1 border border-zinc-300 bg-white px-3 py-2 text-[#242424] focus:border-[#002339] focus:outline-none"
                />
                {inspirationUrls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveUrl(i)}
                    className="p-2 text-zinc-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Section 4: 3D CAD Upload */}
          <div className="border border-zinc-200 bg-white p-6 space-y-4 shadow-sm font-mono text-xs">
            <span className="text-[10px] uppercase tracking-widest text-[#E20000]">
              [04] CAD ASSETS &amp; GEOMETRY (STL, STEP, OBJ, ZIP)
            </span>
            <div className="relative border-2 border-dashed border-zinc-300 bg-[#FAFAFA] p-6 text-center hover:border-[#002339] transition-colors">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <UploadCloud className="mx-auto h-8 w-8 text-zinc-400" />
              <p className="mt-2 text-xs text-zinc-700 font-semibold">
                Click or drag 3D files and schematics to upload
              </p>
              <p className="mt-1 text-[10px] text-zinc-400">
                Max 50MB per file &bull; Automatically transmitted to secure Supabase storage
              </p>
            </div>

            {selectedFiles.length > 0 && (
              <div className="space-y-1 text-xs text-zinc-600 pt-2">
                <span className="text-[10px] text-zinc-400 uppercase">Staged for transfer:</span>
                {selectedFiles.map((f, idx) => (
                  <div key={idx} className="flex justify-between border-b border-zinc-100 py-1">
                    <span className="text-[#242424] truncate max-w-xs">{f.name}</span>
                    <span>{(f.size / (1024 * 1024)).toFixed(2)} MB</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-3 border border-[#E20000] bg-[#E20000] py-4 font-mono text-xs uppercase tracking-widest text-white shadow-sm hover:bg-[#C50000] transition-all disabled:opacity-50"
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
