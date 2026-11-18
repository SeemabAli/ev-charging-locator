'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { Station } from '@/lib/types';
import { MapPin, Loader2 } from 'lucide-react';

const DynamicLeafletMap = dynamic(
  () => import('./LeafletMapInner'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[450px] rounded-2xl bg-slate-100 flex flex-col items-center justify-center text-slate-400 gap-3 border border-slate-200">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="text-sm font-medium">Loading Interactive OpenStreetMap...</span>
      </div>
    ),
  }
);

interface MapProps {
  stations: Station[];
  selectedStationId?: string;
  onSelectStation?: (station: Station) => void;
  userLocation?: { lat: number; lng: number } | null;
  center?: [number, number];
  zoom?: number;
}

export default function Map(props: MapProps) {
  return <DynamicLeafletMap {...props} />;
}
