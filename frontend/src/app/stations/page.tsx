'use client';

import React, { useState, useEffect } from 'react';
import { Station } from '@/lib/types';
import { stationApi } from '@/lib/api';
import Map from '@/components/Map';
import StationCard from '@/components/StationCard';
import {
  Search,
  Navigation,
  SlidersHorizontal,
  MapPin,
  Zap,
  Loader2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

// Fallback demo stations for preview if backend DB has no data yet
const FALLBACK_STATIONS: Station[] = [
  {
    _id: 'demo-st-1',
    name: 'Downtown SuperCharge Hub',
    operator: { _id: 'op1', name: 'ChargeNet Inc', email: 'op@chargenet.com' },
    description: '150kW Ultra DC Fast charging in downtown retail plaza with café.',
    address: '100 Main Street, Suite 10',
    city: 'Metro City',
    location: { type: 'Point', coordinates: [-74.006, 40.7128] },
    operatingHours: { open: '00:00', close: '23:59' },
    amenities: ['24/7 Restrooms', 'Coffee Shop', 'High-speed WiFi'],
    status: 'approved',
    images: [],
    totalChargers: 4,
    availableChargers: 3,
  },
  {
    _id: 'demo-st-2',
    name: 'Westside GreenEnergy Park',
    operator: { _id: 'op1', name: 'ChargeNet Inc', email: 'op@chargenet.com' },
    description: 'Solar-assisted 50kW and 22kW chargers in commercial district.',
    address: '450 West Olympic Boulevard',
    city: 'Metro City',
    location: { type: 'Point', coordinates: [-74.015, 40.72] },
    operatingHours: { open: '06:00', close: '22:00' },
    amenities: ['Covered Canopy', 'EV Lounge'],
    status: 'approved',
    images: [],
    totalChargers: 6,
    availableChargers: 5,
  },
  {
    _id: 'demo-st-3',
    name: 'North Highway Rapid Oasis',
    operator: { _id: 'op2', name: 'FastCharge Pro', email: 'op2@fastcharge.com' },
    description: 'Ultra-fast 350kW CCS chargers along Interstate highway.',
    address: 'Mile 42 North Interstate Way',
    city: 'North Valley',
    location: { type: 'Point', coordinates: [-73.98, 40.75] },
    operatingHours: { open: '00:00', close: '23:59' },
    amenities: ['Diner', 'Restrooms', 'Convenience Store'],
    status: 'approved',
    images: [],
    totalChargers: 8,
    availableChargers: 7,
  },
];

export default function StationsPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [selectedStationId, setSelectedStationId] = useState<string | undefined>();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);

  // Fetch stations from backend API
  const loadStations = async (lat?: number, lng?: number) => {
    setLoading(true);
    let res;

    if (lat !== undefined && lng !== undefined) {
      res = await stationApi.getNearby(lat, lng, 50);
    } else {
      res = await stationApi.getAll({ search: searchQuery, city: cityFilter });
    }

    if (res.success && res.data && res.data.length > 0) {
      setStations(res.data);
      setUsingFallback(false);
    } else {
      // If backend has no stations seeded or is disconnected, use demo stations
      setStations(FALLBACK_STATIONS);
      setUsingFallback(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadStations();
  }, [cityFilter]);

  // Handle browser geolocation
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        loadStations(latitude, longitude);
        setLocating(false);
      },
      (err) => {
        console.warn('Geolocation denied or failed:', err.message);
        // Default to demo coordinates (NYC / Metro)
        setUserLocation({ lat: 40.7128, lng: -74.006 });
        setLocating(false);
      },
      { timeout: 8000 }
    );
  };

  // Filter stations based on search query
  const filteredStations = stations.filter((st) => {
    const matchesSearch =
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Charging Station Locator
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Search nearby stations, inspect charger availability, and reserve time slots
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleLocateMe}
            disabled={locating}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition disabled:opacity-50"
          >
            <Navigation className={`w-4 h-4 ${locating ? 'animate-spin' : ''}`} />
            {locating ? 'Acquiring GPS...' : 'Use My Current Location'}
          </button>

          <button
            onClick={() => loadStations()}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
            title="Refresh Stations"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {usingFallback && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center gap-3 text-xs text-amber-800">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Displaying interactive preview stations. Once MongoDB Atlas is connected and seeded via{' '}
            <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">npm run seed</code>, live database records will display automatically.
          </span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search station by name, street, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div>
          <input
            type="text"
            placeholder="Filter by City (e.g. Metro City)"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Main Grid: Stations List + Interactive Leaflet Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[550px]">
        {/* Left Column: Station Cards List (5 cols) */}
        <div className="lg:col-span-5 space-y-3 max-h-[700px] overflow-y-auto pr-1">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1 pb-1">
            <span className="font-semibold text-slate-700">
              {filteredStations.length} Stations Found
            </span>
            <span>Sorted by availability</span>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
              <span className="text-xs">Finding available stations...</span>
            </div>
          ) : filteredStations.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
              <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">No Stations Found</h3>
              <p className="text-xs text-slate-500">
                Try clearing search terms or widening your location radius.
              </p>
            </div>
          ) : (
            filteredStations.map((station) => (
              <StationCard
                key={station._id}
                station={station}
                isSelected={selectedStationId === station._id}
                onSelect={() => setSelectedStationId(station._id)}
              />
            ))
          )}
        </div>

        {/* Right Column: Leaflet Map (7 cols) */}
        <div className="lg:col-span-7 h-[450px] lg:h-auto min-h-[500px]">
          <Map
            stations={filteredStations}
            selectedStationId={selectedStationId}
            onSelectStation={(st) => setSelectedStationId(st._id)}
            userLocation={userLocation}
          />
        </div>
      </div>
    </div>
  );
}
