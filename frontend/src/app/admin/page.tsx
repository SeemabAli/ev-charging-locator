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
  AlertTriangle,
  MapPin,
  UserCheck,
} from 'lucide-react';

export default function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'stations' | 'users' | 'bookings'>('stations');

  const [stats, setStats] = useState({
    totalUsers: 1,
    totalOperators: 1,
    totalStations: 3,
    pendingStations: 1,
    approvedStations: 2,
    totalChargers: 4,
    totalBookings: 1,
  });

  const [stations, setStations] = useState<Station[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadStats = async () => {
    const res = await adminApi.getStats();
    if (res.success && res.data) setStats(res.data);
  };

  const loadStations = async () => {
    const res = await adminApi.getStations();
    if (res.success && res.data) {
      setStations(res.data);
    } else {
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
  };

  const loadUsers = async () => {
    const res = await adminApi.getUsers();
    if (res.success && res.data) {
      setUsers(res.data);
    } else {
      setUsers([
        { id: 'u1', name: 'System Administrator', email: 'admin@evcharge.com', role: 'admin', isActive: true },
        { id: 'u2', name: 'ChargeNet Operator Inc.', email: 'operator@chargenet.com', role: 'operator', isActive: true },
        { id: 'u3', name: 'Alex Johnson (EV Driver)', email: 'driver@evcharge.com', role: 'user', isActive: true },
      ]);
    }
  };

  const loadBookings = async () => {
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
  };

  useEffect(() => {
    loadStats();
    loadStations();
  }, [user]);

  useEffect(() => {
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'bookings') loadBookings();
  }, [activeTab]);

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
          <span className="text-xs font-extrabold uppercase tracking-widest text-navy bg-mint px-3 py-1 rounded-full">
            Platform Governance
          </span>
          <h1 className="text-3xl font-black text-navy tracking-tight mt-2">
            Administrator Control Center
          </h1>
          <p className="text-xs sm:text-sm text-muted-text mt-0.5">
            Audit newly submitted hubs, manage driver & operator accounts, and monitor reservations
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-mint text-navy font-bold border-navy/20'
              : 'bg-rose-50 border-rose-200 text-danger'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-navy shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-danger shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-border shadow-2xs space-y-1">
          <div className="text-[11px] text-muted-text font-bold flex items-center gap-1.5 uppercase">
            <Users className="w-4 h-4 text-navy" /> Total Drivers
          </div>
          <div className="text-2xl font-black text-navy">{stats.totalUsers}</div>
          <div className="text-[10px] text-muted-text">Registered drivers</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border shadow-2xs space-y-1">
          <div className="text-[11px] text-muted-text font-bold flex items-center gap-1.5 uppercase">
            <UserCheck className="w-4 h-4 text-navy" /> Operators
          </div>
          <div className="text-2xl font-black text-navy">{stats.totalOperators}</div>
          <div className="text-[10px] text-muted-text">Charging hosts</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border shadow-2xs space-y-1">
          <div className="text-[11px] text-muted-text font-bold flex items-center gap-1.5 uppercase">
            <Building className="w-4 h-4 text-navy" /> Total Hubs
          </div>
          <div className="text-2xl font-black text-navy">{stats.totalStations}</div>
          <div className="text-[10px] text-warning font-bold">
            {stats.pendingStations} Pending Review
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border shadow-2xs space-y-1">
          <div className="text-[11px] text-muted-text font-bold flex items-center gap-1.5 uppercase">
            <Calendar className="w-4 h-4 text-navy" /> Bookings
          </div>
          <div className="text-2xl font-black text-navy">{stats.totalBookings}</div>
          <div className="text-[10px] text-success font-bold">Network volume</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-8 text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('stations')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'stations'
              ? 'border-navy text-navy'
              : 'border-transparent text-muted-text hover:text-navy'
          }`}
        >
          Hub Approvals ({stations.filter((s) => s.status === 'pending').length} pending)
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'users'
              ? 'border-navy text-navy'
              : 'border-transparent text-muted-text hover:text-navy'
          }`}
        >
          User & Operator Accounts
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'bookings'
              ? 'border-navy text-navy'
              : 'border-transparent text-muted-text hover:text-navy'
          }`}
        >
          Network Booking Records
        </button>
      </div>

      {/* TAB 1: Hub Approvals */}
      {activeTab === 'stations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stations.map((st) => {
            const operator = st.operator as any;
            const isPending = st.status === 'pending';

            return (
              <div
                key={st._id}
                className="bg-white p-6 rounded-3xl border border-border shadow-2xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-navy text-base">{st.name}</h3>
                      <p className="text-xs text-muted-text flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-muted-text shrink-0" />
                        {st.address}, {st.city}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        st.status === 'approved'
                          ? 'bg-mint text-navy'
                          : st.status === 'rejected'
                          ? 'bg-rose-100 text-danger'
                          : 'bg-amber-100 text-warning animate-pulse'
                      }`}
                    >
                      {st.status}
                    </span>
                  </div>

                  <p className="text-xs text-dark-text leading-relaxed">{st.description}</p>

                  <div className="p-3 bg-light-bg rounded-xl text-xs space-y-1 border border-border">
                    <div className="text-muted-text">
                      <span className="font-bold text-navy">Operator: </span>
                      {operator?.name || 'ChargeNet Operator'} ({operator?.email})
                    </div>
                    <div className="text-muted-text">
                      <span className="font-bold text-navy">Coordinates: </span>
                      {st.location?.coordinates?.join(', ') || '[-74.006, 40.7128]'}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                  {isPending ? (
                    <>
                      <button
                        onClick={() => handleStationStatus(st._id, 'rejected')}
                        className="px-4 py-2 rounded-xl border border-border text-danger hover:bg-rose-50 text-xs font-bold transition"
                      >
                        Reject Hub
                      </button>
                      <button
                        onClick={() => handleStationStatus(st._id, 'approved')}
                        className="px-5 py-2 rounded-xl bg-navy text-lime text-xs font-bold shadow-sm transition"
                      >
                        Approve Hub
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-muted-text font-medium">
                      Status audited & approved
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: Users Management */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-border overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-light-bg text-muted-text font-bold uppercase tracking-wider border-b border-border">
              <tr>
                <th className="px-5 py-3">Account Name</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => {
                const isCurrentAdmin = u.email === user?.email;

                return (
                  <tr key={u.id || u._id} className="hover:bg-light-bg">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-navy">{u.name}</div>
                      <div className="text-muted-text text-[10px]">{u.email}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.role === 'admin'
                            ? 'bg-navy text-white'
                            : u.role === 'operator'
                            ? 'bg-mint text-navy'
                            : 'bg-light-bg text-dark-text border border-border'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.isActive
                            ? 'bg-mint text-navy'
                            : 'bg-rose-100 text-danger'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {isCurrentAdmin ? (
                        <span className="text-muted-text text-[11px]">Primary Admin</span>
                      ) : (
                        <button
                          onClick={() => handleToggleUserStatus(u)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                            u.isActive
                              ? 'border border-border text-danger hover:bg-rose-50'
                              : 'bg-navy text-lime'
                          }`}
                        >
                          {u.isActive ? 'Suspend' : 'Activate'}
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
        <div className="bg-white rounded-3xl border border-border overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-light-bg text-muted-text font-bold uppercase tracking-wider border-b border-border">
              <tr>
                <th className="px-5 py-3">Reservation ID</th>
                <th className="px-5 py-3">Driver</th>
                <th className="px-5 py-3">Hub & Bay</th>
                <th className="px-5 py-3">Date & Time</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bookings.map((b) => {
                const driver = b.user as any;
                const station = b.station as any;
                const cp = b.chargingPoint as any;

                return (
                  <tr key={b._id} className="hover:bg-light-bg">
                    <td className="px-5 py-3.5 font-mono text-muted-text text-[11px]">
                      {b._id.slice(0, 8)}...
                    </td>
                    <td className="px-5 py-3.5 font-bold text-navy">
                      {driver?.name || 'Alex Johnson'}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-dark-text">{station?.name}</div>
                      <div className="text-[10px] text-muted-text">{cp?.identifier}</div>
                    </td>
                    <td className="px-5 py-3.5 text-dark-text">
                      {b.date} ({b.startTime} - {b.endTime})
                    </td>
                    <td className="px-5 py-3.5 font-black text-navy">${b.totalAmount.toFixed(2)}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-mint text-navy">
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
