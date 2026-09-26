// app/filaments/page.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, Thermometer, ShieldAlert, ShoppingCart, Check } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { industrialFadeUp, staggerContainer } from '@/lib/motion';

const INITIAL_FILAMENTS = [
  {
    id: 'fil-01',
    sku: 'OX-FIL-CF-PLA-01',
    brand: 'Orvix Industrial',
    name: 'Carbon-Fiber Reinforced PLA',
    slug: 'carbon-fiber-pla-175',
    material: 'CARBON_FIBER',
    diameter_mm: 1.75,
    weight_kg: 1.0,
    color_name: 'Stealth Matte Black',
    color_hex: '#181818',
    print_temp_min: 215,
    print_temp_max: 235,
    bed_temp_min: 50,
    bed_temp_max: 65,
    retail_price: 42.0,
    wholesale_price: 31.5,
    stock_spools: 84,
  },
  {
    id: 'fil-02',
    sku: 'OX-FIL-ASA-RED-02',
    brand: 'Orvix Industrial',
    name: 'UV-Stabilized High-Impact ASA',
    slug: 'uv-stabilized-asa-crimson',
    material: 'ASA',
    diameter_mm: 1.75,
    weight_kg: 1.0,
    color_name: 'Orvix Industrial Crimson',
    color_hex: '#BC0202',
    print_temp_min: 245,
    print_temp_max: 265,
    bed_temp_min: 90,
    bed_temp_max: 105,
    retail_price: 36.0,
    wholesale_price: 27.0,
    stock_spools: 120,
  },
  {
    id: 'fil-03',
    sku: 'OX-FIL-TPU95A-03',
    brand: 'Orvix Industrial',
    name: 'High-Rebound Elastic TPU 95A',
    slug: 'high-rebound-elastic-tpu',
    material: 'TPU',
    diameter_mm: 1.75,
    weight_kg: 1.0,
    color_name: 'Industrial Smoke Grey',
    color_hex: '#4A4A4A',
    print_temp_min: 220,
    print_temp_max: 240,
    bed_temp_min: 40,
    bed_temp_max: 60,
    retail_price: 38.0,
    wholesale_price: 28.5,
    stock_spools: 65,
  },
  {
    id: 'fil-04',
    sku: 'OX-FIL-PETG-WHT-04',
    brand: 'Orvix Industrial',
    name: 'Chemical-Resistant PETG-Pro',
    slug: 'chemical-resistant-petg-pro',
    material: 'PETG',
    diameter_mm: 1.75,
    weight_kg: 1.0,
    color_name: 'Titanium Cold White',
    color_hex: '#E5E5E5',
    print_temp_min: 230,
    print_temp_max: 250,
    bed_temp_min: 70,
    bed_temp_max: 85,
    retail_price: 28.0,
    wholesale_price: 20.0,
    stock_spools: 160,
  },
];

