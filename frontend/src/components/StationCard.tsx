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
          ? 'border-navy shadow-md ring-2 ring-lime/40'
          : 'border-border hover:border-navy/40 shadow-2xs hover:shadow-sm'
      }`}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-navy text-base">{station.name}</h3>
            {station.distanceKm !== undefined && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-light-bg text-dark-text border border-border">
                <Navigation className="w-3 h-3 text-navy" />
                {station.distanceKm.toFixed(1)} km
              </span>
            )}
          </div>
          <p className="text-xs text-muted-text flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-muted-text shrink-0" />
            {station.address}, {station.city}
          </p>
        </div>

        <span
          className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
            availableCount > 0
              ? 'bg-mint text-navy'
              : 'bg-light-bg text-muted-text border border-border'
          }`}
        >
          <Zap className="w-3 h-3 fill-navy" />
          {availableCount}/{totalCount} Available
        </span>
      </div>

      <div className="mt-3 pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2 text-xs text-muted-text">
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-muted-text" />
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
                className="bg-light-bg px-2 py-0.5 rounded text-[10px] text-dark-text font-medium border border-border"
              >
                {a}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs font-bold text-success flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> Instant Slot Reservation
        </span>

        <Link
          href={`/stations/${station._id}`}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-navy bg-lime hover:bg-lime-hover rounded-xl shadow-2xs transition active:scale-95"
        >
          Book Bay <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
