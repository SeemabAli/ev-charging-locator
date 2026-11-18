'use client';

import React, { useState, useEffect } from 'react';
import { User, Station, Booking } from '@/lib/types';
import { adminApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck,
  Users,
  Building,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Zap,
  MapPin,
  Clock,
  UserCheck,
  UserX,
  Search,
} from 'lucide-react';

export default function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'stations' | 'users' | 'bookings'>('stations');

  // Stats State
  const [stats, setStats] = useState({
    totalUsers: 1,
    totalOperators: 1,
    totalStations: 3,
    pendingStations: 1,
    approvedStations: 2,
    totalChargers: 4,
    totalBookings: 1,
  });

  // Stations State
  const [stations, setStations] = useState<Station[]>([]);
  const [loadingStations, setLoadingStations] = useState(true);

  // Users State
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Bookings State
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadStats = async () => {
    const res = await adminApi.getStats();
    if (res.success && res.data) {
      setStats(res.data);
    }
  };

  const loadStations = async () => {
    setLoadingStations(true);
    const res = await adminApi.getStations();
    if (res.success && res.data) {
      setStations(res.data);
    } else {
      // Demo fallback
      setStations([
        {
          _id: 'adm-st-1',
          name: 'North Highway Rapid Oasis',
          operator: { _id: 'op2', name: 'FastCharge Pro', email: 'op2@fastcharge.com' },
          description: 'Ultra-fast 350kW CCS chargers along Interstate highway.',
          address: 'Mile 42 North Interstate Way',
          city: 'North Valley',
          location: { type: 'Point', coordinates: [-73.98, 40.75] },
          operatingHours: { open: '00:00', close: '23:59' },
          amenities: ['Diner', 'Restrooms', 'Convenience Store'],
          status: 'pending',
          images: [],
        },
        {
          _id: 'adm-st-2',
          name: 'Downtown SuperCharge Hub',
          operator: { _id: 'op1', name: 'ChargeNet Inc', email: 'op@chargenet.com' },
          description: '150kW Ultra DC Fast charging in downtown retail plaza.',
          address: '100 Main Street, Suite 10',
          city: 'Metro City',
          location: { type: 'Point', coordinates: [-74.006, 40.7128] },
          operatingHours: { open: '00:00', close: '23:59' },
          amenities: ['Coffee', 'WiFi'],
          status: 'approved',
          images: [],
        },
      ]);
    }
    setLoadingStations(false);
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    const res = await adminApi.getUsers();
    if (res.success && res.data) {
      setUsers(res.data);
    } else {
      // Demo users
      setUsers([
        {
          id: 'u1',
          name: 'System Administrator',
          email: 'admin@evcharge.com',
          role: 'admin',
          isActive: true,
        },
        {
          id: 'u2',
          name: 'ChargeNet Operator Inc.',
          email: 'operator@chargenet.com',
          role: 'operator',
          isActive: true,
        },
        {
          id: 'u3',
          name: 'Alex Johnson (EV Driver)',
          email: 'driver@evcharge.com',
          role: 'user',
          isActive: true,
        },
      ]);
    }
    setLoadingUsers(false);
  };

  const loadBookings = async () => {
    setLoadingBookings(true);
    const res = await adminApi.getBookings();
    if (res.success && res.data) {
      setBookings(res.data);
    } else {
      setBookings([
        {
          _id: 'bk-adm-1',
          user: { _id: 'u3', name: 'Alex Johnson', email: 'driver@evcharge.com' },
          station: { _id: 'st1', name: 'Downtown SuperCharge Hub', address: '100 Main St', city: 'Metro City' } as any,
          chargingPoint: { _id: 'cp1', identifier: 'Bay 01', connectorType: 'CCS 2 (DC Fast)', powerKw: 150 } as any,
          slot: 's1' as any,
          date: new Date().toISOString().split('T')[0],
          startTime: '10:00',
          endTime: '11:00',
          totalAmount: 18.5,
          status: 'confirmed',
          createdAt: new Date().toISOString(),
        },
      ]);
    }
    setLoadingBookings(false);
  };

  useEffect(() => {
    loadStats();
    loadStations();
  }, [user]);

  useEffect(() => {
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'bookings') loadBookings();
  }, [activeTab]);

  // Handle Approve / Reject
  const handleStationStatus = async (id: string, status: 'approved' | 'rejected') => {
    setMessage(null);
    const res = await adminApi.updateStationStatus(id, status);
    if (res.success) {
      setMessage({
        text: `Station has been ${status === 'approved' ? 'approved' : 'rejected'}.`,
        type: 'success',
      });
      setStations((prev) =>
        prev.map((s) => (s._id === id ? { ...s, status } : s))
      );
      loadStats();
    } else {
      setMessage({ text: res.message || 'Action failed', type: 'error' });
    }
  };

  // Handle Toggle User Active State
  const handleToggleUserStatus = async (userObj: User) => {
    const nextStatus = !userObj.isActive;
    const res = await adminApi.updateUserStatus(userObj.id || userObj._id!, nextStatus);
    if (res.success) {
      setUsers((prev) =>
        prev.map((u) =>
          (u.id === userObj.id || u._id === userObj._id)
            ? { ...u, isActive: nextStatus }
            : u
        )
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> Platform Governance
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Administrator Control Center
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Audit charging station submissions, manage user accounts, and oversee system reservations
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-indigo-50 border-indigo-200 text-indigo-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <Users className="w-4 h-4 text-indigo-600" /> Total Users
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.totalUsers}</div>
          <div className="text-[11px] text-slate-400">Drivers registered</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-teal-600" /> Operators
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.totalOperators}</div>
          <div className="text-[11px] text-slate-400">Station networks</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <Building className="w-4 h-4 text-emerald-600" /> Total Stations
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.totalStations}</div>
          <div className="text-[11px] text-amber-600 font-semibold">
            {stats.pendingStations} Pending Review
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-blue-600" /> Total Bookings
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.totalBookings}</div>
          <div className="text-[11px] text-slate-400">Completed & active</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('stations')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'stations'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Station Approvals ({stations.filter((s) => s.status === 'pending').length} pending)
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'users'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          User & Operator Accounts
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'bookings'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Platform Bookings
        </button>
      </div>

      {/* TAB 1: Station Approvals */}
      {activeTab === 'stations' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stations.map((st) => {
              const operator = st.operator as any;
              const isPending = st.status === 'pending';

              return (
                <div
                  key={st._id}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{st.name}</h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {st.address}, {st.city}
                        </p>
                      </div>

                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          st.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : st.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800 animate-pulse'
                        }`}
                      >
                        {st.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600">{st.description}</p>

                    <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                      <div className="text-slate-500">
                        <span className="font-semibold text-slate-700">Operator: </span>
                        {operator?.name || 'ChargeNet Operator'} ({operator?.email})
                      </div>
                      <div className="text-slate-500">
                        <span className="font-semibold text-slate-700">Coordinates: </span>
                        {st.location?.coordinates?.join(', ') || '[-74.006, 40.7128]'}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    {isPending ? (
                      <>
                        <button
                          onClick={() => handleStationStatus(st._id, 'rejected')}
                          className="px-3.5 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleStationStatus(st._id, 'approved')}
                          className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition"
                        >
                          Approve Station
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">
                        Status verified & locked
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Users Management */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Account Status</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const isCurrentAdmin = u.email === user?.email;

                return (
                  <tr key={u.id || u._id} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-slate-400 text-[10px]">{u.email}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.role === 'admin'
                            ? 'bg-indigo-100 text-indigo-800'
                            : u.role === 'operator'
                            ? 'bg-teal-100 text-teal-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {isCurrentAdmin ? (
                        <span className="text-slate-400 text-[11px]">Current Admin</span>
                      ) : (
                        <button
                          onClick={() => handleToggleUserStatus(u)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                            u.isActive
                              ? 'border border-rose-200 text-rose-700 hover:bg-rose-50'
                              : 'border border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: Global Bookings */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Reservation ID</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Station & Bay</th>
                <th className="px-5 py-3">Date & Time</th>
                <th className="px-5 py-3">Total Amount</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((b) => {
                const driver = b.user as any;
                const station = b.station as any;
                const cp = b.chargingPoint as any;

                return (
                  <tr key={b._id} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5 font-mono text-slate-500">
                      {b._id.slice(0, 8)}...
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      {driver?.name || 'Alex Johnson'}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-800">{station?.name}</div>
                      <div className="text-[10px] text-slate-400">{cp?.identifier}</div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700">
                      {b.date} ({b.startTime} - {b.endTime})
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      ${b.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                        {b.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
