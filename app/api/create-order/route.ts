import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request: Request) {
  try {
    const { amount, booking_id } = await request.json();

    if (!amount || !booking_id) {
      return NextResponse.json({ error: 'amount and booking_id are required' }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const options = {
      amount: amount, // amount in smallest currency unit (paise)
      currency: 'INR',
      receipt: `receipt_${booking_id}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({ order_id: order.id }, { status: 200 });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
