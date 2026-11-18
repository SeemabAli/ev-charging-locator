export type UserRole = 'user' | 'operator' | 'admin';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
}

export type ConnectorType =
  | 'Type 2 (AC)'
  | 'CCS 2 (DC Fast)'
  | 'CHAdeMO (DC)'
  | 'GB/T'
  | 'Tesla Destination';

export type ChargerStatus = 'available' | 'occupied' | 'maintenance';

export interface ChargingPoint {
  _id: string;
  station: string | { _id: string; name: string };
  identifier: string;
  connectorType: ConnectorType;
  powerKw: number;
  pricingPerKwh: number;
  status: ChargerStatus;
}

export interface Station {
  _id: string;
  name: string;
  operator: string | { _id: string; name: string; email: string; phone?: string };
  description: string;
  address: string;
  city: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  operatingHours: {
    open: string;
    close: string;
  };
  amenities: string[];
  status: 'pending' | 'approved' | 'rejected';
  images: string[];
  totalChargers?: number;
  availableChargers?: number;
  chargers?: ChargingPoint[];
  distanceKm?: number;
}

export interface Slot {
  _id: string;
  chargingPoint: string;
  station: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Booking {
  _id: string;
  user: string | { _id: string; name: string; email: string; phone?: string };
  station: string | Station;
  chargingPoint: string | ChargingPoint;
  slot: string | Slot;
  date: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  status: BookingStatus;
  cancellationReason?: string;
  createdAt: string;
}
