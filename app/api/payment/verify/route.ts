import crypto from "crypto";
import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    (await request.json()) as Record<string, string>;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (!process.env.RAZORPAY_KEY_SECRET) {
    return NextResponse.json({ success: true, devBypass: true });
  }

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  const success = expectedSignature === razorpay_signature;

  return NextResponse.json({ success });
};

