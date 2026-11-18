'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Station } from '@/lib/types';

// Fix leaflet default icon asset paths for Next.js bundler
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Station Marker Icon
const stationIcon = L.divIcon({
  className: 'custom-station-pin',
  html: `
    <div style="
      background: #059669;
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(5, 150, 105, 0.4);
      border: 2px solid white;
    ">
      <svg style="transform: rotate(45deg); width: 18px; height: 18px; fill: currentColor;" viewBox="0 0 24 24">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

// User Location Pin
const userLocationIcon = L.divIcon({
  className: 'custom-user-pin',
  html: `
    <div style="
      background: #2563eb;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 0 0 8px rgba(37, 99, 235, 0.25);
    "></div>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

interface LeafletMapProps {
  stations: Station[];
  selectedStationId?: string;
  onSelectStation?: (station: Station) => void;
  userLocation?: { lat: number; lng: number } | null;
  center?: [number, number];
  zoom?: number;
}

export default function LeafletMapInner({
  stations,
  selectedStationId,
  onSelectStation,
  userLocation,
  center = [40.7128, -74.006],
  zoom = 12,
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize map instance
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialCenter: [number, number] = userLocation
      ? [userLocation.lat, userLocation.lng]
      : center;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom,
      zoomControl: true,
    });

    // OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers when stations or selection change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    // Render User Location marker if available
    if (userLocation) {
      const userMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: userLocationIcon,
      }).bindPopup('<b>Your Current Location</b>');
      markersLayerRef.current.addLayer(userMarker);
    }

    // Render Station Markers
    stations.forEach((station) => {
      if (
        station.location &&
        Array.isArray(station.location.coordinates) &&
        station.location.coordinates.length === 2
      ) {
        const [lng, lat] = station.location.coordinates;

        const marker = L.marker([lat, lng], { icon: stationIcon });

        const popupContent = `
          <div style="min-width: 180px; font-family: sans-serif;">
            <div style="font-weight: bold; font-size: 14px; color: #0f172a; margin-bottom: 4px;">
              ${station.name}
            </div>
            <div style="font-size: 12px; color: #64748b; margin-bottom: 6px;">
              ${station.address}, ${station.city}
            </div>
            <div style="font-size: 11px; color: #059669; font-weight: 600; margin-bottom: 8px;">
              ⚡ ${station.availableChargers ?? 'Multiple'} Available Chargers
            </div>
            <button id="station-btn-${station._id}" style="
              width: 100%;
              background: #059669;
              color: white;
              border: none;
              border-radius: 6px;
              padding: 6px 10px;
              font-size: 12px;
              font-weight: 600;
              cursor: pointer;
            ">
              View & Book Slots
            </button>
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on('popupopen', () => {
          const btn = document.getElementById(`station-btn-${station._id}`);
          if (btn && onSelectStation) {
            btn.onclick = () => onSelectStation(station);
          }
        });

        marker.on('click', () => {
          if (onSelectStation) {
            onSelectStation(station);
          }
        });

        markersLayerRef.current?.addLayer(marker);

        // Auto open popup if selected
        if (selectedStationId === station._id) {
          marker.openPopup();
          mapInstanceRef.current?.setView([lat, lng], 14, { animate: true });
        }
      }
    });
  }, [stations, selectedStationId, userLocation, onSelectStation]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full min-h-[450px] rounded-2xl z-0 overflow-hidden shadow-inner border border-slate-200"
    />
  );
}
