'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Zap,
  MapPin,
  Calendar,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Navigation,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  BatteryCharging,
  TrendingUp,
  Sliders,
  DollarSign,
  Smartphone,
  Layers,
} from 'lucide-react';

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [quickCity, setQuickCity] = useState('');

  const faqs = [
    {
      q: 'How does EV ChargePoint guarantee no double-booking?',
      a: 'We use database-level atomic locking with partial unique indexes on our MongoDB cluster. When you click reserve, the slot is locked instantaneously at the database level so two drivers can never book the exact same slot.',
    },
    {
      q: 'What types of EV charging connectors are supported?',
      a: 'Our network supports all major electric vehicle standards including CCS 2 (DC Fast), CHAdeMO (DC), Type 2 (Mennekes AC), Tesla Destination, and GB/T standards.',
    },
    {
      q: 'Can I cancel my reservation if my plans change?',
      a: 'Yes. Drivers can cancel their upcoming reservations anytime through the "My Bookings" dashboard with a single click. The slot is immediately released back to the community pool.',
    },
    {
      q: 'How can station owners register their chargers on the platform?',
      a: 'Station operators can sign up for an Operator account, register their hub location and coordinates, add charging points, and define custom operating hours and slot pricing.',
    },
    {
      q: 'Is there any fee to find stations on the interactive map?',
      a: 'Finding stations and viewing real-time availability on our interactive Leaflet map is 100% free for all EV drivers.',
    },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* 1. Catchy Hero Section */}
      <section className="relative bg-navy text-white overflow-hidden pt-12 pb-24 border-b border-navy-light">
        {/* Subtle electric ambient glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-lime/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-mint/5 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-navy-light border border-navy-light/80 text-lime text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-lime" /> NEXT-GEN ELECTRIC MOBILITY
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
                Power Your Journey. <br />
                <span className="text-lime">Charge Smarter.</span>
              </h1>

              <p className="text-base sm:text-lg text-muted-text max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Locate high-speed charging hubs, verify connector compatibility, and guarantee your charging slot before you arrive. Zero wait times, zero double-booking conflicts.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/stations"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-lime hover:bg-lime-hover text-navy font-black text-sm shadow-lg shadow-lime/20 transition transform active:scale-95 flex items-center justify-center gap-2"
                >
                  <Navigation className="w-4 h-4 fill-navy" />
                  Find Charging Stations
                </Link>

                <Link
                  href="/register"
                  className="w-full sm:w-auto px-7 py-4 rounded-xl bg-navy-light hover:bg-navy-light/80 text-white font-bold text-sm border border-navy-light transition flex items-center justify-center gap-2"
                >
                  Become a Station Partner
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Live Metric Badges */}
              <div className="pt-8 grid grid-cols-3 gap-4 border-t border-navy-light/80 max-w-md mx-auto lg:mx-0">
                <div>
                  <div className="text-2xl font-black text-white">99.9%</div>
                  <div className="text-[11px] text-muted-text font-medium">Uptime Guarantee</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-lime">0 ms</div>
                  <div className="text-[11px] text-muted-text font-medium">Slot Collision Rate</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white">350 kW</div>
                  <div className="text-[11px] text-muted-text font-medium">Ultra-Fast Charging</div>
                </div>
              </div>
            </div>

            {/* Right Visual Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md bg-navy-light border border-navy-light/90 rounded-3xl p-6 shadow-2xl space-y-5 text-left">
                <div className="flex justify-between items-center pb-4 border-b border-navy/50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-lime/10 text-lime flex items-center justify-center font-bold">
                      <Zap className="w-5 h-5 fill-lime" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Metro Central SuperHub</h4>
                      <p className="text-[11px] text-muted-text flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-lime" /> Downtown Plaza &bull; 1.2 km away
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-lime/20 text-lime text-[10px] font-extrabold uppercase">
                    3/4 Available
                  </span>
                </div>

                {/* Simulated Charger Bay List */}
                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-navy/80 border border-navy flex justify-between items-center text-xs">
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-lime" />
                        Bay 01 &bull; CCS 2 DC Fast
                      </div>
                      <div className="text-[11px] text-muted-text">150 kW &bull; $0.42 / kWh</div>
                    </div>
                    <span className="text-xs font-bold text-lime">Ready to Reserve</span>
                  </div>

                  <div className="p-3 rounded-xl bg-navy/80 border border-navy flex justify-between items-center text-xs">
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-lime" />
                        Bay 02 &bull; CHAdeMO Fast
                      </div>
                      <div className="text-[11px] text-muted-text">50 kW &bull; $0.35 / kWh</div>
                    </div>
                    <span className="text-xs font-bold text-lime">Ready to Reserve</span>
                  </div>

                  <div className="p-3 rounded-xl bg-navy/80 border border-navy flex justify-between items-center text-xs opacity-60">
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-muted-text" />
                        Bay 03 &bull; Type 2 AC Destination
                      </div>
                      <div className="text-[11px] text-muted-text">22 kW &bull; In Use until 14:30</div>
                    </div>
                    <span className="text-xs font-semibold text-muted-text">Occupied</span>
                  </div>
                </div>

                {/* Mini Slot Selector Preview */}
                <div className="pt-2">
                  <div className="text-[11px] text-muted-text font-semibold uppercase mb-2">
                    Available Today:
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                    <span className="p-2 rounded-lg bg-lime text-navy cursor-pointer">
                      15:00 - 16:00
                    </span>
                    <span className="p-2 rounded-lg bg-navy text-muted-text border border-navy-light">
                      16:00 - 17:00
                    </span>
                    <span className="p-2 rounded-lg bg-navy text-muted-text border border-navy-light">
                      17:00 - 18:00
                    </span>
                  </div>
                </div>

                <Link
                  href="/stations"
                  className="block w-full text-center py-3 rounded-xl bg-lime text-navy font-bold text-xs hover:bg-lime-hover transition"
                >
                  Explore All Nearby Hubs &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. How EV ChargePoint Works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-widest text-navy bg-mint px-3 py-1 rounded-full">
            Effortless Mobility
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
            How EV ChargePoint Works
          </h2>
          <p className="text-sm text-muted-text">
            Three simple steps to seamless, stress-free electric vehicle charging.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-white rounded-3xl p-8 border border-border shadow-sm space-y-4 hover:border-navy transition group">
            <div className="w-14 h-14 rounded-2xl bg-light-bg text-navy flex items-center justify-center font-black text-xl group-hover:bg-navy group-hover:text-lime transition-colors">
              01
            </div>
            <h3 className="text-xl font-bold text-navy">Locate Nearby Hubs</h3>
            <p className="text-xs text-muted-text leading-relaxed">
              Use our live OpenStreetMap interface or your browser geolocation to discover verified fast-charging stations within driving radius.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-3xl p-8 border border-border shadow-sm space-y-4 hover:border-navy transition group">
            <div className="w-14 h-14 rounded-2xl bg-light-bg text-navy flex items-center justify-center font-black text-xl group-hover:bg-navy group-hover:text-lime transition-colors">
              02
            </div>
            <h3 className="text-xl font-bold text-navy">Lock Your Time Slot</h3>
            <p className="text-xs text-muted-text leading-relaxed">
              Choose your vehicle connector (CCS 2, CHAdeMO, Type 2) and select an available 1-hour window. Our database locks the slot instantly.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-3xl p-8 border border-border shadow-sm space-y-4 hover:border-navy transition group">
            <div className="w-14 h-14 rounded-2xl bg-light-bg text-navy flex items-center justify-center font-black text-xl group-hover:bg-navy group-hover:text-lime transition-colors">
              03
            </div>
            <h3 className="text-xl font-bold text-navy">Arrive, Plug & Power Up</h3>
            <p className="text-xs text-muted-text leading-relaxed">
              Drive straight into your reserved bay without waiting in line. Monitor your session and manage your history from your personal dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Interactive Station Search Quick Jump */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-navy rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="text-xs font-bold text-lime uppercase tracking-widest">
              Live Network
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight">
              Ready to find a charging hub right now?
            </h2>
            <p className="text-xs sm:text-sm text-muted-text">
              Enter your city or area to view live station markers, charger capacity, and real-time open bays.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                window.location.href = `/stations?city=${encodeURIComponent(quickCity)}`;
              }}
              className="flex flex-col sm:flex-row gap-3 pt-2"
            >
              <div className="relative flex-grow">
                <MapPin className="w-4 h-4 text-muted-text absolute left-4 top-3.5" />
                <input
                  type="text"
                  placeholder="Enter city (e.g. Metro City)..."
                  value={quickCity}
                  onChange={(e) => setQuickCity(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-navy-light border border-navy-light text-white text-xs placeholder:text-muted-text focus:outline-none focus:border-lime"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-lime hover:bg-lime-hover text-navy font-bold text-xs transition"
              >
                Search Stations
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 4. Why Choose EV ChargePoint */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-widest text-navy bg-mint px-3 py-1 rounded-full">
            Engineering Excellence
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
            Why Choose EV ChargePoint
          </h2>
          <p className="text-sm text-muted-text">
            Engineered for high-reliability EV charging networks with enterprise-grade safeguards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-border shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-mint text-navy flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 text-navy" />
            </div>
            <h4 className="font-bold text-navy text-base">Guaranteed Slot Lock</h4>
            <p className="text-xs text-muted-text leading-relaxed">
              Database-level atomic operations guarantee your reserved slot can never be double-booked by other drivers.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-border shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-mint text-navy flex items-center justify-center font-bold">
              <Navigation className="w-5 h-5 text-navy" />
            </div>
            <h4 className="font-bold text-navy text-base">Geospatial Precision</h4>
            <p className="text-xs text-muted-text leading-relaxed">
              Integrated with Leaflet and MongoDB 2dsphere indexing for high-precision distance calculations and directions.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-border shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-mint text-navy flex items-center justify-center font-bold">
              <BatteryCharging className="w-5 h-5 text-navy" />
            </div>
            <h4 className="font-bold text-navy text-base">Universal Fast Charging</h4>
            <p className="text-xs text-muted-text leading-relaxed">
              Full compatibility with CCS 2, CHAdeMO, Type 2, Tesla Destination, and ultra-fast DC dispensers up to 350kW.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-border shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-mint text-navy flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5 text-navy" />
            </div>
            <h4 className="font-bold text-navy text-base">Mobile-First UI</h4>
            <p className="text-xs text-muted-text leading-relaxed">
              Responsive experience whether navigating from your vehicle infotainment browser, tablet, or smartphone.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Benefits for Station Operators */}
      <section id="operator-benefits" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-border p-8 sm:p-14 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-extrabold uppercase tracking-widest text-navy bg-mint px-3 py-1 rounded-full">
              For Station Owners & CPOs
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight leading-tight">
              Turn your EV chargers into a predictable, automated revenue stream.
            </h2>
            <p className="text-sm text-muted-text leading-relaxed">
              Join the EV ChargePoint network to eliminate unoccupied charging bays, manage driver bookings in real time, and adjust hourly slot availability with our operator suite.
            </p>

            <div className="space-y-3 text-xs text-dark-text font-medium">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>1-Click Daily Slot Generation tool</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>Real-time driver reservation status manager</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>Custom kWh pricing and connector power configuration</span>
              </div>
            </div>

            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-navy text-lime font-bold text-xs hover:bg-navy-light transition"
            >
              Register as an Operator <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Operator Preview graphic */}
          <div className="bg-light-bg rounded-2xl p-6 border border-border space-y-4">
            <div className="flex justify-between items-center text-xs font-bold text-navy">
              <span>Operator Fleet Status</span>
              <span className="text-success flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-success" /> Live
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="p-4 rounded-xl bg-white border border-border">
                <div className="text-[11px] text-muted-text">Daily Utilization</div>
                <div className="text-xl font-black text-navy mt-1">87.4%</div>
              </div>
              <div className="p-4 rounded-xl bg-white border border-border">
                <div className="text-[11px] text-muted-text">Active Reservoirs</div>
                <div className="text-xl font-black text-navy mt-1">12 Slots</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-border space-y-2 text-xs">
              <div className="font-bold text-navy">Quick Batch Generator</div>
              <p className="text-[11px] text-muted-text">
                Automatically partition 08:00 to 22:00 into guaranteed 1-hour customer slots.
              </p>
              <div className="w-full py-2 rounded-lg bg-navy text-lime text-center font-bold text-[11px]">
                Slots Active For Today
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Frequently Asked Questions */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-navy bg-mint px-3 py-1 rounded-full">
            Knowledge Base
          </span>
          <h2 className="text-3xl font-extrabold text-navy tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-border overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex justify-between items-center gap-4 text-sm font-bold text-navy"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-muted-text shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-text shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-muted-text leading-relaxed border-t border-border/50 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. Bottom Conversion Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-navy rounded-3xl p-10 sm:p-14 text-center text-white space-y-6 relative overflow-hidden shadow-2xl">
          <div className="max-w-xl mx-auto space-y-3 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Ready to eliminate EV charging anxiety?
            </h2>
            <p className="text-xs sm:text-sm text-muted-text">
              Join drivers and station operators using EV ChargePoint for guaranteed charging reservations.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 relative z-10">
            <Link
              href="/register"
              className="px-8 py-3.5 rounded-xl bg-lime hover:bg-lime-hover text-navy font-black text-xs shadow-md transition"
            >
              Create Free Account
            </Link>
            <Link
              href="/stations"
              className="px-8 py-3.5 rounded-xl bg-navy-light hover:bg-navy-light/80 text-white font-bold text-xs border border-navy-light transition"
            >
              Browse Open Stations
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
