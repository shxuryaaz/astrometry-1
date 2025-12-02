"use client";

import { CheckCircle2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { AstroCard } from "@/components/ui/astro-card";
import { AstroButton } from "@/components/ui/astro-button";

const bullets = [
  "Consent to Prokerala-powered Kundli generation",
  "Supabase-secured storage of questionnaire",
  "Rule-based deterministic interpretations only",
];

export const LoginCard = () => (
  <AstroCard className="max-w-2xl bg-white/5">
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-aurora">
          Welcome
        </p>
        <h1 className="font-display text-4xl font-semibold text-white">
          Astrology Intelligence Access
        </h1>
        <p className="mt-2 text-white/70">
          Accept the terms exactly as shown in the design and proceed with your
          Gmail login to unlock the Intelligence Console.
        </p>
      </div>
      <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        {bullets.map((item) => (
          <div key={item} className="flex items-center space-x-3 text-sm">
            <CheckCircle2 className="h-4 w-4 text-aurora" />
            <span>{item}</span>
          </div>
        ))}
      </div>
      <AstroButton
        className="w-full"
        onClick={() => signIn("google", { callbackUrl: "/modules" })}
      >
        Login with Gmail
      </AstroButton>
      <p className="text-center text-xs text-white/60">
        By continuing you agree to the T&Cs exactly as previewed in the design.
      </p>
    </div>
  </AstroCard>
);

