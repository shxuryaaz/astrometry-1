import Razorpay from "razorpay";
import { NextResponse } from "next/server";

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return null;
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

export const POST = async () => {
  const razorpay = getRazorpay();
  if (!razorpay) {
    return NextResponse.json({
      order: {
        id: "test_order",
        amount: 5100,
        currency: "INR",
        status: "created",
      },
    });
  }

  const order = await razorpay.orders.create({
    amount: 51 * 100,
    currency: "INR",
    receipt: `astro-${Date.now()}`,
  });

  return NextResponse.json({ order });
};

