'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Zap,
  MapPin,
  Calendar,
  UserCheck,
  ShieldCheck,
  LogOut,
  User as UserIcon,
  LogIn,
  Sparkles,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, quickLoginAs } = useAuth();

  const navLinks = [
    { href: '/stations', label: 'Find Stations', icon: MapPin },
    { href: '/my-bookings', label: 'My Bookings', icon: Calendar },
    ...(user?.role === 'operator' || user?.role === 'admin'
      ? [{ href: '/operator', label: 'Operator Portal', icon: UserCheck }]
      : []),
    ...(user?.role === 'admin'
      ? [{ href: '/admin', label: 'Admin Portal', icon: ShieldCheck }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Zap className="w-6 h-6 fill-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
                EV ChargePoint
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Phase 3 Active
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 transition-colors ${
                    isActive
                      ? 'text-emerald-600 font-semibold'
                      : 'text-slate-600 hover:text-emerald-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* User state and Quick Demo Switcher */}
          <div className="flex items-center gap-3">
            {/* Quick Demo Role Switcher */}
            <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-lg text-xs">
              <span className="text-slate-400 px-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> Demo:
              </span>
              <button
                onClick={() => quickLoginAs('user')}
                className={`px-2 py-1 rounded font-medium transition ${
                  user?.role === 'user'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Driver
              </button>
              <button
                onClick={() => quickLoginAs('operator')}
                className={`px-2 py-1 rounded font-medium transition ${
                  user?.role === 'operator'
                    ? 'bg-white text-teal-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Operator
              </button>
              <button
                onClick={() => quickLoginAs('admin')}
                className={`px-2 py-1 rounded font-medium transition ${
                  user?.role === 'admin'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Admin
              </button>
            </div>

            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-800">{user.name}</div>
                  <div className="text-[10px] uppercase font-semibold text-emerald-600 tracking-wider">
                    {user.role}
                  </div>
                </div>
                <button
                  onClick={logout}
                  title="Log out"
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-600 transition flex items-center gap-1"
                >
                  <LogIn className="w-3.5 h-3.5" /> Log in
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
