// app/auth/login/page.tsx
'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/providers/auth-provider';
import { industrialFadeUp, staggerContainer } from '@/lib/motion';
import { ShieldAlert, ArrowRight, Loader2 } from 'lucide-react';

function LoginContent() {
  const { signInWithGoogle } = useAuth();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';
  const errorParam = searchParams.get('error');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    try {
      setSubmitting(true);
      await signInWithGoogle(redirectTo);
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-12">
      {/* Decorative technical backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-radial-gradient-dark opacity-60" />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md border border-orvix-border bg-orvix-dark/95 p-8 shadow-2xl backdrop-blur-md"
      >
        {/* Hardware Corner Accent */}
        <div className="absolute top-0 right-0 h-4 w-4 border-t-2 border-r-2 border-orvix-crimson-bright" />
        <div className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-orvix-crimson-bright" />

        <div className="space-y-6">
          <motion.div variants={industrialFadeUp} className="space-y-2">
            <span className="font-mono text-[10px] tracking-widest uppercase text-orvix-crimson-bright">
              // SECURE ACCESS GATEWAY
            </span>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-white">
              Authenticate Terminal
            </h1>
            <p className="font-serif text-xs text-zinc-400 leading-relaxed">
              Sign in with your verified Google identity to review production orders, submit technical specifications, or access client portals.
            </p>
          </motion.div>

          {errorParam && (
            <motion.div
              variants={industrialFadeUp}
              className="flex items-center gap-3 border border-orvix-border-crimson bg-orvix-crimson/10 p-3 text-xs text-red-300"
            >
              <ShieldAlert className="h-4 w-4 text-orvix-crimson-bright shrink-0" />
              <span>Authentication failed. Verify credentials and try again.</span>
            </motion.div>
          )}

          {/* Primary Action Button */}
          <motion.div variants={industrialFadeUp} className="pt-2">
            <button
              onClick={handleLogin}
              disabled={submitting}
              className="group relative flex w-full items-center justify-between border border-orvix-border-crimson bg-orvix-panel px-5 py-3.5 font-mono text-xs uppercase tracking-wider text-white transition-all hover:border-orvix-crimson-bright hover:bg-orvix-crimson/20 disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                {/* Minimal Google Icon */}
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{submitting ? 'Redirecting to Google...' : 'Continue with Google'}</span>
              </div>
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin text-orvix-crimson-bright" />
              ) : (
                <ArrowRight className="h-4 w-4 text-orvix-crimson transition-transform group-hover:translate-x-1 group-hover:text-orvix-crimson-bright" />
              )}
            </button>
          </motion.div>

          <motion.div variants={industrialFadeUp} className="border-t border-orvix-border/50 pt-4 text-center">
            <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
              Orvix Lab Security Protocol &bull; Strict RLS Active
            </span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <LoginContent />
    </Suspense>
  );
}
