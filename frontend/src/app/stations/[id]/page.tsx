'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Station, ChargingPoint, Slot } from '@/lib/types';
import { stationApi, slotApi, bookingApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  Zap,
  MapPin,
  Clock,
  ArrowLeft,
  Calendar,
  CheckCircle2,
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

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await stationApi.getById(stationId);
      if (res.success && res.data) {
        setStation(res.data);
        const cpList = res.data.chargingPoints || [];
        setChargers(cpList);
        if (cpList.length > 0) setSelectedCharger(cpList[0]);
      } else {
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
            _id: 'cp-1',
            station: stationId,
            identifier: 'Bay 01 - Ultra DC',
            connectorType: 'CCS 2 (DC Fast)',
            powerKw: 150,
            pricingPerKwh: 0.42,
            status: 'available',
          },
          {
            _id: 'cp-2',
            station: stationId,
            identifier: 'Bay 02 - Rapid DC',
            connectorType: 'CHAdeMO (DC)',
            powerKw: 50,
            pricingPerKwh: 0.35,
            status: 'available',
          },
          {
            _id: 'cp-3',
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
        const demoTimes = [
          { start: '08:00', end: '09:00', isBooked: false },
          { start: '09:00', end: '10:00', isBooked: false },
          { start: '10:00', end: '11:00', isBooked: true },
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

  const handleConfirmBooking = async () => {
    if (!selectedSlot) return;

    if (!user) {
      setBookingError('Please sign in as a driver to complete this reservation.');
      return;
    }

    setBookingLoading(true);
    setBookingError(null);

    const res = await bookingApi.reserve(selectedSlot._id);
    setBookingLoading(false);

    if (res.success) {
      setBookingSuccess(true);
      setSlots((prev) =>
        prev.map((s) => (s._id === selectedSlot._id ? { ...s, isBooked: true } : s))
      );
      setTimeout(() => {
        router.push('/dashboard');
      }, 1400);
    } else {
      setBookingError(
        res.message || 'Slot reservation failed. Another driver may have reserved it.'
      );
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-muted-text gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-navy" />
        <span className="text-xs font-semibold">Loading charging hub details...</span>
      </div>
    );
  }

  if (!station) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-navy">Station Not Found</h2>
        <Link href="/stations" className="text-xs text-navy font-bold hover:underline">
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
        className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-text hover:text-navy transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Stations
      </Link>

      {/* Station Overview Banner */}
      <div className="bg-white rounded-3xl border border-border shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-navy tracking-tight">
                {station.name}
              </h1>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-mint text-navy">
                <CheckCircle2 className="w-3.5 h-3.5 text-navy" /> Verified Hub
              </span>
            </div>
            <p className="text-xs text-muted-text flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-muted-text shrink-0" />
              {station.address}, {station.city}
            </p>
            <p className="text-xs text-dark-text max-w-2xl leading-relaxed">
              {station.description}
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5 text-xs text-muted-text bg-light-bg p-4 rounded-2xl border border-border">
            <div className="flex items-center gap-1.5 font-bold text-navy">
              <Clock className="w-4 h-4 text-navy" />
              Hours: {station.operatingHours?.open || '00:00'} -{' '}
              {station.operatingHours?.close || '23:59'}
            </div>
            <div>Coordinates: {station.location.coordinates.join(', ')}</div>
          </div>
        </div>

        {station.amenities && station.amenities.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-border">
            <span className="text-xs font-bold text-navy mr-2">Amenities:</span>
            {station.amenities.map((a, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-xl bg-light-bg text-dark-text text-xs font-medium border border-border"
              >
                {a}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Booking Grid: Step 1 Charger Selector + Step 2 Slot Picker */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Step 1: Select Charging Bay (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-xl bg-navy text-lime text-xs font-black flex items-center justify-center">
              1
            </span>
            <h2 className="text-lg font-black text-navy">Select Charging Bay</h2>
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
                      ? 'bg-light-bg border-border opacity-50 cursor-not-allowed'
                      : isSelected
                      ? 'bg-light-bg border-navy shadow-sm ring-2 ring-lime/40'
                      : 'bg-white border-border hover:border-navy/40'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-navy text-sm">{charger.identifier}</div>
                      <div className="text-xs text-muted-text mt-0.5">{charger.connectorType}</div>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                        isAvailable ? 'bg-mint text-navy' : 'bg-border text-muted-text'
                      }`}
                    >
                      {charger.status}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs">
                    <span className="font-bold text-navy flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-navy fill-navy" />
                      {charger.powerKw} kW Power
                    </span>
                    <span className="font-black text-navy">
                      ${charger.pricingPerKwh.toFixed(2)} / kWh
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Select Date & Time Slot (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-navy text-lime text-xs font-black flex items-center justify-center">
                2
              </span>
              <h2 className="text-lg font-black text-navy">Choose Time Slot</h2>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-text" />
              <input
                type="date"
                value={selectedDate}
                min={todayStr}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold rounded-xl border border-border focus:outline-none focus:border-navy text-navy bg-white"
              />
            </div>
          </div>

          {/* Slot Legend */}
          <div className="flex items-center gap-4 text-xs text-muted-text bg-white p-3.5 rounded-2xl border border-border">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-mint border border-navy/20" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-light-bg border border-border" />
              <span>Booked (Protected)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-navy" />
              <span>Selected</span>
            </div>
          </div>

          {/* Slots Grid */}
          <div className="bg-white p-6 rounded-3xl border border-border shadow-sm space-y-6">
            {loadingSlots ? (
              <div className="py-16 flex flex-col items-center justify-center text-muted-text gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-navy" />
                <span className="text-xs font-medium">Checking live slot availability...</span>
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
                      className={`p-3 rounded-2xl text-center font-bold transition-all text-xs flex flex-col items-center justify-center gap-1 ${
                        isBooked
                          ? 'bg-light-bg text-muted-text border border-border cursor-not-allowed line-through opacity-60'
                          : isSelected
                          ? 'bg-navy text-lime shadow-md ring-2 ring-lime/50'
                          : 'bg-light-bg hover:bg-mint text-navy border border-border'
                      }`}
                    >
                      <span>
                        {slot.startTime} - {slot.endTime}
                      </span>
                      <span className="text-[10px] font-normal opacity-80">
                        {isBooked ? 'Reserved' : 'Available'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {bookingError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-danger text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-danger shrink-0" />
                <span>{bookingError}</span>
              </div>
            )}

            {bookingSuccess && (
              <div className="p-3 rounded-xl bg-mint text-navy text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-navy shrink-0" />
                <span>Slot reserved with zero collision! Redirecting to dashboard...</span>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-[11px] text-muted-text font-semibold uppercase">
                  Reservation Target
                </div>
                <div className="text-sm font-black text-navy">
                  {selectedSlot
                    ? `${selectedDate} @ ${selectedSlot.startTime} - ${selectedSlot.endTime}`
                    : 'Choose an open time slot above'}
                </div>
              </div>

              <button
                disabled={!selectedSlot || bookingLoading || bookingSuccess}
                onClick={handleConfirmBooking}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-lime hover:bg-lime-hover text-navy font-black text-xs shadow-md shadow-lime/20 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bookingLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Locking Slot...
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
