'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Zap,
  UserPlus,
  AlertCircle,
  Loader2,
  CheckCircle2,
  User,
  Mail,
  Phone,
  Lock,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'user' | 'operator'>('user');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    const res = await register({
      name,
      email,
      phone,
      password,
      role,
    });
    setLoading(false);

    if (res.success) {
      if (role === 'operator') {
        router.push('/operator');
      } else {
        router.push('/dashboard');
      }
    } else {
      setError(res.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] grid grid-cols-1 lg:grid-cols-12 bg-white">
      {/* Left: Clean Form Side (7 cols) */}
      <div className="lg:col-span-7 flex items-center justify-center p-8 sm:p-12 lg:p-16">
        <div className="max-w-md w-full space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mint text-navy text-xs font-bold uppercase">
              <Zap className="w-3.5 h-3.5 fill-navy" /> Join EV ChargePoint
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
              Create an Account
            </h1>
            <p className="text-xs sm:text-sm text-muted-text">
              Select your role and start reserving or hosting EV charging bays
            </p>
          </div>

          {/* Role Selection Buttons */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-light-bg rounded-2xl border border-border">
            <button
              type="button"
              onClick={() => setRole('user')}
              className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                role === 'user'
                  ? 'bg-navy text-lime shadow-sm'
                  : 'text-dark-text hover:text-navy'
              }`}
            >
              🚗 EV Driver
            </button>
            <button
              type="button"
              onClick={() => setRole('operator')}
              className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                role === 'operator'
                  ? 'bg-navy text-lime shadow-sm'
                  : 'text-dark-text hover:text-navy'
              }`}
            >
              ⚡ Station Operator
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-danger text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-danger shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-dark-text font-semibold mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-muted-text absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Johnson"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-navy text-dark-text"
                />
              </div>
            </div>

            <div>
              <label className="block text-dark-text font-semibold mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-text absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-navy text-dark-text"
                />
              </div>
            </div>

            <div>
              <label className="block text-dark-text font-semibold mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-muted-text absolute left-3.5 top-3" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 019-2834"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-navy text-dark-text"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-dark-text font-semibold mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted-text absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-navy text-dark-text"
                  />
                </div>
              </div>

              <div>
                <label className="block text-dark-text font-semibold mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted-text absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-navy text-dark-text"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-lime hover:bg-lime-hover text-navy font-bold text-xs shadow-md shadow-lime/20 transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {loading
                ? 'Creating account...'
                : `Register as ${role === 'user' ? 'EV Driver' : 'Station Operator'}`}
            </button>
          </form>

          <div className="text-center text-xs text-muted-text pt-3 border-t border-border">
            Already have an account?{' '}
            <Link href="/login" className="text-navy font-bold hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* Right: EV Visual Showcase Side (5 cols) */}
      <div className="hidden lg:flex lg:col-span-5 bg-navy text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-lime/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-lime flex items-center justify-center text-navy shadow-lg">
            <Zap className="w-6 h-6 fill-navy" />
          </div>
          <h3 className="text-2xl font-black text-white">Join the Mobility Revolution</h3>
          <p className="text-xs text-muted-text leading-relaxed">
            Whether you charge your personal EV or run a commercial fast-charging hub, EV ChargePoint gives you real-time transparency and control.
          </p>
        </div>

        <div className="relative z-10 space-y-3 bg-navy-light/70 border border-navy-light p-6 rounded-3xl text-xs">
          <div className="font-bold text-lime">Account Benefits:</div>
          <div className="flex items-center gap-2 text-muted-text">
            <CheckCircle2 className="w-4 h-4 text-lime" />
            <span className="text-white">Drivers: Reserve slots in advance & avoid queues</span>
          </div>
          <div className="flex items-center gap-2 text-muted-text">
            <CheckCircle2 className="w-4 h-4 text-lime" />
            <span className="text-white">Operators: Define custom hourly rates & time slots</span>
          </div>
          <div className="flex items-center gap-2 text-muted-text">
            <CheckCircle2 className="w-4 h-4 text-lime" />
            <span className="text-white">Admins: Verify and supervise physical stations</span>
          </div>
        </div>

        <div className="relative z-10 text-[11px] text-muted-text">
          &copy; {new Date().getFullYear()} EV ChargePoint Inc.
        </div>
      </div>
    </div>
  );
}
