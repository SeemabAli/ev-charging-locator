import React from 'react';
import Link from 'next/link';
import { Zap, ArrowUpRight, ShieldCheck, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-navy text-white pt-16 pb-12 border-t border-navy-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-navy-light">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-lime flex items-center justify-center text-navy shadow-md">
                <Zap className="w-5 h-5 fill-navy" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                EV <span className="text-lime">ChargePoint</span>
              </span>
            </div>
            <p className="text-xs text-muted-text leading-relaxed">
              Next-generation electric vehicle mobility platform. Instant station discovery, charger specification audit, and collision-free slot reservations.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2 text-xs text-muted-text">
              <li>
                <Link href="/stations" className="hover:text-lime transition flex items-center gap-1">
                  Find Stations <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-lime transition">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-lime transition">
                  Driver Dashboard
                </Link>
              </li>
              <li>
                <Link href="/operator" className="hover:text-lime transition">
                  Operator Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Operators & Partners */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Partners</h4>
            <ul className="space-y-2 text-xs text-muted-text">
              <li>
                <Link href="/register" className="hover:text-lime transition flex items-center gap-1">
                  Become a Station Partner <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link href="/#operator-benefits" className="hover:text-lime transition">
                  Host Benefits
                </Link>
              </li>
              <li>
                <Link href="/operator" className="hover:text-lime transition">
                  Slot Management Tool
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-lime transition">
                  Admin Verification
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Get in Touch</h4>
            <div className="space-y-2 text-xs text-muted-text">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-lime" />
                <span>support@evchargepoint.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-lime" />
                <span>+1 (800) 555-EV-CHARGE</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-lime" />
                <span>Metro City Innovation Hub</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-text">
          <p>&copy; {new Date().getFullYear()} EV ChargePoint Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-white transition cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white transition cursor-pointer">Terms of Service</span>
            <span className="hover:text-white transition cursor-pointer">Security Audits</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
