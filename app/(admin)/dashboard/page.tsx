'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ students: 0, bookings: 0, revenue: 0, availableSeats: 0 });
  const [labsOverview, setLabsOverview] = useState<any[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      // 1. Fetch Stats
      const [{ count: studentsCount }, { count: bookingsCount }, { data: paymentsData }, { count: availableSeatsCount }] = await Promise.all([
        supabase.from('students').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
        supabase.from('payments').select('amount'),
        supabase.from('seats').select('*', { count: 'exact', head: true }).eq('status', 'available')
      ]);

      const totalRevenue = paymentsData?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      setStats({
        students: studentsCount || 0,
        bookings: bookingsCount || 0,
        revenue: totalRevenue / 100, // Converting paise to INR
        availableSeats: availableSeatsCount || 0,
      });

      // 2. Fetch Labs Overview
      const { data: labsData } = await supabase.from('labs').select('*');
      const { data: seatsData } = await supabase.from('seats').select('lab_id, status');
      
      if (labsData && seatsData) {
        const overview = labsData.map(lab => {
          const labSeats = seatsData.filter(s => s.lab_id === lab.id);
          const booked = labSeats.filter(s => s.status === 'booked').length;
          const pending = labSeats.filter(s => s.status === 'pending').length;
          const available = labSeats.filter(s => s.status === 'available').length;
          const total = lab.total_seats || labSeats.length;
          const fillPercentage = total > 0 ? ((booked + pending) / total) * 100 : 0;
          
          return { id: lab.id, name: lab.name, total, booked, pending, available, fillPercentage };
        });
        setLabsOverview(overview);
      }

      // 3. Fetch Recent Bookings
      // Note: If you don't have foreign key relations set up correctly in Supabase, this join might fail.
      // Make sure students, seats, and labs tables are properly linked via foreign keys.
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select(`
          id,
          booked_at,
          payment_status,
          students (name),
          seats (seat_number, labs (name))
        `)
        .order('booked_at', { ascending: false })
        .limit(5);
        
      if (bookingsData) {
        const formattedBookings = bookingsData.map((b: any) => ({
          id: b.id,
          studentName: b.students?.name || 'Unknown Student',
          seatNumber: b.seats?.seat_number || 'N/A',
          labName: b.seats?.labs?.name || 'Unknown Lab',
          bookedAt: new Date(b.booked_at).toLocaleString(),
          paymentStatus: b.payment_status,
        }));
        setRecentBookings(formattedBookings);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-white mb-8 tracking-tight">Overview</h1>
      
      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
          <p className="text-slate-400 text-sm font-medium mb-1">Total Students</p>
          <p className="text-3xl font-bold text-white">{stats.students}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
          <p className="text-slate-400 text-sm font-medium mb-1">Total Bookings</p>
          <p className="text-3xl font-bold text-white">{stats.bookings}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"></div>
          <p className="text-slate-400 text-sm font-medium mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-emerald-400">₹{stats.revenue.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
          <p className="text-slate-400 text-sm font-medium mb-1">Available Seats</p>
          <p className="text-3xl font-bold text-blue-400">{stats.availableSeats}</p>
        </div>
      </div>

      {/* Labs Overview */}
      <h2 className="text-2xl font-bold text-white mb-6">Labs Capacity</h2>
      <div className="grid gap-6 mb-12">
        {labsOverview.map(lab => (
          <div key={lab.id} className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">{lab.name}</h3>
                <div className="flex gap-4 text-sm font-medium">
                  <span className="text-emerald-400">{lab.booked} Booked</span>
                  <span className="text-amber-400">{lab.pending} Pending</span>
                  <span className="text-blue-400">{lab.available} Available</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-white">{lab.booked + lab.pending}</span>
                <span className="text-slate-500"> / {lab.total}</span>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${lab.fillPercentage > 90 ? 'bg-red-500' : lab.fillPercentage > 75 ? 'bg-amber-500' : 'bg-blue-500'}`}
                style={{ width: `${lab.fillPercentage}%` }}
              ></div>
            </div>
          </div>
        ))}
        {labsOverview.length === 0 && <p className="text-slate-500">No lab data found.</p>}
      </div>

      {/* Recent Bookings */}
      <h2 className="text-2xl font-bold text-white mb-6">Recent Bookings</h2>
      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-slate-300">
            <thead className="bg-slate-900/50 text-slate-400 border-b border-slate-700">
              <tr>
                <th className="p-5 font-medium">Student</th>
                <th className="p-5 font-medium">Lab & Seat</th>
                <th className="p-5 font-medium">Booked At</th>
                <th className="p-5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {recentBookings.map(booking => (
                <tr key={booking.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="p-5 font-medium text-white">{booking.studentName}</td>
                  <td className="p-5">
                    <span className="font-medium text-blue-400">{booking.labName}</span>
                    <span className="text-slate-500 ml-2">Seat {booking.seatNumber}</span>
                  </td>
                  <td className="p-5 text-sm text-slate-400">{booking.bookedAt}</td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide border ${
                      booking.paymentStatus === 'paid' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {booking.paymentStatus?.toUpperCase() || 'PENDING'}
                    </span>
                  </td>
                </tr>
              ))}
              {recentBookings.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">No recent bookings found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
