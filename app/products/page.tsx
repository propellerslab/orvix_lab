// app/products/page.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Box, Tag, ArrowRight, ShieldCheck, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { industrialFadeUp, staggerContainer } from '@/lib/motion';

// Mock/fallback sample data matching Supabase schema
const INITIAL_PRODUCTS = [
  {
    id: 'prod-01',
    sku: 'OX-MOD-CASE',
    name: 'Modular Micro-ITX Lab Chassis',
    slug: 'modular-micro-itx-lab-chassis',
    tagline: 'Carbon-Fiber Reinforced SFF Enclosure',
    description: 'Engineered with SLS nylon structural corners and continuous CF-PETG ducting for optimized silent air-pressure cooling.',
    base_price: 249.0,
    discount_percent: 15,
    tags: ['Enclosure', 'SLS Nylon', 'Carbon Fiber', 'Hardware'],
    specifications: {
      volume: '11.2 Liters',
      clearance: 'GPU up to 320mm',
      tolerance: '±0.04 mm',
      weight: '1.42 kg',
    },
    images: ['https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80'],
  },
  {
    id: 'prod-02',
    sku: 'OX-CYB-ARM',
    name: 'Bionic 5-Axis Robotic Gripper',
    slug: 'bionic-5-axis-robotic-gripper',
    tagline: 'Parametric Mechanical End-Effector',
    description: 'Designed for robotics developers. Features high-torque compliant TPU finger pads and heat-staked brass threaded inserts.',
    base_price: 185.0,
    discount_percent: 0,
    tags: ['Robotics', 'TPU Compliant', 'Prototyping'],
    specifications: {
      payload: '1.8 kg Grip Force',
      voltage: '5V - 12V Logic',
      servos: 'Metal Gear DS3218',
      tolerance: '±0.05 mm',
    },
    images: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'],
  },
  {
    id: 'prod-03',
    sku: 'OX-TEST-RIG',
    name: 'Precision Optical Sensor Bench',
    slug: 'precision-optical-sensor-bench',
    tagline: 'Lab Metrology & Calibration Stage',
    description: 'Resin-cured ultra-dense chassis eliminating vibration harmonics during high-speed laser sensor testing.',
    base_price: 320.0,
    discount_percent: 10,
    tags: ['Metrology', 'Engineering Resin', 'Lab Equipment'],
    specifications: {
      layer_height: '25 Microns',
      stability: 'Zero Flex Core',
      mount: 'M6 Optical Matrix',
      tolerance: '±0.02 mm',
    },
    images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'],
  },
];

export default function ProductsPage() {
  const { addToCart } = useCart();
  const [selectedTag, setSelectedTag] = useState<string>('All');

  const allTags = ['All', 'Enclosure', 'Robotics', 'Carbon Fiber', 'Metrology', 'SLS Nylon'];

  const filtered = selectedTag === 'All'
    ? INITIAL_PRODUCTS
    : INITIAL_PRODUCTS.filter((p) => p.tags.includes(selectedTag));

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">

      {/* Header telemetry */}
      <div className="border-b border-orvix-border pb-8">
        <div className="flex items-center gap-2 font-mono text-xs text-orvix-crimson-bright uppercase tracking-widest">
          <Box className="h-4 w-4" />
          <span>// MADE IN NEPAL</span>
        </div>
        <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-white sm:text-6xl">
          Custom 3D Printed Products
        </h1>
        <p className="mt-3 max-w-2xl font-serif text-sm text-zinc-400">
          High-quality, ready-to-use 3D prints and custom tech accessories designed to fit your exact needs.
        </p>

        {/* Filter tags */}
        <div className="mt-8 flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`border px-3 py-1 font-mono text-xs uppercase tracking-wider transition-colors ${
                selectedTag === tag
                  ? 'border-orvix-crimson-bright bg-orvix-crimson text-white'
                  : 'border-orvix-border bg-orvix-dark text-zinc-400 hover:border-zinc-500 hover:text-white'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        key={selectedTag}
        className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
      >
        {filtered.map((product) => {
          const discount = product.discount_percent;
          const discountedPrice = discount > 0
            ? product.base_price * (1 - discount / 100)
            : product.base_price;

          return (
            <motion.div
              key={product.id}
              variants={industrialFadeUp}
              className="group relative flex flex-col justify-between border border-orvix-border bg-orvix-dark p-6 transition-all hover:border-orvix-crimson-bright"
            >
              <div>
                {/* Image frame */}
                <div className="relative aspect-video w-full overflow-hidden border border-orvix-border bg-black">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {discount > 0 && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-orvix-crimson px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white shadow-crimson-glow">
                      <Tag className="h-3 w-3" />
                      <span>{discount}% OFF OFFER</span>
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 border border-orvix-border bg-black/80 px-2 py-0.5 font-mono text-[9px] text-zinc-300">
                    SKU: {product.sku}
                  </div>
                </div>

                {/* Content */}
                <div className="mt-5 space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {product.tags.map((t) => (
                      <span key={t} className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">
                        #{t}
                      </span>
                    ))}
                  </div>

                  <h2 className="font-serif text-xl font-bold text-white group-hover:text-orvix-crimson-bright transition-colors">
                    {product.name}
                  </h2>

                  <p className="font-serif text-xs text-zinc-400 line-clamp-2">
                    {product.description}
                  </p>
                </div>

                {/* Specifications telemetry */}
                <div className="mt-5 grid grid-cols-2 gap-2 border-t border-orvix-border/70 pt-4 font-mono text-[10px]">
                  {Object.entries(product.specifications).map(([key, val]) => (
                    <div key={key} className="flex justify-between border-b border-orvix-border/40 pb-1">
                      <span className="text-zinc-500 uppercase">{key}:</span>
                      <span className="text-zinc-300 font-semibold">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing & Add to Cart */}
              <div className="mt-6 border-t border-orvix-border pt-4 flex items-center justify-between">
                <div>
                  {discount > 0 && (
                    <span className="font-mono text-xs text-zinc-500 line-through mr-2">
                      Rs.{product.base_price.toFixed(2)}
                    </span>
                  )}
                  <span className="font-mono text-lg font-bold text-white">
                    Rs.{discountedPrice.toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={() =>
                    addToCart({
                      referenceId: product.id,
                      itemType: 'product',
                      title: product.name,
                      sku: product.sku,
                      unitPrice: discountedPrice,
                      quantity: 1,
                      image: product.images[0],
                      metadata: product.specifications,
                    })
                  }
                  className="flex items-center gap-2 border border-orvix-border-crimson bg-orvix-panel px-4 py-2 font-mono text-xs uppercase tracking-wider text-black hover:border-orvix-crimson-bright hover:bg-orvix-crimson transition-all"
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  <span>Add to Order</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
