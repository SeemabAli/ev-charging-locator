'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Zap,
  Activity,
  Server,
  Database,
  MapPin,
  CalendarCheck,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Layers,
  Terminal,
  Navigation,
  Sparkles,
} from 'lucide-react';
import { fetchApiHealth, ApiHealthResponse } from '@/lib/api';

export default function HomePage() {
  const [apiHealth, setApiHealth] = useState<ApiHealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<string>('');

  const checkBackend = async () => {
    setLoading(true);
    const data = await fetchApiHealth();
    setApiHealth(data);
    setLastChecked(new Date().toLocaleTimeString());
    setLoading(false);
  };

  useEffect(() => {
    checkBackend();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-5 max-w-3xl mx-auto pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold tracking-wide uppercase">
          <Zap className="w-3.5 h-3.5 fill-emerald-600" /> Phase 3 Full-Stack Application Ready
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Smart Electric Vehicle <br />
          <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            Station Locator & Booking System
          </span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          Locate nearby charging stations in real-time on interactive maps, inspect charger connector types and power specifications, and reserve guaranteed time slots with zero collision.
        </p>

        {/* Hero Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/stations"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 transition"
          >
            <Navigation className="w-4 h-4" /> Find Nearby Stations
          </Link>
          <Link
            href="/operator"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-sm shadow-2xs transition"
          >
            Operator Dashboard
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-sm shadow-2xs transition"
          >
            Admin Governance
          </Link>
        </div>
      </div>

      {/* Backend Connection & Health Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-xl ${
                apiHealth ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}
            >
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Backend API Connection Status</h2>
              <p className="text-xs text-slate-500">
                Connected to Express RESTful API at{' '}
                <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono">
                  http://localhost:5000/api
                </code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={checkBackend}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Re-test Health
            </button>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                apiHealth
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  apiHealth ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'
                }`}
              />
              {apiHealth ? 'Backend Online' : 'Awaiting Backend Start'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
              <Server className="w-4 h-4 text-emerald-600" /> API Gateway
            </div>
            <div className="text-lg font-bold text-slate-800">
              {apiHealth?.service || 'Express Server'}
            </div>
            <div className="text-xs text-slate-500">
              {apiHealth
                ? `Status: ${apiHealth.status} (v${apiHealth.version})`
                : 'Run npm.cmd run dev in backend/'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
              <Database className="w-4 h-4 text-teal-600" /> Database Connection
            </div>
            <div className="text-lg font-bold text-slate-800">
              {apiHealth?.database?.connected ? 'MongoDB Connected' : 'Configured / Ready'}
            </div>
            <div className="text-xs text-slate-500">
              {apiHealth
                ? `DB Status: ${apiHealth.database.status}`
                : 'MongoDB Atlas URI in backend/.env'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
              <Terminal className="w-4 h-4 text-indigo-600" /> Maps & Geolocation
            </div>
            <div className="text-lg font-bold text-slate-800">Leaflet + OpenStreetMap</div>
            <div className="text-xs text-slate-500">
              Last probe: {lastChecked || 'Initial render'}
            </div>
          </div>
        </div>
      </div>

      {/* 3 Core Roles Section */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900">Functional Modules (Ready)</h2>
          <p className="text-sm text-slate-500">
            Tailored interfaces with Role-Based Access Control
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* EV User */}
          <Link
            href="/stations"
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-md transition group space-y-4 text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <MapPin className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 flex items-center justify-between">
                1. EV Driver Portal
                <ArrowRight className="w-4 h-4 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-slate-500">Customer Station Discovery & Reservations</p>
            </div>
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Geolocation & Leaflet Map station finder
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Filter by connector (Type 2, CCS, CHAdeMO)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Real-time slot booking with zero collision
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Booking history & cancellation
              </li>
            </ul>
          </Link>

          {/* Station Operator */}
          <Link
            href="/operator"
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-teal-500 hover:shadow-md transition group space-y-4 text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 flex items-center justify-between">
                2. Operator Dashboard
                <ArrowRight className="w-4 h-4 text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-slate-500">Charging Station & Slot Management</p>
            </div>
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" /> Register & manage station profiles & coordinates
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" /> Add & configure individual charging points
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" /> Define daily operating slots & pricing
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" /> View & update driver reservation statuses
              </li>
            </ul>
          </Link>

          {/* Admin */}
          <Link
            href="/admin"
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-500 hover:shadow-md transition group space-y-4 text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 flex items-center justify-between">
                3. Admin Management
                <ArrowRight className="w-4 h-4 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-slate-500">Supervisory Governance & Network Audits</p>
            </div>
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" /> Station approval & rejection workflow
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" /> User & operator account activation/suspension
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" /> System-wide booking logs & analytics
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" /> Platform security & RBAC enforcement
              </li>
            </ul>
          </Link>
        </div>
      </div>
    </div>
  );
}
