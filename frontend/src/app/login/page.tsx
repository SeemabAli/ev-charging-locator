'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Zap,
  LogIn,
  AlertCircle,
  Loader2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Mail,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, quickLoginAs } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      router.push('/dashboard');
    } else {
      setError(res.message || 'Invalid email or password');
    }
  };

  const handleQuickLogin = async (role: 'user' | 'operator' | 'admin') => {
    setLoading(true);
    await quickLoginAs(role);
    setLoading(false);
    if (role === 'admin') router.push('/admin');
    else if (role === 'operator') router.push('/operator');
    else router.push('/dashboard');
  };

  return (
    <div className="min-h-[calc(100vh-80px)] grid grid-cols-1 lg:grid-cols-12 bg-white">
      {/* Left: Clean Form Side (7 cols) */}
      <div className="lg:col-span-7 flex items-center justify-center p-8 sm:p-12 lg:p-16">
        <div className="max-w-md w-full space-y-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mint text-navy text-xs font-bold uppercase">
              <Zap className="w-3.5 h-3.5 fill-navy" /> Secure Driver Access
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
              Welcome back
            </h1>
            <p className="text-xs sm:text-sm text-muted-text">
              Sign in to manage your charging reservations and review active sessions
            </p>
          </div>

          {/* Quick Demo Pill */}
          <div className="bg-light-bg border border-border rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-dark-text">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-warning" /> 1-Click Fast Login:
              </span>
              <span className="text-[11px] text-muted-text font-normal">Pre-seeded demo</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('user')}
                className="py-2 px-2 bg-white hover:bg-lime/20 text-navy border border-border rounded-xl text-xs font-bold shadow-2xs transition"
              >
                EV Driver
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('operator')}
                className="py-2 px-2 bg-white hover:bg-lime/20 text-navy border border-border rounded-xl text-xs font-bold shadow-2xs transition"
              >
                Operator
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="py-2 px-2 bg-white hover:bg-lime/20 text-navy border border-border rounded-xl text-xs font-bold shadow-2xs transition"
              >
                Admin
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-danger text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-danger shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-dark-text font-semibold mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-text absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="driver@evcharge.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-navy text-dark-text"
                />
              </div>
            </div>

            <div>
              <label className="block text-dark-text font-semibold mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-text absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-navy text-dark-text"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-muted-text">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-navy focus:ring-0"
                />
                Remember me
              </label>

              <span className="text-muted-text hover:text-navy cursor-pointer">
                Forgot password?
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-lime hover:bg-lime-hover text-navy font-bold text-xs shadow-md shadow-lime/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="text-center text-xs text-muted-text pt-4 border-t border-border">
            Don't have an account?{' '}
            <Link href="/register" className="text-navy font-bold hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>

      {/* Right: EV-Themed Visual Showcase Side (5 cols) */}
      <div className="hidden lg:flex lg:col-span-5 bg-navy text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-lime/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-lime flex items-center justify-center text-navy shadow-lg">
            <Zap className="w-6 h-6 fill-navy" />
          </div>
          <h3 className="text-2xl font-black text-white">Smart Electric Charging</h3>
          <p className="text-xs text-muted-text leading-relaxed">
            Connect to high-speed charging corridors across the nation with zero waiting and full reliability.
          </p>
        </div>

        <div className="relative z-10 space-y-4 bg-navy-light/70 border border-navy-light p-6 rounded-3xl">
          <div className="flex items-center justify-between text-xs">
            <span className="text-lime font-bold">Network Overview</span>
            <span className="text-[10px] text-muted-text font-medium">Real-time status</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-lime" />
              <span>Zero-collision atomic slot reservation</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-lime" />
              <span>Ultra-fast 350kW CCS 2 & CHAdeMO support</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-lime" />
              <span>One-click booking cancellations</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-[11px] text-muted-text">
          &copy; {new Date().getFullYear()} EV ChargePoint Mobility Platform.
        </div>
      </div>
    </div>
  );
}
