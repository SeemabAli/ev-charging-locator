'use client';

import React from 'react';
import Link from 'next/link';
import { Zap, ShieldCheck, MapPin, Calendar, UserCheck } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Zap className="w-6 h-6 fill-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
                EV ChargePoint
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Phase 1 Foundation
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="#features" className="hover:text-emerald-600 transition-colors flex items-center gap-1.5">
              <MapPin className="w-4 h-4" /> Station Locator
            </Link>
            <Link href="#booking" className="hover:text-emerald-600 transition-colors flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> Slot Booking
            </Link>
            <Link href="#operator" className="hover:text-emerald-600 transition-colors flex items-center gap-1.5">
              <UserCheck className="w-4 h-4" /> Operators
            </Link>
            <Link href="#admin" className="hover:text-emerald-600 transition-colors flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Admin
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-emerald-600 transition">
              Log in
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition">
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
