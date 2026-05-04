import Link from 'next/link';

export default function LabCard({ lab }: { lab: { id: string, name: string, availableSeats: number, totalSeats: number } }) {
  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-500 transition-all hover:shadow-lg hover:shadow-blue-500/20 group">
      <h3 className="text-xl font-bold text-white mb-2">{lab.name}</h3>
      <div className="flex justify-between items-end mt-6">
        <div>
          <p className="text-slate-400 text-sm">Available Seats</p>
          <p className="text-2xl font-bold text-emerald-400">{lab.availableSeats} <span className="text-sm text-slate-500 font-normal">/ {lab.totalSeats}</span></p>
        </div>
        <Link href={`/seats/${lab.id}`} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors opacity-0 group-hover:opacity-100">
          View Seats
        </Link>
      </div>
    </div>
  );
}
