'use client';

import React, { useState } from 'react';
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
  LayoutDashboard,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, quickLoginAs } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E6EBE6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-navy flex items-center justify-center text-lime shadow-md transition-transform group-hover:scale-105">
              <Zap className="w-5 h-5 fill-lime" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-navy tracking-tight leading-none">
                EV <span className="text-navy">ChargePoint</span>
              </span>
              <span className="text-[10px] font-semibold text-muted-text tracking-widest uppercase mt-0.5">
                Electric Mobility
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-dark-text">
            <Link
              href="/"
              className={`hover:text-navy transition-colors ${
                pathname === '/' ? 'text-navy font-bold' : 'text-muted-text'
              }`}
            >
              Home
            </Link>
            <Link
              href="/stations"
              className={`hover:text-navy transition-colors ${
                pathname === '/stations' ? 'text-navy font-bold' : 'text-muted-text'
              }`}
            >
              Find Stations
            </Link>
            <Link
              href="/#how-it-works"
              className="text-muted-text hover:text-navy transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/#about"
              className="text-muted-text hover:text-navy transition-colors"
            >
              About
            </Link>
            {user && (
              <Link
                href="/dashboard"
                className={`flex items-center gap-1.5 hover:text-navy transition-colors ${
                  pathname === '/dashboard' ? 'text-navy font-bold' : 'text-muted-text'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-navy" />
                Dashboard
              </Link>
            )}
            {(user?.role === 'operator' || user?.role === 'admin') && (
              <Link
                href="/operator"
                className={`flex items-center gap-1.5 hover:text-navy transition-colors ${
                  pathname === '/operator' ? 'text-navy font-bold' : 'text-muted-text'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                Operator
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link
                href="/admin"
                className={`flex items-center gap-1.5 hover:text-navy transition-colors ${
                  pathname === '/admin' ? 'text-navy font-bold' : 'text-muted-text'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Admin
              </Link>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Quick Demo Switcher Pill */}
            <div className="flex items-center bg-light-bg border border-border px-2 py-1 rounded-full text-xs">
              <span className="text-muted-text text-[11px] font-medium mr-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-warning" /> Demo:
              </span>
              <button
                onClick={() => quickLoginAs('user')}
                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition ${
                  user?.role === 'user' ? 'bg-navy text-lime' : 'text-dark-text hover:text-navy'
                }`}
              >
                Driver
              </button>
              <button
                onClick={() => quickLoginAs('operator')}
                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition ${
                  user?.role === 'operator' ? 'bg-navy text-lime' : 'text-dark-text hover:text-navy'
                }`}
              >
                Operator
              </button>
              <button
                onClick={() => quickLoginAs('admin')}
                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition ${
                  user?.role === 'admin' ? 'bg-navy text-lime' : 'text-dark-text hover:text-navy'
                }`}
              >
                Admin
              </button>
            </div>

            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="flex flex-col text-right hover:opacity-80 transition"
                >
                  <span className="text-xs font-bold text-dark-text">{user.name}</span>
                  <span className="text-[10px] uppercase font-bold text-success tracking-wider">
                    {user.role}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-2 text-muted-text hover:text-danger hover:bg-rose-50 rounded-xl transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-xs font-semibold text-dark-text hover:text-navy transition"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 rounded-xl bg-lime hover:bg-lime-hover text-navy font-bold text-xs shadow-sm transition transform active:scale-95"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-dark-text hover:bg-light-bg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border space-y-3 bg-white">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-dark-text hover:bg-light-bg rounded-lg"
            >
              Home
            </Link>
            <Link
              href="/stations"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-dark-text hover:bg-light-bg rounded-lg"
            >
              Find Stations
            </Link>
            {user && (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-dark-text hover:bg-light-bg rounded-lg"
              >
                Dashboard
              </Link>
            )}
            <div className="pt-2 border-t border-border flex flex-col gap-2">
              {user ? (
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm font-semibold text-danger"
                >
                  Sign Out
                </button>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center px-4 py-2 rounded-xl border border-border text-xs font-semibold"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center px-4 py-2.5 rounded-xl bg-lime text-navy font-bold text-xs"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
