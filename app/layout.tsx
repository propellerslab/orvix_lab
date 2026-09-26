// app/layout.tsx
import type { Metadata } from 'next';
import { ptSerif, libertinusMono } from '@/lib/fonts';
import { Navbar } from '@/components/navigation/Navbar';
import { PageTransition } from '@/components/providers/page-transition';
import { AuthProvider } from '@/components/providers/auth-provider';
import { CartProvider } from '@/context/cart-context';
import { CartDrawer } from '@/components/cart/CartDrawer';
import './globals.css';

export const metadata: Metadata = {
  title: 'Orvix Lab | Custom 3D Printing & Physical Tech Systems',
  description:
    'Orvix Lab bridges digital problem-solving and physical manufacturing with custom 3D printed engineering and advanced hardware solutions.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${ptSerif.variable} ${libertinusMono.variable}`}>
      <body className="bg-[#FAFAFA] text-[#242424] font-serif antialiased min-h-screen flex flex-col tech-grid-bg">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <CartDrawer />
            <main className="flex-1">
              <PageTransition>{children}</PageTransition>
            </main>

          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );}
