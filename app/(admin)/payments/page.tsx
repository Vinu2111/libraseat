'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AdminPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending'>('all');

  useEffect(() => {
    fetchPayments();
  }, []);

  async function fetchPayments() {
    setLoading(true);
    try {
      // Fetch bookings joined with related data
      // For a payment table, you might need to query the `payments` table natively 
      // but the `bookings` table has the reliable relationship logic and the current state.
      const { data } = await supabase
        .from('bookings')
        .select(`
          id,
          payment_status,
          booked_at,
          students (name),
          seats (seat_number, labs (name)),
          payments (amount, plan, paid_at)
        `)
        .order('booked_at', { ascending: false });

      if (data) {
        const formatted = data.map((b: any) => {
          // If a booking has multiple payments somehow, just take the first. 
          // If none, default to empty object so we can show pending defaults
          const pInfo = Array.isArray(b.payments) ? b.payments[0] : b.payments;
          return {
            id: b.id,
            studentName: b.students?.name || 'Unknown',
            labName: b.seats?.labs?.name || 'Unknown',
            seatNumber: b.seats?.seat_number || 'N/A',
            // Default amount if pending could be 500
            amount: pInfo ? pInfo.amount / 100 : 500,
            plan: pInfo?.plan || 'Monthly',
            paidAt: pInfo?.paid_at ? new Date(pInfo.paid_at).toLocaleString() : 'N/A',
            status: b.payment_status || 'pending',
            bookedAt: new Date(b.booked_at).toLocaleString()
          };
        });
        setPayments(formatted);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredPayments = filter === 'all' ? payments : payments.filter(p => p.status === filter);
  const totalRevenue = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);

  return (
    <div>
      {/* Header and Total Revenue */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Payment History</h1>
          <p className="text-slate-400">Manage all transactions and revenue.</p>
        </div>
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 rounded-2xl shadow-lg shadow-emerald-500/20 text-white min-w-[200px]">
          <p className="text-emerald-100 text-sm font-medium mb-1">Total Revenue</p>
          <p className="text-4xl font-bold tracking-tight">₹{totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['all', 'paid', 'pending'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${
              filter === f 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-slate-300 whitespace-nowrap">
              <thead className="bg-slate-900/50 text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="p-5 font-medium">Student Name</th>
                  <th className="p-5 font-medium">Lab & Seat</th>
                  <th className="p-5 font-medium">Amount (₹)</th>
                  <th className="p-5 font-medium">Plan</th>
                  <th className="p-5 font-medium">Paid At</th>
                  <th className="p-5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredPayments.map(payment => (
                  <tr key={payment.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="p-5 font-medium text-white">{payment.studentName}</td>
                    <td className="p-5">
                      <span className="font-medium text-blue-400">{payment.labName}</span>
                      <span className="text-slate-500 ml-2">Seat {payment.seatNumber}</span>
                    </td>
                    <td className="p-5 font-bold text-white">₹{payment.amount}</td>
                    <td className="p-5 text-sm capitalize">{payment.plan}</td>
                    <td className="p-5 text-sm text-slate-400">{payment.status === 'paid' ? payment.paidAt : '-'}</td>
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide border ${
                        payment.status === 'paid' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {payment.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredPayments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">No payments found for this filter.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
