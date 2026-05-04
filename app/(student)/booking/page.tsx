export default function BookingPage() {
  const bookings = [
    { id: '1', lab: 'Computer Science Lab A', seat: 14, date: 'Oct 25, 2024', time: '10:00 AM - 12:00 PM', status: 'Upcoming' },
    { id: '2', lab: 'Network Security Lab', seat: 5, date: 'Oct 23, 2024', time: '02:00 PM - 04:00 PM', status: 'Completed' },
  ];

  return (
    <div>
      <h1 className="text-4xl font-extrabold text-white mb-8 tracking-tight">My Bookings</h1>
      
      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-slate-300">
            <thead className="bg-slate-900/50 text-slate-400">
              <tr>
                <th className="p-6 font-medium">Lab</th>
                <th className="p-6 font-medium">Seat</th>
                <th className="p-6 font-medium">Date & Time</th>
                <th className="p-6 font-medium">Status</th>
                <th className="p-6 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {bookings.map(booking => (
                <tr key={booking.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-6 font-medium text-white">{booking.lab}</td>
                  <td className="p-6">Seat {booking.seat}</td>
                  <td className="p-6">
                    <div>{booking.date}</div>
                    <div className="text-sm text-slate-500">{booking.time}</div>
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      booking.status === 'Upcoming' 
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="p-6">
                    {booking.status === 'Upcoming' && (
                      <button className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors">
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
