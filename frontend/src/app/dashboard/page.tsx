'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Booking, Station } from '@/lib/types';
import { bookingApi, stationApi } from '@/lib/api';
import {
  LayoutDashboard,
  MapPin,
  Calendar,
  History,
  User,
  LogOut,
  Zap,
  Clock,
  ArrowRight,
  CheckCircle2,
  Navigation,
  Loader2,
  Sparkles,
  TrendingUp,
  BatteryCharging,
} from 'lucide-react';

export default function CustomerDashboardPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'history' | 'profile'>('overview');

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [nearbyStations, setNearbyStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [bkRes, stRes] = await Promise.all([
        bookingApi.getMyBookings(),
        stationApi.getAll(),
      ]);

      if (bkRes.success && bkRes.data) {
        setBookings(bkRes.data);
      } else {
        // Fallback demo bookings
        setBookings([
          {
            _id: 'demo-bk-1',
            user: user?._id || 'u1',
            station: {
              _id: 'st-1',
              name: 'Downtown SuperCharge Hub',
              address: '100 Main Street',
              city: 'Metro City',
              location: { type: 'Point', coordinates: [-74.006, 40.7128] },
              operatingHours: { open: '00:00', close: '23:59' },
              amenities: ['Coffee', 'WiFi'],
              status: 'approved',
              images: [],
              description: '',
              operator: '',
            },
            chargingPoint: {
              _id: 'cp-1',
              station: 'st-1',
              identifier: 'Bay 01 - Ultra DC',
              connectorType: 'CCS 2 (DC Fast)',
              powerKw: 150,
              pricingPerKwh: 0.42,
              status: 'available',
            },
            slot: 's1',
            date: new Date().toISOString().split('T')[0],
            startTime: '14:00',
            endTime: '15:00',
            totalAmount: 18.5,
            status: 'confirmed',
            createdAt: new Date().toISOString(),
          },
        ]);
      }

      if (stRes.success && stRes.data) {
        setNearbyStations(stRes.data.slice(0, 3));
      } else {
        setNearbyStations([
          {
            _id: 'demo-st-1',
            name: 'Downtown SuperCharge Hub',
            operator: 'op1',
            description: '150kW DC Fast charging in downtown retail plaza.',
            address: '100 Main Street',
            city: 'Metro City',
            location: { type: 'Point', coordinates: [-74.006, 40.7128] },
            operatingHours: { open: '00:00', close: '23:59' },
            amenities: ['WiFi', 'Restrooms'],
            status: 'approved',
            images: [],
            totalChargers: 4,
            availableChargers: 3,
          },
          {
            _id: 'demo-st-2',
            name: 'Westside GreenEnergy Park',
            operator: 'op1',
            description: 'Solar-assisted 50kW and 22kW chargers in business park.',
            address: '450 West Olympic Blvd',
            city: 'Metro City',
            location: { type: 'Point', coordinates: [-74.015, 40.72] },
            operatingHours: { open: '06:00', close: '22:00' },
            amenities: ['Canopy'],
            status: 'approved',
            images: [],
            totalChargers: 6,
            availableChargers: 5,
          },
        ]);
      }
      setLoading(false);
    }
    loadData();
  }, [user]);

  const activeReservations = bookings.filter((b) => b.status === 'confirmed');
  const pastReservations = bookings.filter((b) => b.status === 'completed' || b.status === 'cancelled');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar (3 cols) */}
        <aside className="lg:col-span-3">
          <div className="bg-white rounded-3xl border border-border p-5 shadow-sm space-y-6 sticky top-24">
            {/* User card mini */}
            <div className="flex items-center gap-3 pb-5 border-b border-border">
              <div className="w-11 h-11 rounded-2xl bg-navy text-lime flex items-center justify-center font-bold text-sm shadow-md">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'D'}
              </div>
              <div className="overflow-hidden">
                <div className="text-sm font-extrabold text-navy truncate">
                  {user?.name || 'EV Driver'}
                </div>
                <div className="text-[11px] text-muted-text truncate">{user?.email || 'driver@evcharge.com'}</div>
              </div>
            </div>

            {/* Sidebar Navigation */}
            <nav className="space-y-1 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
                  activeTab === 'overview'
                    ? 'bg-navy text-lime font-bold'
                    : 'text-dark-text hover:bg-light-bg'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Overview
              </button>

              <Link
                href="/stations"
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-dark-text hover:bg-light-bg transition"
              >
                <MapPin className="w-4 h-4" />
                Find Stations
              </Link>

              <button
                onClick={() => setActiveTab('bookings')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                  activeTab === 'bookings'
                    ? 'bg-navy text-lime font-bold'
                    : 'text-dark-text hover:bg-light-bg'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Calendar className="w-4 h-4" />
                  My Bookings
                </span>
                {activeReservations.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-lime text-navy text-[10px] font-black">
                    {activeReservations.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
                  activeTab === 'history'
                    ? 'bg-navy text-lime font-bold'
                    : 'text-dark-text hover:bg-light-bg'
                }`}
              >
                <History className="w-4 h-4" />
                Booking History
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
                  activeTab === 'profile'
                    ? 'bg-navy text-lime font-bold'
                    : 'text-dark-text hover:bg-light-bg'
                }`}
              >
                <User className="w-4 h-4" />
                Profile & Settings
              </button>

              <div className="pt-4 border-t border-border">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-danger hover:bg-rose-50 transition"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content Area (9 cols) */}
        <main className="lg:col-span-9 space-y-8">
          {/* Welcome Banner */}
          <div className="bg-navy rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2 relative z-10">
              <span className="text-[11px] font-bold text-lime uppercase tracking-widest">
                Driver Portal Active
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Welcome back, {user?.name?.split(' ')[0] || 'Alex'}! 👋
              </h1>
              <p className="text-xs text-muted-text max-w-md">
                Your electric vehicle ecosystem is operational. Discover new hubs and manage charging slots below.
              </p>
            </div>

            <Link
              href="/stations"
              className="px-5 py-3 rounded-xl bg-lime hover:bg-lime-hover text-navy font-black text-xs shadow-md transition self-start sm:self-auto flex items-center gap-2"
            >
              <Navigation className="w-4 h-4 fill-navy" />
              Book New Session
            </Link>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-border shadow-2xs space-y-1">
              <div className="text-[11px] text-muted-text font-medium flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-navy" /> Active Bookings
              </div>
              <div className="text-2xl font-black text-navy">{activeReservations.length}</div>
              <div className="text-[10px] text-success font-semibold">Ready for charging</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-border shadow-2xs space-y-1">
              <div className="text-[11px] text-muted-text font-medium flex items-center gap-1.5">
                <History className="w-4 h-4 text-navy" /> Total Completed
              </div>
              <div className="text-2xl font-black text-navy">{bookings.length}</div>
              <div className="text-[10px] text-muted-text">Lifetime sessions</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-border shadow-2xs space-y-1">
              <div className="text-[11px] text-muted-text font-medium flex items-center gap-1.5">
                <BatteryCharging className="w-4 h-4 text-navy" /> Energy Reserved
              </div>
              <div className="text-2xl font-black text-navy">~120 kWh</div>
              <div className="text-[10px] text-muted-text">Clean grid power</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-border shadow-2xs space-y-1">
              <div className="text-[11px] text-muted-text font-medium flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-navy" /> Saved Emissions
              </div>
              <div className="text-2xl font-black text-navy">42 kg</div>
              <div className="text-[10px] text-success font-semibold">CO2 avoided</div>
            </div>
          </div>

          {/* TAB: Overview / Active Booking Summary */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Active Upcoming Reservation Card */}
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-navy flex items-center gap-2">
                  <Clock className="w-5 h-5 text-navy" /> Active Upcoming Reservation
                </h2>

                {activeReservations.length === 0 ? (
                  <div className="bg-white rounded-3xl p-8 border border-border text-center space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-light-bg text-muted-text flex items-center justify-center mx-auto">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div className="text-sm font-bold text-navy">No Active Charging Sessions</div>
                    <p className="text-xs text-muted-text max-w-sm mx-auto">
                      You don't have any pending reservations for today. Browse available bays to lock in a slot.
                    </p>
                    <Link
                      href="/stations"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-navy text-lime font-bold text-xs"
                    >
                      Find Nearby Charger &rarr;
                    </Link>
                  </div>
                ) : (
                  activeReservations.slice(0, 1).map((b) => {
                    const st = b.station as any;
                    const cp = b.chargingPoint as any;

                    return (
                      <div
                        key={b._id}
                        className="bg-white rounded-3xl border border-border p-6 shadow-sm space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-2">
                          <div>
                            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-mint text-navy">
                              Guaranteed Confirmed
                            </span>
                            <h3 className="text-lg font-extrabold text-navy mt-1">
                              {st?.name || 'Charging Station'}
                            </h3>
                            <p className="text-xs text-muted-text flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-muted-text" />
                              {st?.address}, {st?.city}
                            </p>
                          </div>

                          <div className="text-right">
                            <div className="text-xs text-muted-text font-medium">Estimated Rate</div>
                            <div className="text-lg font-black text-navy">${b.totalAmount.toFixed(2)}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                          <div className="p-3 rounded-xl bg-light-bg">
                            <div className="text-[10px] text-muted-text uppercase font-semibold">
                              Charger Bay
                            </div>
                            <div className="font-bold text-navy mt-0.5">{cp?.identifier || 'Bay 01'}</div>
                          </div>

                          <div className="p-3 rounded-xl bg-light-bg">
                            <div className="text-[10px] text-muted-text uppercase font-semibold">
                              Connector Type
                            </div>
                            <div className="font-bold text-navy mt-0.5">{cp?.connectorType || 'CCS 2'}</div>
                          </div>

                          <div className="p-3 rounded-xl bg-light-bg">
                            <div className="text-[10px] text-muted-text uppercase font-semibold">
                              Date
                            </div>
                            <div className="font-bold text-navy mt-0.5">{b.date}</div>
                          </div>

                          <div className="p-3 rounded-xl bg-light-bg">
                            <div className="text-[10px] text-muted-text uppercase font-semibold">
                              Time Window
                            </div>
                            <div className="font-bold text-navy mt-0.5">
                              {b.startTime} - {b.endTime}
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 flex justify-end gap-3 text-xs">
                          <Link
                            href="/my-bookings"
                            className="px-4 py-2 rounded-xl bg-navy text-lime font-bold hover:bg-navy-light transition"
                          >
                            Manage Booking &rarr;
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Nearby Charging Stations */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-navy">Nearby Charging Stations</h2>
                  <Link href="/stations" className="text-xs font-bold text-navy hover:underline">
                    View Map Directory &rarr;
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {nearbyStations.map((st) => (
                    <div
                      key={st._id}
                      className="bg-white p-5 rounded-2xl border border-border shadow-2xs space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-navy text-sm">{st.name}</h4>
                          <p className="text-xs text-muted-text mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-muted-text" />
                            {st.address}, {st.city}
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-mint text-navy">
                          {st.availableChargers ?? 3} Available
                        </span>
                      </div>

                      <div className="pt-3 border-t border-border flex justify-between items-center text-xs">
                        <span className="text-muted-text">
                          Hours: {st.operatingHours?.open || '00:00'} - {st.operatingHours?.close || '23:59'}
                        </span>
                        <Link
                          href={`/stations/${st._id}`}
                          className="font-bold text-navy hover:text-lime-hover transition"
                        >
                          Book Bay &rarr;
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: My Bookings & History */}
          {(activeTab === 'bookings' || activeTab === 'history') && (
            <div className="bg-white rounded-3xl border border-border p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-navy">
                {activeTab === 'bookings' ? 'Active Reservations' : 'Lifetime Session History'}
              </h2>

              <div className="space-y-3">
                {(activeTab === 'bookings' ? activeReservations : pastReservations).map((b) => (
                  <div
                    key={b._id}
                    className="p-4 rounded-2xl border border-border flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-navy text-sm">
                        {(b.station as any)?.name || 'Charging Station'}
                      </div>
                      <div className="text-muted-text text-[11px] mt-0.5">
                        Bay: {(b.chargingPoint as any)?.identifier} &bull; {b.date} ({b.startTime} - {b.endTime})
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-bold text-navy">${b.totalAmount.toFixed(2)}</div>
                        <div className="text-[10px] uppercase font-bold text-success">{b.status}</div>
                      </div>
                      <Link
                        href="/my-bookings"
                        className="px-3 py-1.5 rounded-lg border border-border text-navy font-semibold hover:bg-light-bg"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: Profile */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-3xl border border-border p-6 shadow-sm space-y-4 max-w-xl text-xs">
              <h2 className="text-lg font-bold text-navy">Driver Profile & Vehicle Specs</h2>
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-muted-text font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    disabled
                    value={user?.name || 'Alex Johnson'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-light-bg font-bold text-navy"
                  />
                </div>
                <div>
                  <label className="block text-muted-text font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || 'driver@evcharge.com'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-light-bg font-bold text-navy"
                  />
                </div>
                <div>
                  <label className="block text-muted-text font-semibold mb-1">Role / Account Tier</label>
                  <input
                    type="text"
                    disabled
                    value="Registered EV Driver"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-light-bg font-bold text-navy"
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