export default function FilamentsPage() {
  const { addToCart } = useCart();
  const [selectedMaterial, setSelectedMaterial] = useState<string>('ALL');

  const materials = ['ALL', 'CARBON_FIBER', 'ASA', 'TPU', 'PETG'];

  const filtered = selectedMaterial === 'ALL'
    ? INITIAL_FILAMENTS
    : INITIAL_FILAMENTS.filter((f) => f.material === selectedMaterial);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">

      {/* Telemetry Header */}
      <div className="border-b border-orvix-border pb-8">
        <div className="flex items-center gap-2 font-mono text-xs text-orvix-crimson-bright uppercase tracking-widest">
          <Layers className="h-4 w-4" />
          <span>// B2B FILAMENT SUPPLY PORTAL</span>
        </div>
        <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-white sm:text-6xl">
          Engineering Grade Filaments
        </h1>
        <p className="mt-3 max-w-2xl font-serif text-sm text-zinc-400">
          Formulated specifically for high-reliability automated print farms. Vacuum-sealed with desiccant, certified &plusmn;0.02 mm diameter tolerance.
        </p>

        {/* Filter Pills */}
        <div className="mt-8 flex flex-wrap gap-2">
          {materials.map((mat) => (
            <button
              key={mat}
              onClick={() => setSelectedMaterial(mat)}
              className={`border px-3 py-1 font-mono text-xs uppercase tracking-wider transition-colors ${
                selectedMaterial === mat
                  ? 'border-orvix-crimson-bright bg-orvix-crimson text-white'
                  : 'border-orvix-border bg-orvix-dark text-zinc-400 hover:border-zinc-500 hover:text-white'
              }`}
            >
              {mat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        key={selectedMaterial}
        className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4"
      >
        {filtered.map((item) => (
          <motion.div
            key={item.id}
            variants={industrialFadeUp}
            className="group relative flex flex-col justify-between border border-orvix-border bg-orvix-dark p-6 transition-all hover:border-orvix-crimson-bright"
          >
            <div>
              {/* Swatch & Identity Header */}
              <div className="flex items-center justify-between border-b border-orvix-border pb-4">
                <div className="flex items-center gap-2.5">
                  <div
                    className="h-5 w-5 border border-zinc-500 shadow-sm"
                    style={{ backgroundColor: item.color_hex }}
                  />
                  <span className="font-mono text-xs text-white font-semibold">{item.color_name}</span>
                </div>
                <span className="font-mono text-[10px] text-zinc-500">{item.color_hex}</span>
              </div>

              <div className="mt-4 space-y-1">
                <span className="font-mono text-[9px] uppercase tracking-widest text-orvix-crimson-bright">
                  {item.brand} &bull; {item.material}
                </span>
                <h2 className="font-serif text-lg font-bold text-white group-hover:text-orvix-crimson-bright transition-colors">
                  {item.name}
                </h2>
              </div>

              {/* Thermal & Physical Telemetry */}
              <div className="mt-5 space-y-2 border-t border-orvix-border/70 pt-4 font-mono text-[10px] text-zinc-300">
                <div className="flex justify-between">
                  <span className="text-zinc-500">DIAMETER / WT:</span>
                  <span>{item.diameter_mm}mm / {item.weight_kg}kg Spool</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">PRINT NOZZLE:</span>
                  <span className="flex items-center gap-1 text-zinc-200">
                    <Thermometer className="h-3 w-3 text-orvix-crimson-bright" />
                    {item.print_temp_min}&deg;C - {item.print_temp_max}&deg;C
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">HEATED BED:</span>
                  <span>{item.bed_temp_min}&deg;C - {item.bed_temp_max}&deg;C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">STOCK READY:</span>
                  <span className="text-emerald-400 font-semibold">{item.stock_spools} spools in depot</span>
                </div>
              </div>

              {/* B2B Wholesale Pricing Highlight */}
              <div className="mt-5 border border-orvix-border-crimson bg-orvix-panel/80 p-3">
                <div className="flex justify-between items-baseline font-mono">
                  <span className="text-[10px] text-zinc-400">Standard:</span>
                  <span className="text-sm font-bold text-white">Rs.{item.retail_price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-baseline font-mono mt-1">
                  <span className="text-[10px] text-orvix-crimson-bright font-semibold">B2B Volume (5+):</span>
                  <span className="text-base font-bold text-orvix-crimson-bright">Rs.{item.wholesale_price.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Quick Add Action */}
            <button
              onClick={() =>
                addToCart({
                  referenceId: item.id,
                  itemType: 'filament',
                  title: `${item.name} (${item.color_name})`,
                  sku: item.sku,
                  unitPrice: item.wholesale_price,
                  quantity: 1,
                  metadata: {
                    color: item.color_name,
                    hex: item.color_hex,
                    material: item.material,
                    diameter: item.diameter_mm,
                  },
                })
              }
              className="mt-6 flex w-full items-center justify-center gap-2 border border-orvix-border bg-orvix-panel py-2.5 font-mono text-xs uppercase tracking-wider text-black hover:border-orvix-crimson-bright hover:bg-orvix-crimson transition-all"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              <span>Add Spool to Order</span>
            </button>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
