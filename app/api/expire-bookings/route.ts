import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  try {
    // 1. Find bookings where payment_status = 'pending' and expires_at < now()
    const { data: expiredBookings, error: fetchError } = await supabase
      .from('bookings')
      .select('id, seat_id')
      .eq('payment_status', 'pending')
      .lt('expires_at', new Date().toISOString());

    if (fetchError) {
      throw fetchError;
    }

    if (!expiredBookings || expiredBookings.length === 0) {
      return NextResponse.json({ expired_count: 0 });
    }

    const seatIds = expiredBookings.map((b) => b.seat_id);
    const bookingIds = expiredBookings.map((b) => b.id);

    // 2. Update seat status back to 'available'
    const { error: seatUpdateError } = await supabase
      .from('seats')
      .update({ status: 'available' })
      .in('id', seatIds);

    if (seatUpdateError) {
      throw seatUpdateError;
    }

    // 3. Delete the expired bookings
    const { error: deleteError } = await supabase
      .from('bookings')
      .delete()
      .in('id', bookingIds);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ expired_count: bookingIds.length });
  } catch (error) {
    console.error('Error expiring bookings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
