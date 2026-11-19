'use client';

import React, { useState, useEffect } from 'react';
import { Station } from '@/lib/types';
import { stationApi } from '@/lib/api';
import Map from '@/components/Map';
import StationCard from '@/components/StationCard';
import {
  Search,
  Navigation,
  MapPin,
  Zap,
  Loader2,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';

export default function StationsPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [selectedStationId, setSelectedStationId] = useState<string | undefined>();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);

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
    } else {
      // Fallback demo stations
      setStations([
        {
          _id: 'st-1',
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
          _id: 'st-2',
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
          _id: 'st-3',
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
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadStations();
  }, [cityFilter]);

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
      () => {
        setUserLocation({ lat: 40.7128, lng: -74.006 });
        setLocating(false);
      },
      { timeout: 8000 }
    );
  };

  const filteredStations = stations.filter((st) => {
    const matchesSearch =
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Geolocation CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-navy bg-mint px-3 py-1 rounded-full">
            Live Station Directory
          </span>
          <h1 className="text-3xl font-black text-navy tracking-tight mt-2">
            Find Charging Stations
          </h1>
          <p className="text-xs sm:text-sm text-muted-text mt-0.5">
            Real-time map of verified electric vehicle charging hubs and open bays
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLocateMe}
            disabled={locating}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-lime hover:bg-lime-hover text-navy text-xs font-bold shadow-sm transition active:scale-95 disabled:opacity-50"
          >
            <Navigation className={`w-4 h-4 fill-navy ${locating ? 'animate-spin' : ''}`} />
            {locating ? 'Acquiring GPS...' : 'Locate Nearby'}
          </button>

          <button
            onClick={() => loadStations()}
            disabled={loading}
            className="p-2.5 rounded-xl border border-border bg-white text-navy hover:bg-light-bg transition"
            title="Refresh Stations"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-2xl border border-border shadow-2xs">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-muted-text absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by station name, street address, or area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-border focus:outline-none focus:border-navy text-dark-text"
          />
        </div>

        <div>
          <input
            type="text"
            placeholder="Filter by City (e.g. Metro City)"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-border focus:outline-none focus:border-navy text-dark-text"
          />
        </div>
      </div>

      {/* Main Grid: Station Cards List (5 cols) + Leaflet Map (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[550px]">
        {/* Left Column: Stations List */}
        <div className="lg:col-span-5 space-y-3 max-h-[700px] overflow-y-auto pr-1">
          <div className="flex items-center justify-between text-xs text-muted-text px-1 pb-1">
            <span className="font-bold text-navy">
              {filteredStations.length} Verified Hubs
            </span>
            <span>Sorted by availability</span>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-muted-text gap-2">
              <Loader2 className="w-7 h-7 animate-spin text-navy" />
              <span className="text-xs">Loading charging stations...</span>
            </div>
          ) : filteredStations.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-border space-y-2">
              <MapPin className="w-8 h-8 text-muted-text mx-auto" />
              <h3 className="font-bold text-navy text-sm">No Stations Found</h3>
              <p className="text-xs text-muted-text">
                Try searching another city or clearing active filters.
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

        {/* Right Column: Leaflet Map */}
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
