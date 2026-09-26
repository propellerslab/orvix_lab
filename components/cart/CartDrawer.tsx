// components/cart/CartDrawer.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ArrowRight, ShoppingBag, Plus, Minus } from 'lucide-react';
import { useCart } from '@/context/cart-context';

export function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          />

          {/* Lateral Slide-Over Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 flex w-full max-w-md flex-col border-l border-orvix-border bg-orvix-dark shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-orvix-border p-5">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-orvix-crimson-bright" />
                <span className="font-mono text-xs uppercase tracking-widest text-white">
                  FABRICATION BUFFER ({cart.length})
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-orvix-panel transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-orvix-border/40">
              {cart.length === 0 ? (
                <div className="py-20 text-center font-mono text-xs text-zinc-500">
                  <ShoppingBag className="mx-auto h-10 w-10 text-zinc-600 mb-3 opacity-50" />
                  <p>YOUR ORDER BUFFER IS EMPTY</p>
                  <p className="text-[10px] mt-1 text-zinc-600">Select built hardware or spools to stage</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="pt-4 first:pt-0 flex gap-4">
                    {/* Thumbnail */}
                    {item.image ? (
                      <div className="relative h-16 w-16 shrink-0 border border-orvix-border bg-black overflow-hidden">
                        <Image src={item.image} alt={item.title} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="h-16 w-16 shrink-0 border border-orvix-border bg-orvix-panel flex items-center justify-center font-mono text-[9px] text-zinc-500">
                        CAD
                      </div>
                    )}

                    {/* Meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-serif text-sm font-bold text-white truncate pr-2">
                          {item.title}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-zinc-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <p className="font-mono text-[10px] text-zinc-400 mt-0.5">
                        Rs.{item.unitPrice.toFixed(2)} &bull; SKU: {item.sku}
                      </p>

                      {/* Quantity Controller */}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center border border-orvix-border bg-black font-mono text-xs">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 text-zinc-400 hover:text-white"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2 text-white font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 text-zinc-400 hover:text-white"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="font-mono text-xs font-bold text-white">
                          Rs.{(item.unitPrice * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary & Checkout Action */}
            {cart.length > 0 && (
              <div className="border-t border-orvix-border bg-orvix-panel p-5 space-y-4">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-zinc-400 uppercase">SUBTOTAL:</span>
                  <span className="text-lg font-bold text-white">{cartTotal.toFixed(2)} NPR</span>
                </div>

                <div className="space-y-2">
                  <Link
                    href="/checkout"
                    onClick={() => setIsCartOpen(false)}
                    className="flex w-full items-center justify-center gap-2 border border-orvix-crimson-bright bg-orvix-crimson py-3 font-mono text-xs uppercase tracking-wider text-white shadow-crimson-glow hover:bg-orvix-crimson-bright transition-all"
                  >
                    <span>Proceed to WhatsApp Checkout</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <button
                    onClick={clearCart}
                    className="w-full py-1 font-mono text-[10px] uppercase text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    Clear Buffer
                  </button>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
