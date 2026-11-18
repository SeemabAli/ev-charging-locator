'use client';

import React from 'react';
import Link from 'next/link';
import { Station } from '@/lib/types';
import { MapPin, Zap, Clock, Navigation, CheckCircle2, ArrowRight } from 'lucide-react';

interface StationCardProps {
  station: Station;
  isSelected?: boolean;
  onSelect?: () => void;
}

export default function StationCard({
  station,
  isSelected = false,
  onSelect,
}: StationCardProps) {
  const availableCount = station.availableChargers ?? 0;
  const totalCount = station.totalChargers ?? 0;

  return (
    <div
      onClick={onSelect}
      className={`p-5 rounded-2xl border transition-all cursor-pointer bg-white text-left ${
        isSelected
          ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
          : 'border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow'
      }`}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-base">{station.name}</h3>
            {station.distanceKm !== undefined && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                <Navigation className="w-3 h-3" />
                {station.distanceKm.toFixed(1)} km
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {station.address}, {station.city}
          </p>
        </div>

        <span
          className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
            availableCount > 0
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          <Zap className="w-3 h-3 fill-current" />
          {availableCount}/{totalCount} Available
        </span>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>
            {station.operatingHours?.open || '06:00'} -{' '}
            {station.operatingHours?.close || '23:00'}
          </span>
        </div>

        {station.amenities && station.amenities.length > 0 && (
          <div className="flex items-center gap-1">
            {station.amenities.slice(0, 2).map((a, i) => (
              <span
                key={i}
                className="bg-slate-100 px-2 py-0.5 rounded text-[10px] text-slate-600 font-medium"
              >
                {a}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> Instant Slot Reservation
        </span>

        <Link
          href={`/stations/${station._id}`}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition"
        >
          Book Slot <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
