'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Booking } from '@/lib/types';
import { bookingApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  Calendar,
  Clock,
  MapPin,
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export default function MyBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadBookings = async () => {
    setLoading(true);
    const res = await bookingApi.getMyBookings();
    if (res.success && res.data) {
      setBookings(res.data);
    } else {
      // Demo preview bookings if not yet logged in or empty DB
      const demoBookings: Booking[] = [
        {
          _id: 'booking-demo-1',
          user: user?._id || 'user1',
          station: {
            _id: 'st1',
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
            _id: 'cp1',
            station: 'st1',
            identifier: 'Bay 01 - Ultra DC',
            connectorType: 'CCS 2 (DC Fast)',
            powerKw: 150,
            pricingPerKwh: 0.42,
            status: 'available',
          },
          slot: 'slot-1',
          date: new Date().toISOString().split('T')[0],
          startTime: '10:00',
          endTime: '11:00',
          totalAmount: 18.5,
          status: 'confirmed',
          createdAt: new Date().toISOString(),
        },
      ];
      setBookings(demoBookings);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadBookings();
  }, [user]);

  const handleCancelBooking = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this reservation? The slot will be released.')) {
      return;
    }

    setCancellingId(id);
    setMessage(null);

    const res = await bookingApi.cancel(id, 'Cancelled by driver');
    setCancellingId(null);

    if (res.success) {
      setMessage({ text: 'Booking cancelled successfully. Slot released.', type: 'success' });
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: 'cancelled' } : b))
      );
    } else {
      setMessage({
        text: res.message || 'Failed to cancel reservation.',
        type: 'error',
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            My Charging Reservations
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review your active and past charging sessions, check details, or cancel upcoming slots
          </p>
        </div>

        <Link
          href="/stations"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition self-start sm:self-auto"
        >
          Book Another Station <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Bookings List */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <span className="text-xs">Loading reservations...</span>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Reservations Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You don't have any charging sessions reserved. Browse our interactive map to find a nearby station.
          </p>
          <Link
            href="/stations"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition"
          >
            Find Nearby Stations
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookings.map((booking) => {
            const station = booking.station as any;
            const charger = booking.chargingPoint as any;
            const isConfirmed = booking.status === 'confirmed';
            const isCancelled = booking.status === 'cancelled';

            return (
              <div
                key={booking._id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">
                        {station?.name || 'Charging Station'}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {station?.address}, {station?.city}
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                        isConfirmed
                          ? 'bg-emerald-100 text-emerald-800'
                          : isCancelled
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isConfirmed && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      {isCancelled && <XCircle className="w-3 h-3 text-slate-400" />}
                      {booking.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-semibold">
                        Charger
                      </span>
                      <div className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                        <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        {charger?.identifier || 'Bay 01'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {charger?.connectorType || 'CCS 2'} ({charger?.powerKw || 50} kW)
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-semibold">
                        Scheduled Slot
                      </span>
                      <div className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        {booking.date}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {booking.startTime} - {booking.endTime}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">
                      Estimated Cost
                    </span>
                    <div className="text-sm font-extrabold text-slate-900">
                      ${booking.totalAmount.toFixed(2)}
                    </div>
                  </div>

                  {isConfirmed && (
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      disabled={cancellingId === booking._id}
                      className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition disabled:opacity-50"
                    >
                      {cancellingId === booking._id ? 'Releasing...' : 'Cancel Reservation'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
