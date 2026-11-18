import {
  User,
  Station,
  ChargingPoint,
  Slot,
  Booking,
  BookingStatus,
} from './types';

export interface ApiHealthResponse {
  success: boolean;
  service: string;
  status: string;
  timestamp: string;
  uptimeSeconds: number;
  database: {
    status: string;
    connected: boolean;
  };
  version: string;
  environment: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('ev_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; [key: string]: any }> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...(options.headers || {}),
    };

    const res = await fetch(url, {
      ...options,
      headers,
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        message: json.message || `Request failed with status ${res.status}`,
      };
    }

    return json;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Network connection failed. Ensure backend is running.',
    };
  }
}

// 1. Health
export async function fetchApiHealth(): Promise<ApiHealthResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// 2. Auth APIs
export const authApi = {
  login: (data: { email: string; password: string }) =>
    request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  register: (data: {
    name: string;
    email: string;
    password: string;
    role?: string;
    phone?: string;
  }) =>
    request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getProfile: () => request<{ user: User }>('/api/auth/profile'),
  updateProfile: (data: Partial<User>) =>
    request<{ user: User }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// 3. Station APIs
export const stationApi = {
  getAll: (params?: { city?: string; search?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.city) q.set('city', params.city);
    if (params?.search) q.set('search', params.search);
    if (params?.status) q.set('status', params.status);
    return request<Station[]>(`/api/stations?${q.toString()}`);
  },

  getNearby: (lat: number, lng: number, maxDistanceKm: number = 30) =>
    request<Station[]>(
      `/api/stations/nearby?lat=${lat}&lng=${lng}&maxDistanceKm=${maxDistanceKm}`
    ),

  getById: (id: string) =>
    request<Station & { chargingPoints: ChargingPoint[] }>(`/api/stations/${id}`),

  getMyStations: () => request<Station[]>('/api/stations/operator/my-stations'),

  create: (data: any) =>
    request<Station>('/api/stations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    request<Station>(`/api/stations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request(`/api/stations/${id}`, {
      method: 'DELETE',
    }),
};

// 4. Charging Point APIs
export const chargerApi = {
  getByStation: (stationId: string) =>
    request<ChargingPoint[]>(`/api/charging-points/station/${stationId}`),

  create: (stationId: string, data: Partial<ChargingPoint>) =>
    request<ChargingPoint>(`/api/charging-points/station/${stationId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<ChargingPoint>) =>
    request<ChargingPoint>(`/api/charging-points/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request(`/api/charging-points/${id}`, {
      method: 'DELETE',
    }),
};

// 5. Slot APIs
export const slotApi = {
  getByCharger: (chargingPointId: string, date?: string) => {
    const q = date ? `?date=${date}` : '';
    return request<Slot[]>(`/api/slots/charger/${chargingPointId}${q}`);
  },

  create: (chargingPointId: string, data: { date: string; startTime: string; endTime: string }) =>
    request<Slot>(`/api/slots/charger/${chargingPointId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  generateDaily: (
    chargingPointId: string,
    data: { date: string; startHour?: number; endHour?: number; slotDurationHours?: number }
  ) =>
    request<Slot[]>(`/api/slots/charger/${chargingPointId}/generate-daily`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request(`/api/slots/${id}`, {
      method: 'DELETE',
    }),
};

// 6. Booking APIs
export const bookingApi = {
  reserve: (slotId: string) =>
    request<Booking>('/api/bookings', {
      method: 'POST',
      body: JSON.stringify({ slotId }),
    }),

  getMyBookings: () => request<Booking[]>('/api/bookings/my-bookings'),

  getById: (id: string) => request<Booking>(`/api/bookings/${id}`),

  cancel: (id: string, reason?: string) =>
    request<Booking>(`/api/bookings/${id}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    }),

  getOperatorBookings: () =>
    request<Booking[]>('/api/bookings/operator/station-bookings'),

  updateStatus: (id: string, status: BookingStatus) =>
    request<Booking>(`/api/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

// 7. Admin APIs
export const adminApi = {
  getStats: () =>
    request<{
      totalUsers: number;
      totalOperators: number;
      totalStations: number;
      pendingStations: number;
      approvedStations: number;
      totalChargers: number;
      totalBookings: number;
    }>('/api/admin/stats'),

  getUsers: (params?: { role?: string; isActive?: boolean; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.role) q.set('role', params.role);
    if (params?.isActive !== undefined) q.set('isActive', String(params.isActive));
    if (params?.search) q.set('search', params.search);
    return request<User[]>(`/api/admin/users?${q.toString()}`);
  },

  updateUserStatus: (id: string, isActive: boolean) =>
    request(`/api/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    }),

  getStations: (status?: string) => {
    const q = status ? `?status=${status}` : '';
    return request<Station[]>(`/api/admin/stations${q}`);
  },

  updateStationStatus: (id: string, status: 'approved' | 'rejected' | 'pending') =>
    request(`/api/admin/stations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  getBookings: (params?: { status?: string; date?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.date) q.set('date', params.date);
    return request<Booking[]>(`/api/admin/bookings?${q.toString()}`);
  },
};
