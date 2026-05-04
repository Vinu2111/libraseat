'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import SeatMap, { Seat } from '../../../../components/SeatMap';

// Global declaration for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function SeatsPage({ params }: { params: { labId: string } }) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [lab, setLab] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [studentName, setStudentName] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  useEffect(() => {
    // Attempt to expire stale bookings when a student opens the seats page
    fetch('/api/expire-bookings').catch(console.error);
    
    fetchLabAndSeats();

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'seats',
          filter: `lab_id=eq.${params.labId}`,
        },
        (payload) => {
          const updatedSeat = payload.new as Seat;
          setSeats((prevSeats) => {
            const index = prevSeats.findIndex(s => s.id === updatedSeat.id);
            if (index !== -1) {
              const newSeats = [...prevSeats];
              newSeats[index] = updatedSeat;
              return newSeats;
            }
            return [...prevSeats, updatedSeat];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [params.labId]);

  const fetchLabAndSeats = async () => {
    setLoading(true);
    const { data: labData } = await supabase
      .from('labs')
      .select('*')
      .eq('id', params.labId)
      .single();
    
    if (labData) setLab(labData);

    const { data: seatsData } = await supabase
      .from('seats')
      .select('*')
      .eq('lab_id', params.labId);
      
    if (seatsData) setSeats(seatsData as Seat[]);
    setLoading(false);
  };

  const handleSeatClick = (seat: Seat) => {
    setSelectedSeat(seat);
    setBookingSuccess(false);
    setPaymentComplete(false);
    setCurrentBookingId(null);
    setStudentName('');
  };

  const confirmBooking = async () => {
    const { data: authData } = await supabase.auth.getSession();
    const userId = authData?.session?.user?.id;

    if (!userId) {
      alert('You must be logged in to book a seat.');
      setIsBooking(false);
      return;
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const { data: bookingData, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        student_id: userId,
        seat_id: selectedSeat.id,
        booked_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        payment_status: 'pending'
      })
      .select()
      .single();

    if (bookingError || !bookingData) {
      console.error('Error inserting booking:', bookingError);
      alert('Failed to book seat. It might have been taken.');
      setIsBooking(false);
      return;
    }

    const { error: seatUpdateError } = await supabase
      .from('seats')
      .update({ status: 'pending' })
      .eq('id', selectedSeat.id);

    if (seatUpdateError) {
      console.error('Error updating seat:', seatUpdateError);
    }

    setCurrentBookingId(bookingData.id);
    setBookingSuccess(true);
    setIsBooking(false);
  };

  const handlePayment = async () => {
    if (!currentBookingId || !selectedSeat) return;
    setIsPaying(true);
    const amount = 50000; // 500 INR in paise

    try {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, booking_id: currentBookingId }),
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount.toString(),
        currency: 'INR',
        name: 'LibraSeat',
        description: 'Seat Booking Payment',
        order_id: data.order_id,
        handler: async function (response: any) {
          try {
            // Update bookings
            await supabase
              .from('bookings')
              .update({ payment_status: 'paid' })
              .eq('id', currentBookingId);

            // Update seats
            await supabase
              .from('seats')
              .update({ status: 'booked' })
              .eq('id', selectedSeat.id);

            // Insert payment
            await supabase
              .from('payments')
              .insert({
                booking_id: currentBookingId,
                razorpay_id: response.razorpay_payment_id,
                amount: amount,
                paid_at: new Date().toISOString(),
                plan: 'monthly'
              });

            setPaymentComplete(true);
          } catch (err) {
            console.error('Error updating DB after payment:', err);
            alert('Payment was successful but error updating records. Contact support.');
          }
        },
        prefill: {
          name: studentName,
          email: 'student@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#2563EB'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        alert('Payment Failed: ' + response.error.description);
      });
      rzp.open();
    } catch (error) {
      console.error('Payment initialization failed:', error);
      alert('Could not initialize payment. Please try again later.');
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">
          {lab ? lab.name : 'Loading Lab...'}
        </h1>
        <p className="text-slate-400 text-lg">Select an available seat to book it for your session.</p>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <SeatMap seats={seats} onSeatClick={handleSeatClick} />
      )}

      {selectedSeat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 p-0 md:p-4">
          <div className="bg-slate-900 border border-slate-700 md:rounded-3xl shadow-2xl p-6 md:p-8 max-w-md w-full h-full md:h-auto overflow-y-auto relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedSeat(null)}
              className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            
            <h2 className="text-3xl font-bold text-white mb-6">Seat {selectedSeat.seat_number}</h2>
            
            {paymentComplete ? (
              <div className="text-center py-4">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Payment Successful!</h3>
                <p className="text-slate-400 mb-8">Your seat has been confirmed. Enjoy your lab session.</p>
                
                <button 
                  onClick={() => setSelectedSeat(null)}
                  className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all shadow-lg border border-slate-600"
                >
                  Close
                </button>
              </div>
            ) : bookingSuccess ? (
              <div className="text-center py-4">
                <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Booking Reserved!</h3>
                <p className="text-slate-400 mb-8">Your seat has been temporarily reserved. Please proceed to payment to confirm.</p>
                
                <button 
                  onClick={handlePayment}
                  disabled={isPaying}
                  className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/25 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPaying ? 'Opening Checkout...' : 'Proceed to Payment (₹500)'}
                </button>
              </div>
            ) : (
              <div>
                <p className="text-slate-400 mb-8">You are about to book this seat. Please enter your name to proceed.</p>
                
                <div className="mb-8">
                  <label className="block text-sm font-medium text-slate-300 mb-3">Student Name</label>
                  <input 
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="E.g., Jane Doe"
                    className="w-full bg-slate-800 border-2 border-slate-700 text-white rounded-xl px-5 py-4 focus:outline-none focus:ring-0 focus:border-blue-500 transition-all text-lg placeholder:text-slate-500"
                  />
                </div>
                
                <div className="flex gap-4">
                  <button 
                    onClick={() => setSelectedSeat(null)}
                    className="flex-1 py-4 px-4 bg-transparent hover:bg-slate-800 text-white font-bold rounded-xl transition-all border-2 border-slate-700"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmBooking}
                    disabled={isBooking || !studentName.trim()}
                    className="flex-1 py-4 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
                  >
                    {isBooking ? 'Booking...' : 'Confirm Booking'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
