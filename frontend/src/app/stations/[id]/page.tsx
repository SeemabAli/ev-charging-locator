'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Station, ChargingPoint, Slot } from '@/lib/types';
import { stationApi, chargerApi, slotApi, bookingApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  Zap,
  MapPin,
  Clock,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  Check,
} from 'lucide-react';
import Link from 'next/link';

export default function StationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const stationId = params.id as string;

  const [station, setStation] = useState<Station | null>(null);
  const [chargers, setChargers] = useState<ChargingPoint[]>([]);
  const [selectedCharger, setSelectedCharger] = useState<ChargingPoint | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);

  // Fetch Station & Chargers
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await stationApi.getById(stationId);
      if (res.success && res.data) {
        setStation(res.data);
        const cpList = res.data.chargingPoints || [];
        setChargers(cpList);
        if (cpList.length > 0) {
          setSelectedCharger(cpList[0]);
        }
      } else {
        // Fallback demo station if offline or not in DB
        const fallback: Station = {
          _id: stationId,
          name: 'Downtown SuperCharge Hub',
          operator: { _id: 'op1', name: 'ChargeNet Inc', email: 'op@chargenet.com' },
          description:
            'High-speed 150kW DC Fast Charging hub located directly in the downtown retail plaza with café and rest facilities.',
          address: '100 Main Street, Suite 10',
          city: 'Metro City',
          location: { type: 'Point', coordinates: [-74.006, 40.7128] },
          operatingHours: { open: '00:00', close: '23:59' },
          amenities: ['24/7 Restrooms', 'Coffee Shop', 'High-speed WiFi', 'Lounge'],
          status: 'approved',
          images: [],
        };
        const demoChargers: ChargingPoint[] = [
          {
            _id: 'cp-demo-1',
            station: stationId,
            identifier: 'Bay 01 - Ultra DC',
            connectorType: 'CCS 2 (DC Fast)',
            powerKw: 150,
            pricingPerKwh: 0.42,
            status: 'available',
          },
          {
            _id: 'cp-demo-2',
            station: stationId,
            identifier: 'Bay 02 - Rapid DC',
            connectorType: 'CHAdeMO (DC)',
            powerKw: 50,
            pricingPerKwh: 0.35,
            status: 'available',
          },
          {
            _id: 'cp-demo-3',
            station: stationId,
            identifier: 'Bay 03 - AC Destination',
            connectorType: 'Type 2 (AC)',
            powerKw: 22,
            pricingPerKwh: 0.25,
            status: 'available',
          },
        ];
        setStation(fallback);
        setChargers(demoChargers);
        setSelectedCharger(demoChargers[0]);
      }
      setLoading(false);
    }
    loadData();
  }, [stationId]);

  // Fetch Slots when selected charger or date changes
  useEffect(() => {
    async function loadSlots() {
      if (!selectedCharger) return;
      setLoadingSlots(true);
      setSelectedSlot(null);
      setBookingError(null);

      const res = await slotApi.getByCharger(selectedCharger._id, selectedDate);
      if (res.success && res.data && res.data.length > 0) {
        setSlots(res.data);
      } else {
        // Fallback demo slots for preview
        const demoTimes = [
          { start: '08:00', end: '09:00', isBooked: false },
          { start: '09:00', end: '10:00', isBooked: false },
          { start: '10:00', end: '11:00', isBooked: true }, // Booked collision example
          { start: '11:00', end: '12:00', isBooked: false },
          { start: '13:00', end: '14:00', isBooked: false },
          { start: '14:00', end: '15:00', isBooked: false },
          { start: '15:00', end: '16:00', isBooked: false },
          { start: '16:00', end: '17:00', isBooked: true },
        ];
        const generatedSlots: Slot[] = demoTimes.map((t, idx) => ({
          _id: `slot-demo-${idx}`,
          chargingPoint: selectedCharger._id,
          station: stationId,
          date: selectedDate,
          startTime: t.start,
          endTime: t.end,
          isBooked: t.isBooked,
        }));
        setSlots(generatedSlots);
      }
      setLoadingSlots(false);
    }
    loadSlots();
  }, [selectedCharger, selectedDate]);

  // Handle Booking Confirmation
  const handleConfirmBooking = async () => {
    if (!selectedSlot) return;

    if (!user) {
      setBookingError('Please log in as an EV Driver to book this charging slot.');
      return;
    }

    setBookingLoading(true);
    setBookingError(null);

    const res = await bookingApi.reserve(selectedSlot._id);

    setBookingLoading(false);

    if (res.success) {
      setBookingSuccess(true);
      // Mark slot booked locally
      setSlots((prev) =>
        prev.map((s) => (s._id === selectedSlot._id ? { ...s, isBooked: true } : s))
      );
      setTimeout(() => {
        router.push('/my-bookings');
      }, 1500);
    } else {
      setBookingError(
        res.message || 'Slot reservation failed. Another driver may have reserved it.'
      );
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-500 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="text-sm font-medium">Loading station specifications...</span>
      </div>
    );
  }

  if (!station) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Station Not Found</h2>
        <Link href="/stations" className="text-sm text-emerald-600 font-semibold">
          &larr; Back to station directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link
        href="/stations"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Stations
      </Link>

      {/* Station Overview Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {station.name}
              </h1>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Approved
              </span>
            </div>
            <p className="text-sm text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              {station.address}, {station.city}
            </p>
            <p className="text-sm text-slate-600 max-w-2xl">{station.description}</p>
          </div>

          <div className="flex flex-col sm:items-end gap-2 text-xs text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center gap-1.5 font-medium text-slate-700">
              <Clock className="w-4 h-4 text-emerald-600" />
              Hours: {station.operatingHours?.open || '00:00'} -{' '}
              {station.operatingHours?.close || '23:59'}
            </div>
            <div>Coordinates: {station.location.coordinates.join(', ')}</div>
          </div>
        </div>

        {/* Amenities */}
        {station.amenities && station.amenities.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-500 mr-2">Amenities:</span>
            {station.amenities.map((a, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100"
              >
                {a}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Booking Grid: Step 1 Charger Selector + Step 2 Slot Picker */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Step 1: Select Charging Point (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h2 className="text-lg font-bold text-slate-900">Select Charging Point</h2>
          </div>

          <div className="space-y-3">
            {chargers.map((charger) => {
              const isSelected = selectedCharger?._id === charger._id;
              const isAvailable = charger.status === 'available';

              return (
                <div
                  key={charger._id}
                  onClick={() => isAvailable && setSelectedCharger(charger)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    !isAvailable
                      ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                      : isSelected
                      ? 'bg-emerald-50/40 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">
                        {charger.identifier}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {charger.connectorType}
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                        isAvailable
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {charger.status}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      {charger.powerKw} kW Power
                    </span>
                    <span className="font-bold text-emerald-700">
                      ${charger.pricingPerKwh.toFixed(2)} / kWh
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Select Date & Available Time Slot (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h2 className="text-lg font-bold text-slate-900">Choose Date & Time Slot</h2>
            </div>

            {/* Date Selector */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={selectedDate}
                min={todayStr}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Slot Legend */}
          <div className="flex items-center gap-4 text-xs text-slate-500 bg-white p-3 rounded-xl border border-slate-200">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-emerald-500" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-slate-300" />
              <span>Booked (Collision Protected)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-emerald-700 ring-2 ring-emerald-300" />
              <span>Selected</span>
            </div>
          </div>

          {/* Slots Grid */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            {loadingSlots ? (
              <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <span className="text-xs">Fetching slot availability...</span>
              </div>
            ) : slots.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                <p>No defined slots found for this date.</p>
                <p className="text-[11px] text-slate-400">
                  Station operators can define daily slots via the Operator Dashboard.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {slots.map((slot) => {
                  const isSelected = selectedSlot?._id === slot._id;
                  const isBooked = slot.isBooked;

                  return (
                    <button
                      key={slot._id}
                      disabled={isBooked}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-3 rounded-xl text-center font-medium transition-all text-xs flex flex-col items-center justify-center gap-1 ${
                        isBooked
                          ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed line-through'
                          : isSelected
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      <span className="font-bold">
                        {slot.startTime} - {slot.endTime}
                      </span>
                      <span className="text-[10px] opacity-80">
                        {isBooked ? 'Reserved' : 'Available'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Error or Success notification */}
            {bookingError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{bookingError}</span>
              </div>
            )}

            {bookingSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Reservation confirmed! Redirecting to your bookings...</span>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs text-slate-500">Selected Reservation</div>
                <div className="text-sm font-bold text-slate-800">
                  {selectedSlot
                    ? `${selectedDate} @ ${selectedSlot.startTime} - ${selectedSlot.endTime}`
                    : 'Select an available slot above'}
                </div>
              </div>

              <button
                disabled={!selectedSlot || bookingLoading || bookingSuccess}
                onClick={handleConfirmBooking}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bookingLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Locking Slot & Reserving...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Confirm Guaranteed Reservation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
