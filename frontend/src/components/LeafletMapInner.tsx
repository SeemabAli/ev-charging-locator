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

// Custom Station Marker Icon (Deep Navy + Electric Lime pin)
const stationIcon = L.divIcon({
  className: 'custom-station-pin',
  html: `
    <div style="
      background: #101C2C;
      color: #B7F34A;
      width: 38px;
      height: 38px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(16, 28, 44, 0.4);
      border: 2px solid #B7F34A;
    ">
      <svg style="transform: rotate(45deg); width: 20px; height: 20px; fill: #B7F34A;" viewBox="0 0 24 24">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    </div>
  `,
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

// User Location Pin
const userLocationIcon = L.divIcon({
  className: 'custom-user-pin',
  html: `
    <div style="
      background: #B7F34A;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 3px solid #101C2C;
      box-shadow: 0 0 0 6px rgba(183, 243, 74, 0.4);
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

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    if (userLocation) {
      const userMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: userLocationIcon,
      }).bindPopup('<b style="font-family: sans-serif; font-size: 12px;">Your Current Location</b>');
      markersLayerRef.current.addLayer(userMarker);
    }

    stations.forEach((station) => {
      if (
        station.location &&
        Array.isArray(station.location.coordinates) &&
        station.location.coordinates.length === 2
      ) {
        const [lng, lat] = station.location.coordinates;
        const marker = L.marker([lat, lng], { icon: stationIcon });

        const popupContent = `
          <div style="min-width: 200px; font-family: Inter, sans-serif; padding: 4px;">
            <div style="font-weight: 800; font-size: 14px; color: #101C2C; margin-bottom: 2px;">
              ${station.name}
            </div>
            <div style="font-size: 11px; color: #75818C; margin-bottom: 8px;">
              ${station.address}, ${station.city}
            </div>
            <div style="font-size: 11px; color: #16A36A; font-weight: 700; margin-bottom: 10px; display: flex; align-items: center; gap: 4px;">
              ⚡ ${station.availableChargers ?? 3} Available Charging Bays
            </div>
            <button id="station-btn-${station._id}" style="
              width: 100%;
              background: #B7F34A;
              color: #101C2C;
              border: none;
              border-radius: 8px;
              padding: 8px 12px;
              font-size: 12px;
              font-weight: 800;
              cursor: pointer;
              transition: opacity 0.2s;
            ">
              Select & Reserve Slot &rarr;
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
      className="w-full h-full min-h-[500px] rounded-3xl z-0 overflow-hidden shadow-sm border border-border"
    />
  );
}
