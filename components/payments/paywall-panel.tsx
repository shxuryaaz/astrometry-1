"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AstroCard } from "@/components/ui/astro-card";
import { AstroButton } from "@/components/ui/astro-button";
import { useAppStore } from "@/lib/store";

type RazorpayHandlerResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key?: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayHandlerResponse) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

const loadRazorpay = () =>
  new Promise<boolean>((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export const PaywallPanel = () => {
  const router = useRouter();
  const unlockPaid = useAppStore((state) => state.unlockPaid);
  const [isLoading, setLoading] = useState(false);

    const handlePayment = async () => {
    setLoading(true);
    const loaded = await loadRazorpay();
    if (!loaded || !window.Razorpay) {
      setLoading(false);
      return;
    }
    const response = await fetch("/api/payment/create-order", {
      method: "POST",
    });
    const { order } = await response.json();
    const options: RazorpayOptions = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Astrology Intelligence",
      description: "Paid Question Unlock",
      order_id: order.id,
      handler: async (paymentResponse: RazorpayHandlerResponse) => {
        await fetch("/api/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentResponse),
        });
        unlockPaid();
        router.push("/paid-answer");
      },
    };
    const razorpay = new window.Razorpay(options);
    razorpay.open();
    setLoading(false);
  };

  const handleBypass = async () => {
    setLoading(true);
    await fetch("/api/test-bypass", { method: "POST" });
    unlockPaid();
    router.push("/paid-answer");
    setLoading(false);
  };

  return (
    <AstroCard className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-aurora">
          Paid wall
        </p>
        <h2 className="font-display text-3xl">₹51 Razorpay Checkout</h2>
        <p className="mt-2 text-sm text-white/70">
          Includes Dev Mode bypass exactly as in design.
        </p>
      </div>
      <div className="grid gap-3 text-sm text-white/70 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          Rule engine only. No RAG, no hallucinations.
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          Razorpay test checkout and bypass button for QA.
        </div>
      </div>
      <div className="flex flex-col gap-4 md:flex-row">
        <AstroButton
          className="flex-1"
          onClick={handlePayment}
          isLoading={isLoading}
        >
          Pay ₹51 with Razorpay
        </AstroButton>
        <AstroButton
          className="flex-1"
          variant="outline"
          onClick={handleBypass}
          isLoading={isLoading}
        >
          Bypass Payment (Dev Mode)
        </AstroButton>
      </div>
    </AstroCard>
  );
};

