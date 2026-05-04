'use client';
import React from 'react';

export type Seat = {
  id: string;
  seat_number: number | string;
  status: 'available' | 'booked' | 'pending';
  lab_id?: string;
};

interface SeatMapProps {
  seats: Seat[];
  onSeatClick?: (seat: Seat) => void;
}

export default function SeatMap({ seats, onSeatClick }: SeatMapProps) {
  // Sort seats numerically if possible
  const sortedSeats = [...seats].sort((a, b) => {
    const numA = typeof a.seat_number === 'number' ? a.seat_number : parseInt(a.seat_number as string, 10);
    const numB = typeof b.seat_number === 'number' ? b.seat_number : parseInt(b.seat_number as string, 10);
    return (isNaN(numA) ? 0 : numA) - (isNaN(numB) ? 0 : numB);
  });

  return (
    <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl">
      <div className="flex justify-center mb-10 gap-8 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-md border-2 border-slate-400 bg-transparent"></div>
          <span className="text-sm font-medium text-slate-300">Available</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-md bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
          <span className="text-sm font-medium text-slate-300">Booked (Paid)</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-md bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
          <span className="text-sm font-medium text-slate-300">Pending (Unpaid)</span>
        </div>
      </div>
      
      {seats.length === 0 ? (
        <div className="text-center py-10 text-slate-400">
          No seats found for this lab.
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-2 md:grid-cols-8 md:gap-4 lg:grid-cols-10">
          {sortedSeats.map((seat) => {
            let seatStyle = '';
            if (seat.status === 'available') {
              seatStyle = 'bg-transparent border-2 border-slate-400 text-slate-300 hover:bg-slate-700 hover:border-slate-300 hover:text-white hover:scale-105 cursor-pointer';
            } else if (seat.status === 'booked') {
              seatStyle = 'bg-emerald-500 border-2 border-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)] cursor-not-allowed opacity-90';
            } else if (seat.status === 'pending') {
              seatStyle = 'bg-red-500 border-2 border-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.4)] cursor-not-allowed opacity-90';
            }

            return (
              <button
                key={seat.id}
                disabled={seat.status !== 'available'}
                onClick={() => seat.status === 'available' && onSeatClick?.(seat)}
                className={`aspect-square flex items-center justify-center rounded-lg text-sm font-bold cursor-pointer transition-all duration-300 ${seatStyle}`}
              >
                {seat.seat_number}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
