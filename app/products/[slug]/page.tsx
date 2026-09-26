// app/products/[slug]/page.tsx
'use client';

import { useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Tag,
  ShieldCheck,
  Cpu,
  Layers,
  CheckCircle2,
  ShoppingCart,
  Maximize2,
} from 'lucide-react';
import { useCart } from '@/context/cart-context';

// Comprehensive catalog database with multiple inspection angles
const PRODUCTS_DATA: Record<string, any> = {
  'modular-micro-itx-lab-chassis': {
    id: 'prod-01',
    sku: 'OX-MOD-CASE',
    name: 'Modular Micro-ITX Lab Chassis',
    tagline: 'Carbon-Fiber Reinforced SFF Enclosure',
    description:
      'Engineered with SLS nylon structural corners and continuous CF-PETG ducting for optimized silent air-pressure cooling. Designed for mobile test equipment and field compute clusters.',
    base_price: 249.0,
    discount_percent: 15,
    tags: ['Enclosure', 'SLS Nylon', 'Carbon Fiber', 'Hardware'],
    angles: [
      {
        label: 'Front Isometric',
        url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1200&q=80',
        caption: 'Continuous CF-PETG shell with ventilation channels',
      },
      {
        label: 'Orthographic Side',
        url: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1200&q=80',
        caption: 'M4 brass heat-staked insert mounting points',
      },
      {
        label: 'Internal Chassis',
        url: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=1200&q=80',
        caption: 'GPU chamber clearance up to 320mm triple-slot',
      },
      {
        label: 'Macro Layer Texture',
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        caption: '0.12mm layer height with matte carbon fiber refraction',
      },
    ],
    specs: {
      'Build Volume': '11.2 Liters',
      'Manufacturing Process': 'Industrial FDM + SLS Post-Processing',
      'Tolerance Class': 'ISO 2768-m (±0.04 mm)',
      'Heat Deflection': '114°C at 0.45 MPa',
      'Material Base': 'Carbon-Fiber Reinforced PETG & PA12 Nylon',
      'Total Mass': '1,420 grams',
    },
  },
  'bionic-5-axis-robotic-gripper': {
    id: 'prod-02',
    sku: 'OX-CYB-ARM',
    name: 'Bionic 5-Axis Robotic Gripper',
    tagline: 'Parametric Mechanical End-Effector',
    description:
      'Engineered for robotics developers. Features high-torque compliant TPU finger pads and heat-staked brass threaded inserts.',
    base_price: 185.0,
    discount_percent: 0,
    tags: ['Robotics', 'TPU Compliant', 'Prototyping'],
    angles: [
      {
        label: 'Actuator Overview',
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        caption: 'High-torque linkage with integrated cable runners',
      },
      {
        label: 'Fingertip Compliant Pads',
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
        caption: '95A Shore TPU co-printed contact cushions',
      },
      {
        label: 'Gearbox Interface',
        url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1200&q=80',
        caption: 'Direct mount for DS3218 metal-gear servos',
      },
    ],
    specs: {
      'Max Grip Force': '1.8 kg Dynamic',
      'Operating Voltage': '5V - 12V Logic',
      'Joint Backlash': '< 0.08°',
      'Material Composition': 'High-Impact ASA + Shore 95A TPU',
      'Assembly Status': 'Pre-calibrated with stainless hardware',
    },
  },
  'precision-optical-sensor-bench': {
    id: 'prod-03',
    sku: 'OX-TEST-RIG',
    name: 'Precision Optical Sensor Bench',
    tagline: 'Lab Metrology & Calibration Stage',
    description:
      'Resin-cured ultra-dense chassis eliminating vibration harmonics during high-speed laser sensor testing.',
    base_price: 320.0,
    discount_percent: 10,
    tags: ['Metrology', 'Engineering Resin', 'Lab Equipment'],
    angles: [
      {
        label: 'Calibration Bed',
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
        caption: 'M6 optical matrix with 25mm grid spacing',
      },
      {
        label: 'Surface Finish Close-up',
        url: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=1200&q=80',
        caption: 'Zero layer striation under 18-micron SLA UV cure',
      },
    ],
    specs: {
      'XY Resolution': '18 Microns',
      'Resin Formula': 'Rigid Ceramic-Infused Photopolymer',
      'Grid Dimension': '200 x 200 mm Array',
      'Thermal Drift': '< 0.005 mm/°C',
    },
  },
};

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { addToCart } = useCart();

  const product = PRODUCTS_DATA[slug];

  const [activeAngleIndex, setActiveAngleIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center font-mono">
        <h1 className="text-2xl text-white">Product Spec Not Found</h1>
        <Link href="/products" className="mt-4 inline-block text-xs text-orvix-crimson-bright underline">
          &larr; Return to Catalog
        </Link>
      </div>
    );
  }

  const discount = product.discount_percent || 0;
  const unitPrice = discount > 0 ? product.base_price * (1 - discount / 100) : product.base_price;
  const currentAngle = product.angles[activeAngleIndex] || product.angles[0];

  const handleAdd = () => {
    addToCart({
      referenceId: product.id,
      itemType: 'product',
      title: product.name,
      sku: product.sku,
      unitPrice: unitPrice,
      quantity: quantity,
      image: product.angles[0].url,
      metadata: product.specs,
    });
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">

      {/* Breadcrumb Navigation */}
      <Link
        href="/products"
        className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-zinc-400 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Hardware Portfolio</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

        {/* Multi-Angle Inspection Stage */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Inspection Viewport */}
          <div className="relative aspect-[4/3] w-full border border-orvix-border bg-black overflow-hidden group">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeAngleIndex}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative h-full w-full"
              >
                <Image
                  src={currentAngle.url}
                  alt={currentAngle.label}
                  fill
                  priority
                  className="object-cover"
                />
              </motion.div>
            </AnimatePresence>

            {/* Overlays */}
            <div className="absolute top-3 left-3 flex items-center gap-2 border border-orvix-border bg-black/80 px-3 py-1 font-mono text-[10px] text-zinc-300">
              <span className="h-1.5 w-1.5 rounded-full bg-orvix-crimson-bright" />
              <span>ANGLE: {currentAngle.label.toUpperCase()}</span>
            </div>

            <div className="absolute bottom-3 left-3 right-3 border border-orvix-border/70 bg-black/80 p-2.5 font-mono text-[10px] text-zinc-400">
              {currentAngle.caption}
            </div>
          </div>

          {/* Angle Selector Thumbnails */}
          <div className="grid grid-cols-4 gap-3">
            {product.angles.map((angle: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setActiveAngleIndex(idx)}
                className={`relative aspect-video border text-left overflow-hidden transition-all ${
                  activeAngleIndex === idx
                    ? 'border-orvix-crimson-bright ring-1 ring-orvix-crimson-bright'
                    : 'border-orvix-border opacity-60 hover:opacity-100'
                }`}
              >
                <Image src={angle.url} alt={angle.label} fill className="object-cover" />
                <div className="absolute inset-0 bg-black/40" />
                <span className="absolute bottom-1 left-1 font-mono text-[8px] text-white uppercase font-bold px-1 bg-black/70 truncate max-w-[90%]">
                  {angle.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Specifications & Ordering Hub */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <span className="font-mono text-xs uppercase tracking-widest text-orvix-crimson-bright">
              SKU: {product.sku}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              {product.name}
            </h1>
            <p className="font-serif text-sm text-zinc-400 italic">
              {product.tagline}
            </p>
          </div>

          <div className="flex items-baseline gap-3 border-y border-orvix-border py-4 font-mono">
            <span className="text-3xl font-bold text-white">${unitPrice.toFixed(2)}</span>
            {discount > 0 && (
              <>
                <span className="text-sm text-zinc-500 line-through">
                  ${product.base_price.toFixed(2)}
                </span>
                <span className="text-xs text-orvix-crimson-bright font-bold">
                  ({discount}% OFF LIMITED)
                </span>
              </>
            )}
          </div>

          <p className="font-serif text-xs text-zinc-300 leading-relaxed">
            {product.description}
          </p>

          {/* Engineering Specifications Matrix */}
          <div className="border border-orvix-border bg-orvix-dark p-4 space-y-2.5 font-mono text-xs">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest block border-b border-orvix-border pb-2">
              FABRICATION METRICS
            </span>
            {Object.entries(product.specs).map(([key, val]) => (
              <div key={key} className="flex justify-between items-center text-[11px]">
                <span className="text-zinc-500 uppercase">{key}:</span>
                <span className="text-white font-medium">{String(val)}</span>
              </div>
            ))}
          </div>

          {/* Quantity & Order Dispatch Button */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-orvix-border bg-black font-mono text-xs">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-zinc-400 hover:text-white"
                >
                  -
                </button>
                <span className="px-3 text-white font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 text-zinc-400 hover:text-white"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAdd}
                className="flex-1 flex items-center justify-center gap-2 border border-orvix-crimson-bright bg-orvix-crimson py-3 font-mono text-xs uppercase tracking-wider text-white shadow-crimson-glow hover:bg-orvix-crimson-bright transition-all"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>{addedAnimation ? 'STAGED TO BUFFER ✓' : 'Add to Fabrication Order'}</span>
              </button>
            </div>

            <p className="font-mono text-[9px] text-zinc-500 text-center uppercase tracking-widest">
              Direct B2B Dispatch &bull; WhatsApp Serialization Available at Checkout
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
