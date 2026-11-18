import React from 'react';
import { Zap, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-400" />
            <span className="text-lg font-semibold text-white">EV ChargePoint</span>
            <span className="text-xs text-slate-500 ml-2">Next.js + Express + MongoDB</span>
          </div>

          <p className="text-xs text-slate-500 flex items-center gap-1">
            Built with modern CI/CD architecture &bull; Phase 1 Initialized
          </p>

          <div className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} EV ChargePoint System. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
