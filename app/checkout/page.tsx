// app/checkout/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Truck,
  ArrowRight,
  ArrowLeft,
  CheckSquare,
  Square,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/components/providers/auth-provider';
import { createClient } from '@/lib/supabase/client';
import { formatOrderWhatsAppMessage, generateWhatsAppUrl, ShippingDetails } from '@/lib/whatsapp';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, clearCart, updateQuantity, removeFromCart } = useCart();
  const { user, profile } = useAuth();
  const supabase = createClient();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manifestConfirmed, setManifestConfirmed] = useState(false);
  const [termsConfirmed, setTermsConfirmed] = useState(false);

  // Form State
  const [shipping, setShipping] = useState<ShippingDetails>({
    fullName: profile?.full_name || '',
    email: user?.email || '',
    phone: profile?.phone || '',
    company: profile?.company_name || '',
    taxId: profile?.tax_id || '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Nepal',
    notes: '',
  });

  const [orderFinalized, setOrderFinalized] = useState<{
    orderId: string;
    orderNumber: string;
    whatsappUrl: string;
  } | null>(null);

  // Default WhatsApp Dispatch Destination (Orvix Lab Business Desk)
  const LAB_WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+977 9709231704';

  if (cart.length === 0 && !orderFinalized) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <div className="border border-orvix-border bg-orvix-dark p-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-orvix-crimson-bright" />
          <h1 className="mt-4 font-serif text-3xl font-bold text-white">Cart Manifest Empty</h1>
          <p className="mt-2 font-mono text-xs text-zinc-400">
            No 3D-printed hardware or filament spools detected in active buffer.
          </p>
          <div className="mt-8">
            <Link
              href="/products"
              className="inline-block border border-orvix-crimson-bright bg-orvix-crimson px-6 py-3 font-mono text-xs uppercase tracking-wider text-white hover:bg-orvix-crimson-bright"
            >
              Explore Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Handle final order execution
  const handleFinalOrderSubmit = async () => {
    setIsProcessing(true);
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

      // 1. Create Order Record in Supabase
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id || null,
          status: 'submitted_whatsapp',
          customer_snapshot: shipping,
          subtotal: cartTotal,
          total_amount: cartTotal,
          notes: shipping.notes || null,
        })
        .select('id, order_number')
        .single();

      if (orderError) throw orderError;

      // 2. Insert Order Items
      const orderItemsToInsert = cart.map((item) => ({
        order_id: orderData.id,
        item_type: item.itemType,
        product_id: item.itemType === 'product' && !item.referenceId.startsWith('prod-') ? item.referenceId : null,
        filament_id: item.itemType === 'filament' && !item.referenceId.startsWith('fil-') ? item.referenceId : null,
        item_name: item.title,
        unit_price: item.unitPrice,
        quantity: item.quantity,
        total_price: item.unitPrice * item.quantity,
        configuration: item.metadata || {},
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert);

      if (itemsError) throw itemsError;

      // 3. Compile WhatsApp Message Payload
      const messagePayload = formatOrderWhatsAppMessage({
        orderNumber: orderData.order_number,
        orderId: orderData.id,
        shipping,
        items: cart,
        subtotal: cartTotal,
        total: cartTotal,
        siteUrl,
      });

      // 4. Update the order with compiled payload for future reference
      await supabase
        .from('orders')
        .update({ whatsapp_payload: messagePayload })
        .eq('id', orderData.id);

      const targetUrl = generateWhatsAppUrl(LAB_WHATSAPP_NUMBER, messagePayload);

      setOrderFinalized({
        orderId: orderData.id,
        orderNumber: orderData.order_number,
        whatsappUrl: targetUrl,
      });

      // Clear local cart
      clearCart();
    } catch (err: any) {
      console.error('Order creation error:', err);
      alert(`Order initialization failed: ${err.message || 'Unknown database exception'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 lg:px-8">

      {/* Checkout Progress Stepper */}
      <div className="mb-12 border-b border-orvix-border pb-6">
        <div className="flex items-center justify-between font-mono text-xs">
          <span className="text-orvix-crimson-bright font-bold uppercase tracking-widest">
            // ORVIX PRODUCTION DISPATCH PIPELINE
          </span>
          <span className="text-zinc-500 uppercase">
            STEP {currentStep} OF 3
          </span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { step: 1, title: '01. Line Item Manifest' },
            { step: 2, title: '02. Shipping Logistics' },
            { step: 3, title: '03. Verification & Dispatch' },
          ].map((s) => (
            <div
              key={s.step}
              className={`h-1.5 transition-colors ${
                currentStep >= s.step ? 'bg-orvix-crimson-bright' : 'bg-orvix-border'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Completion View */}
      {orderFinalized ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="border border-orvix-border-crimson bg-orvix-dark p-8 md:p-12 text-center shadow-2xl"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center border border-emerald-500 bg-emerald-950/30 text-emerald-400">
            <ShieldCheck className="h-8 w-8" />
          </div>

          <h2 className="mt-6 font-serif text-3xl font-bold text-white md:text-4xl">
            Order Protocol Initialized
          </h2>

          <p className="mt-2 font-mono text-sm text-orvix-crimson-bright">
            IDENTIFIER: {orderFinalized.orderNumber}
          </p>

          <p className="mx-auto mt-4 max-w-xl font-serif text-sm text-zinc-300 leading-relaxed">
            Your production record has been stored in our Supabase system. Click below to transfer this manifest directly to our WhatsApp Desk for immediate scheduling and invoicing.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={orderFinalized.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full sm:w-auto items-center justify-center gap-3 border border-emerald-500 bg-emerald-600 px-8 py-4 font-mono text-xs uppercase tracking-widest text-white hover:bg-emerald-500 transition-colors shadow-lg"
            >
              <span>Transmit via WhatsApp</span>
              <ExternalLink className="h-4 w-4" />
            </a>

            <Link
              href={`/orders/${orderFinalized.orderId}`}
              className="flex w-full sm:w-auto items-center justify-center gap-2 border border-orvix-border bg-orvix-panel px-6 py-4 font-mono text-xs uppercase tracking-wider text-zinc-300 hover:text-white transition-colors"
            >
              <span>Track Production Status</span>
            </Link>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Main Wizard Form Body */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">

              {/* STEP 1: MANIFEST REVIEW */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  <div className="border border-orvix-border bg-orvix-dark p-6">
                    <h3 className="font-serif text-xl font-bold text-white mb-4">
                      Review Items &amp; Technical Specifications
                    </h3>

                    <div className="space-y-4 divide-y divide-orvix-border/50">
                      {cart.map((item) => (
                        <div key={item.id} className="pt-4 first:pt-0 flex items-start justify-between gap-4">
                          <div>
                            <p className="font-serif text-base font-semibold text-white">
                              {item.title}
                            </p>
                            <p className="font-mono text-[10px] text-white">
                              SKU: {item.sku} &bull; Type: {item.itemType.toUpperCase()}
                            </p>
                            {item.metadata && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {Object.entries(item.metadata).map(([k, v]) => (
                                  <span key={k} className="border border-orvix-border bg-white/60 px-2 py-0.5 font-mono text-[9px] text-white">
                                    {k}: {String(v)}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <span className="font-mono text-sm font-bold text-white">
                              Rs.{(item.unitPrice * item.quantity).toFixed(2)}
                            </span>
                            <div className="flex items-center gap-2 border border-orvix-border bg-white px-2 py-1 font-mono text-xs">
                              <button onClick={() => updateQuantity(item.id, -1)} className="text-black hover:text-zinc-600 px-1">-</button>
                              <span>{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, 1)} className="text-black hover:text-zinc-600 px-1">+</button>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="font-mono text-[10px] text-zinc-500 hover:text-red-400"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Explicit Confirmation Checkbox 1 */}
                  <div
                    onClick={() => setManifestConfirmed(!manifestConfirmed)}
                    className="flex cursor-pointer items-center gap-3 border border-orvix-border bg-orvix-dark p-4 select-none hover:border-zinc-500"
                  >
                    {manifestConfirmed ? (
                      <CheckSquare className="h-5 w-5 text-orvix-crimson-bright shrink-0" />
                    ) : (
                      <Square className="h-5 w-5 text-zinc-600 shrink-0" />
                    )}
                    <span className="font-mono text-xs text-zinc-300">
                      I have verified all tolerances, infill, quantities, and filament types in this production manifest.
                    </span>
                  </div>

                  <div className="flex justify-end">
                    <button
                      disabled={!manifestConfirmed}
                      onClick={() => setCurrentStep(2)}
                      className="flex items-center gap-2 border border-orvix-crimson-bright bg-orvix-crimson px-6 py-3 font-mono text-xs uppercase tracking-wider text-white hover:bg-orvix-crimson-bright disabled:opacity-40 transition-all"
                    >
                      <span>Proceed to Shipping</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: SHIPPING LOGISTICS */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  <div className="border border-orvix-border bg-orvix-dark p-6 space-y-4">
                    <h3 className="font-serif text-xl font-bold text-white">
                      Destination &amp; Contact Credentials
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-mono text-[10px] text-zinc-400">OPERATOR NAME *</label>
                        <input
                          type="text"
                          required
                          value={shipping.fullName}
                          onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })}
                          className="mt-1 w-full border border-orvix-border bg-orvix-panel px-3 py-2 font-mono text-xs text-white focus:border-orvix-crimson-bright focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="font-mono text-[10px] text-zinc-400">OFFICIAL EMAIL *</label>
                        <input
                          type="email"
                          required
                          value={shipping.email}
                          onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
                          className="mt-1 w-full border border-orvix-border bg-orvix-panel px-3 py-2 font-mono text-xs text-white focus:border-orvix-crimson-bright focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="font-mono text-[10px] text-zinc-400">WHATSAPP / PHONE NUMBER *</label>
                        <input
                          type="tel"
                          required
                          value={shipping.phone}
                          onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                          placeholder="+1234567890"
                          className="mt-1 w-full border border-orvix-border bg-orvix-panel px-3 py-2 font-mono text-xs text-white focus:border-orvix-crimson-bright focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="font-mono text-[10px] text-zinc-400">COMPANY / ENTITY (OPTIONAL)</label>
                        <input
                          type="text"
                          value={shipping.company}
                          onChange={(e) => setShipping({ ...shipping, company: e.target.value })}
                          className="mt-1 w-full border border-orvix-border bg-orvix-panel px-3 py-2 font-mono text-xs text-white focus:border-orvix-crimson-bright focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="font-mono text-[10px] text-zinc-400">STREET ADDRESS *</label>
                      <input
                        type="text"
                        required
                        value={shipping.street}
                        onChange={(e) => setShipping({ ...shipping, street: e.target.value })}
                        className="mt-1 w-full border border-orvix-border bg-orvix-panel px-3 py-2 font-mono text-xs text-white focus:border-orvix-crimson-bright focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="font-mono text-[10px] text-zinc-400">CITY *</label>
                        <input
                          type="text"
                          required
                          value={shipping.city}
                          onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                          className="mt-1 w-full border border-orvix-border bg-orvix-panel px-3 py-2 font-mono text-xs text-white focus:border-orvix-crimson-bright focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="font-mono text-[10px] text-zinc-400">STATE / PROV *</label>
                        <input
                          type="text"
                          required
                          value={shipping.state}
                          onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                          className="mt-1 w-full border border-orvix-border bg-orvix-panel px-3 py-2 font-mono text-xs text-white focus:border-orvix-crimson-bright focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="font-mono text-[10px] text-zinc-400">POSTAL CODE *</label>
                        <input
                          type="text"
                          required
                          value={shipping.postalCode}
                          onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })}
                          className="mt-1 w-full border border-orvix-border bg-orvix-panel px-3 py-2 font-mono text-xs text-white focus:border-orvix-crimson-bright focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-mono text-[10px] text-zinc-400">DISPATCH &amp; CRITICAL TIMELINE NOTES</label>
                      <textarea
                        rows={2}
                        value={shipping.notes}
                        onChange={(e) => setShipping({ ...shipping, notes: e.target.value })}
                        placeholder="Dock hours, custom packaging labels, or expedited dispatch constraints..."
                        className="mt-1 w-full border border-orvix-border bg-orvix-panel p-2 font-mono text-xs text-white focus:border-orvix-crimson-bright focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="flex items-center gap-2 border border-orvix-border bg-orvix-dark px-5 py-3 font-mono text-xs uppercase text-zinc-400 hover:text-white"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back to Manifest</span>
                    </button>
                    <button
                      disabled={!shipping.fullName || !shipping.email || !shipping.phone || !shipping.street}
                      onClick={() => setCurrentStep(3)}
                      className="flex items-center gap-2 border border-orvix-crimson-bright bg-orvix-crimson px-6 py-3 font-mono text-xs uppercase tracking-wider text-white hover:bg-orvix-crimson-bright disabled:opacity-40"
                    >
                      <span>Continue to Lock-in</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: SECURITY LOCK-IN & WHATSAPP DISPATCH */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  <div className="border border-orvix-border-crimson bg-orvix-dark p-6 space-y-4">
                    <div className="flex items-center gap-2 text-orvix-crimson-bright font-mono text-xs uppercase tracking-widest">
                      <Lock className="h-4 w-4" />
                      <span>FINAL SECURITY LOCK-IN</span>
                    </div>

                    <h3 className="font-serif text-2xl font-bold text-white">
                      Authorize Manufacturing Dispatch
                    </h3>

                    <p className="font-serif text-xs text-zinc-300 leading-relaxed">
                      Orvix Lab uses a direct engineer-to-client workflow. Confirming below records your batch in Supabase and launches the pre-formatted WhatsApp transmission.
                    </p>

                    {/* Snapshot Preview */}
                    <div className="border border-orvix-border bg-black/60 p-4 font-mono text-xs space-y-2">
                      <div className="flex justify-between text-zinc-400">
                        <span>Recipient:</span>
                        <span className="text-white font-semibold">{shipping.fullName}</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Ship To:</span>
                        <span className="text-white truncate max-w-xs">{shipping.street}, {shipping.city}</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Total Items:</span>
                        <span className="text-white font-semibold">{cart.length} unique lines</span>
                      </div>
                    </div>
                  </div>

                  {/* Explicit Confirmation Checkbox 2 */}
                  <div
                    onClick={() => setTermsConfirmed(!termsConfirmed)}
                    className="flex cursor-pointer items-center gap-3 border border-orvix-border bg-orvix-dark p-4 select-none hover:border-zinc-500"
                  >
                    {termsConfirmed ? (
                      <CheckSquare className="h-5 w-5 text-orvix-crimson-bright shrink-0" />
                    ) : (
                      <Square className="h-5 w-5 text-zinc-600 shrink-0" />
                    )}
                    <span className="font-mono text-xs text-zinc-300">
                      I authorize Orvix Lab to register this order and open the WhatsApp Business dispatch link.
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="flex items-center gap-2 border border-orvix-border bg-orvix-dark px-5 py-3 font-mono text-xs uppercase text-zinc-400 hover:text-white"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back to Logistics</span>
                    </button>
                    <button
                      disabled={!termsConfirmed || isProcessing}
                      onClick={handleFinalOrderSubmit}
                      className="flex items-center gap-2 border border-orvix-crimson-bright bg-orvix-crimson px-8 py-3.5 font-mono text-xs uppercase tracking-widest text-white shadow-crimson-glow hover:bg-orvix-crimson-bright disabled:opacity-40 transition-all"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>PERSISTING TO SUPABASE...</span>
                        </>
                      ) : (
                        <>
                          <span>INITIALIZE ORDER &amp; WHATSAPP</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar Summary (Sticky) */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 border border-orvix-border bg-orvix-dark p-6 space-y-4">
              <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                COST BREAKDOWN
              </span>

              <div className="space-y-2 border-b border-orvix-border/60 pb-4 font-mono text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal:</span>
                  <span className="text-white">Rs.{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Shipping Fee:</span>
                  <span className="text-zinc-500 italic">Quoted on WhatsApp</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Estimated Tax:</span>
                  <span className="text-zinc-500 italic">Determined by location</span>
                </div>
              </div>

              <div className="flex justify-between font-mono text-base font-bold text-white pt-1">
                <span>Total:</span>
                <span className="text-orvix-crimson-bright">{cartTotal.toFixed(2)} NPR</span>
              </div>

              <div className="border border-orvix-border/40 bg-black/40 p-3 font-mono text-[10px] text-zinc-400 leading-normal">
                Direct invoicing and B2B wire payment instructions provided upon WhatsApp dispatch confirmation.
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
