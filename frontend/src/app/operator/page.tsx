'use client';

import React, { useState, useEffect } from 'react';
import { Station, ChargingPoint, Booking, BookingStatus, ConnectorType } from '@/lib/types';
import { stationApi, chargerApi, slotApi, bookingApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  UserCheck,
  Plus,
  Zap,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  RefreshCw,
} from 'lucide-react';

export default function OperatorPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'stations' | 'chargers' | 'slots' | 'bookings'>('stations');

  // Stations State
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<string>('');
  const [loadingStations, setLoadingStations] = useState(true);

  // New Station Form State
  const [showAddStation, setShowAddStation] = useState(false);
  const [stationForm, setStationForm] = useState({
    name: '',
    address: '',
    city: '',
    description: '',
    latitude: 40.7128,
    longitude: -74.006,
    openHour: '06:00',
    closeHour: '23:00',
    amenities: 'Restrooms, Café, High-Speed WiFi',
  });

  // Charging Points State
  const [chargers, setChargers] = useState<ChargingPoint[]>([]);
  const [showAddCharger, setShowAddCharger] = useState(false);
  const [chargerForm, setChargerForm] = useState<{
    identifier: string;
    connectorType: ConnectorType;
    powerKw: number;
    pricingPerKwh: number;
  }>({
    identifier: '',
    connectorType: 'CCS 2 (DC Fast)',
    powerKw: 150,
    pricingPerKwh: 0.40,
  });

  // Slot Generator State
  const [selectedChargerId, setSelectedChargerId] = useState<string>('');
  const [slotDate, setSlotDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startHour, setStartHour] = useState<number>(8);
  const [endHour, setEndHour] = useState<number>(20);
  const [generatingSlots, setGeneratingSlots] = useState(false);

  // Bookings State
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadMyStations = async () => {
    setLoadingStations(true);
    const res = await stationApi.getMyStations();
    if (res.success && res.data && res.data.length > 0) {
      setStations(res.data);
      if (!selectedStationId) setSelectedStationId(res.data[0]._id);
    } else {
      const demo: Station[] = [
        {
          _id: 'op-st-1',
          name: 'Downtown SuperCharge Hub',
          operator: user?._id || 'op1',
          description: 'High power DC fast charging in downtown retail plaza.',
          address: '100 Main Street',
          city: 'Metro City',
          location: { type: 'Point', coordinates: [-74.006, 40.7128] },
          operatingHours: { open: '00:00', close: '23:59' },
          amenities: ['24/7 Restrooms', 'Coffee Shop', 'High-speed WiFi'],
          status: 'approved',
          images: [],
          totalChargers: 3,
          availableChargers: 3,
        },
      ];
      setStations(demo);
      setSelectedStationId(demo[0]._id);
    }
    setLoadingStations(false);
  };

  const loadChargers = async (stId: string) => {
    if (!stId) return;
    const res = await chargerApi.getByStation(stId);
    if (res.success && res.data) {
      setChargers(res.data);
      if (res.data.length > 0) setSelectedChargerId(res.data[0]._id);
    } else {
      const demoChargers: ChargingPoint[] = [
        {
          _id: 'cp-demo-1',
          station: stId,
          identifier: 'Bay 01 - Ultra DC',
          connectorType: 'CCS 2 (DC Fast)',
          powerKw: 150,
          pricingPerKwh: 0.42,
          status: 'available',
        },
        {
          _id: 'cp-demo-2',
          station: stId,
          identifier: 'Bay 02 - Rapid DC',
          connectorType: 'CHAdeMO (DC)',
          powerKw: 50,
          pricingPerKwh: 0.35,
          status: 'available',
        },
      ];
      setChargers(demoChargers);
      setSelectedChargerId(demoChargers[0]._id);
    }
  };

  const loadBookings = async () => {
    const res = await bookingApi.getOperatorBookings();
    if (res.success && res.data) {
      setBookings(res.data);
    } else {
      setBookings([
        {
          _id: 'bk-demo-op-1',
          user: { _id: 'u1', name: 'Alex Johnson', email: 'alex@driver.com', phone: '+1-555-0103' },
          station: { _id: 'op-st-1', name: 'Downtown SuperCharge Hub', address: '100 Main St', city: 'Metro City' } as any,
          chargingPoint: { _id: 'cp1', identifier: 'Bay 01', connectorType: 'CCS 2 (DC Fast)', powerKw: 150 } as any,
          slot: 'slot-1' as any,
          date: new Date().toISOString().split('T')[0],
          startTime: '10:00',
          endTime: '11:00',
          totalAmount: 18.5,
          status: 'confirmed',
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  };

  useEffect(() => {
    loadMyStations();
  }, [user]);

  useEffect(() => {
    if (selectedStationId) loadChargers(selectedStationId);
  }, [selectedStationId]);

  useEffect(() => {
    if (activeTab === 'bookings') loadBookings();
  }, [activeTab]);

  const handleCreateStation = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const res = await stationApi.create({
      name: stationForm.name,
      address: stationForm.address,
      city: stationForm.city,
      description: stationForm.description,
      latitude: Number(stationForm.latitude),
      longitude: Number(stationForm.longitude),
      operatingHours: { open: stationForm.openHour, close: stationForm.closeHour },
      amenities: stationForm.amenities.split(',').map((s) => s.trim()).filter(Boolean),
    });

    if (res.success) {
      setMessage({
        text: 'Station submitted successfully and sent for Admin verification!',
        type: 'success',
      });
      setShowAddStation(false);
      loadMyStations();
    } else {
      setMessage({ text: res.message || 'Failed to create station', type: 'error' });
    }
  };

  const handleCreateCharger = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStationId) return;

    setMessage(null);
    const res = await chargerApi.create(selectedStationId, chargerForm);

    if (res.success) {
      setMessage({ text: 'Charging point added successfully!', type: 'success' });
      setShowAddCharger(false);
      setChargerForm({
        identifier: '',
        connectorType: 'CCS 2 (DC Fast)',
        powerKw: 150,
        pricingPerKwh: 0.40,
      });
      loadChargers(selectedStationId);
    } else {
      setMessage({ text: res.message || 'Failed to add charger', type: 'error' });
    }
  };

  const handleToggleChargerStatus = async (charger: ChargingPoint) => {
    const nextStatus = charger.status === 'available' ? 'maintenance' : 'available';
    const res = await chargerApi.update(charger._id, { status: nextStatus });
    if (res.success) {
      setChargers((prev) =>
        prev.map((c) => (c._id === charger._id ? { ...c, status: nextStatus } : c))
      );
    }
  };

  const handleGenerateSlots = async () => {
    if (!selectedChargerId) {
      alert('Please select a charging bay first.');
      return;
    }

    setGeneratingSlots(true);
    setMessage(null);

    const res = await slotApi.generateDaily(selectedChargerId, {
      date: slotDate,
      startHour,
      endHour,
      slotDurationHours: 1,
    });

    setGeneratingSlots(false);

    if (res.success) {
      setMessage({
        text: `Successfully generated daily slots for ${slotDate}!`,
        type: 'success',
      });
    } else {
      setMessage({ text: res.message || 'Failed to generate slots', type: 'error' });
    }
  };

  const handleUpdateBookingStatus = async (id: string, status: BookingStatus) => {
    const res = await bookingApi.updateStatus(id, status);
    if (res.success) {
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status } : b))
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-navy bg-mint px-3 py-1 rounded-full">
            Operator Management
          </span>
          <h1 className="text-3xl font-black text-navy tracking-tight mt-2">
            Charging Hub Operations
          </h1>
          <p className="text-xs sm:text-sm text-muted-text mt-0.5">
            Configure station parameters, manage chargers, and partition daily reservation slots
          </p>
        </div>

        <button
          onClick={() => setShowAddStation(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-navy text-lime font-bold text-xs shadow-md transition active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add New Station
        </button>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-mint text-navy border-navy/20 font-bold'
              : 'bg-rose-50 border-rose-200 text-danger'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-navy shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-danger shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-border gap-8 text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('stations')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'stations'
              ? 'border-navy text-navy'
              : 'border-transparent text-muted-text hover:text-navy'
          }`}
        >
          1. Stations ({stations.length})
        </button>
        <button
          onClick={() => setActiveTab('chargers')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'chargers'
              ? 'border-navy text-navy'
              : 'border-transparent text-muted-text hover:text-navy'
          }`}
        >
          2. Charging Bays ({chargers.length})
        </button>
        <button
          onClick={() => setActiveTab('slots')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'slots'
              ? 'border-navy text-navy'
              : 'border-transparent text-muted-text hover:text-navy'
          }`}
        >
          3. Slot Batch Generator
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'bookings'
              ? 'border-navy text-navy'
              : 'border-transparent text-muted-text hover:text-navy'
          }`}
        >
          4. Driver Reservations ({bookings.length})
        </button>
      </div>

      {/* TAB 1: Stations */}
      {activeTab === 'stations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stations.map((st) => (
            <div
              key={st._id}
              onClick={() => setSelectedStationId(st._id)}
              className={`p-5 rounded-2xl border transition bg-white cursor-pointer ${
                selectedStationId === st._id
                  ? 'border-navy shadow-md ring-2 ring-lime/50'
                  : 'border-border hover:border-navy/40 shadow-2xs'
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-bold text-navy text-base">{st.name}</h3>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    st.status === 'approved'
                      ? 'bg-mint text-navy'
                      : st.status === 'rejected'
                      ? 'bg-rose-100 text-danger'
                      : 'bg-amber-100 text-warning'
                  }`}
                >
                  {st.status}
                </span>
              </div>

              <p className="text-xs text-muted-text flex items-center gap-1 mt-2">
                <MapPin className="w-3.5 h-3.5 text-muted-text shrink-0" />
                {st.address}, {st.city}
              </p>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-text">
                <span>Bays: {st.totalChargers ?? 3}</span>
                <span className="text-navy font-bold">Select to manage &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: Charging Points */}
      {activeTab === 'chargers' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-border flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-navy">Target Station:</span>
              <select
                value={selectedStationId}
                onChange={(e) => setSelectedStationId(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold rounded-xl border border-border focus:outline-none"
              >
                {stations.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.city})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowAddCharger(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-navy text-lime text-xs font-bold transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add Bay
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {chargers.map((ch) => (
              <div
                key={ch._id}
                className="bg-white p-5 rounded-2xl border border-border shadow-2xs space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-navy text-sm">{ch.identifier}</h4>
                    <span className="text-xs text-muted-text">{ch.connectorType}</span>
                  </div>

                  <button
                    onClick={() => handleToggleChargerStatus(ch)}
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full transition ${
                      ch.status === 'available'
                        ? 'bg-mint text-navy hover:opacity-80'
                        : 'bg-amber-100 text-warning hover:opacity-80'
                    }`}
                  >
                    {ch.status}
                  </button>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-dark-text font-bold">{ch.powerKw} kW Power</span>
                  <span className="text-navy font-black">${ch.pricingPerKwh.toFixed(2)}/kWh</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Slot Generator */}
      {activeTab === 'slots' && (
        <div className="max-w-lg mx-auto bg-white p-8 rounded-3xl border border-border shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-navy">Partition Available Slots</h3>
            <p className="text-xs text-muted-text">
              1-Click generate 1-hour customer reservation slots for any chosen date
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-dark-text font-bold mb-1">Target Charging Bay</label>
              <select
                value={selectedChargerId}
                onChange={(e) => setSelectedChargerId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border text-navy font-semibold focus:outline-none"
              >
                {chargers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.identifier} &bull; {c.connectorType} ({c.powerKw} kW)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-dark-text font-bold mb-1">Date</label>
              <input
                type="date"
                value={slotDate}
                onChange={(e) => setSlotDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border text-navy font-semibold focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-dark-text font-bold mb-1">Start Hour (24h)</label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={startHour}
                  onChange={(e) => setStartHour(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-border text-navy font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-dark-text font-bold mb-1">End Hour (24h)</label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={endHour}
                  onChange={(e) => setEndHour(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-border text-navy font-semibold focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateSlots}
              disabled={generatingSlots}
              className="w-full py-3.5 rounded-xl bg-lime hover:bg-lime-hover text-navy font-black shadow-md transition disabled:opacity-50"
            >
              {generatingSlots ? 'Generating Daily Slots...' : 'Generate Customer Slots'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: Customer Bookings */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-3xl border border-border overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-light-bg text-muted-text font-bold uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="px-5 py-3">Driver Name</th>
                  <th className="px-5 py-3">Hub & Bay</th>
                  <th className="px-5 py-3">Date & Time</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {bookings.map((b) => {
                  const driver = b.user as any;
                  const station = b.station as any;
                  const cp = b.chargingPoint as any;

                  return (
                    <tr key={b._id} className="hover:bg-light-bg">
                      <td className="px-5 py-3.5 font-bold text-navy">
                        {driver?.name || 'Driver'}
                        <div className="text-[10px] text-muted-text font-normal">{driver?.email}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-dark-text">{station?.name}</div>
                        <div className="text-muted-text text-[10px]">{cp?.identifier}</div>
                      </td>
                      <td className="px-5 py-3.5 text-dark-text">
                        <div className="font-semibold">{b.date}</div>
                        <div className="text-muted-text text-[10px]">{b.startTime} - {b.endTime}</div>
                      </td>
                      <td className="px-5 py-3.5 font-black text-navy">${b.totalAmount.toFixed(2)}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            b.status === 'confirmed'
                              ? 'bg-mint text-navy'
                              : b.status === 'completed'
                              ? 'bg-navy text-white'
                              : 'bg-light-bg text-muted-text'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <select
                          value={b.status}
                          onChange={(e) =>
                            handleUpdateBookingStatus(b._id, e.target.value as BookingStatus)
                          }
                          className="px-2.5 py-1 rounded-lg border border-border text-navy font-bold focus:outline-none"
                        >
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add Station */}
      {showAddStation && (
        <div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h3 className="font-black text-navy text-lg">Register Charging Hub</h3>
              <button
                onClick={() => setShowAddStation(false)}
                className="text-muted-text hover:text-navy text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateStation} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-dark-text font-bold mb-1">Hub Name</label>
                <input
                  type="text"
                  required
                  value={stationForm.name}
                  onChange={(e) => setStationForm({ ...stationForm, name: e.target.value })}
                  placeholder="e.g. Metro SuperCharge Station"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-dark-text font-bold mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={stationForm.address}
                    onChange={(e) => setStationForm({ ...stationForm, address: e.target.value })}
                    placeholder="100 Main Street"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-dark-text font-bold mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={stationForm.city}
                    onChange={(e) => setStationForm({ ...stationForm, city: e.target.value })}
                    placeholder="Metro City"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-dark-text font-bold mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={stationForm.latitude}
                    onChange={(e) =>
                      setStationForm({ ...stationForm, latitude: parseFloat(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-dark-text font-bold mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={stationForm.longitude}
                    onChange={(e) =>
                      setStationForm({ ...stationForm, longitude: parseFloat(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStation(false)}
                  className="px-4 py-2 rounded-xl border border-border text-muted-text font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-navy text-lime font-bold shadow-md"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Charger */}
      {showAddCharger && (
        <div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h3 className="font-black text-navy text-base">Add Charger Bay</h3>
              <button
                onClick={() => setShowAddCharger(false)}
                className="text-muted-text hover:text-navy text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateCharger} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-dark-text font-bold mb-1">Identifier</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bay 04 - DC Ultra"
                  value={chargerForm.identifier}
                  onChange={(e) =>
                    setChargerForm({ ...chargerForm, identifier: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-dark-text font-bold mb-1">Connector Type</label>
                <select
                  value={chargerForm.connectorType}
                  onChange={(e) =>
                    setChargerForm({
                      ...chargerForm,
                      connectorType: e.target.value as ConnectorType,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:outline-none"
                >
                  <option value="CCS 2 (DC Fast)">CCS 2 (DC Fast)</option>
                  <option value="CHAdeMO (DC)">CHAdeMO (DC)</option>
                  <option value="Type 2 (AC)">Type 2 (AC)</option>
                  <option value="Tesla Destination">Tesla Destination</option>
                  <option value="GB/T">GB/T</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-dark-text font-bold mb-1">Power (kW)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={chargerForm.powerKw}
                    onChange={(e) =>
                      setChargerForm({ ...chargerForm, powerKw: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-dark-text font-bold mb-1">Rate ($/kWh)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="0"
                    value={chargerForm.pricingPerKwh}
                    onChange={(e) =>
                      setChargerForm({ ...chargerForm, pricingPerKwh: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCharger(false)}
                  className="px-4 py-2 rounded-xl border border-border text-muted-text font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-navy text-lime font-bold shadow-md"
                >
                  Save Bay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
