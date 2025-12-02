"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AstroCard } from "@/components/ui/astro-card";
import { AstroButton } from "@/components/ui/astro-button";
import { useAppStore } from "@/lib/store";

export const PersonalityPanel = () => {
  const router = useRouter();
  const kundli = useAppStore((state) => state.kundli);
  const [personality, setPersonality] = useState<string>("");
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (!kundli) return;
      setLoading(true);
      const response = await fetch("/api/personality", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: kundli }),
      });
      const data = await response.json();
      setPersonality(data.output ?? data.personality ?? "");
      setLoading(false);
    };
    run();
  }, [kundli]);

  useEffect(() => {
    if (!kundli) {
      router.replace("/astrology");
    }
  }, [kundli, router]);

  if (!kundli) return null;

  return (
    <div className="space-y-6">
      <AstroCard>
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="flex-1 space-y-3">
            <p className="text-xs uppercase tracking-[0.5em] text-aurora">
              500-char personality output
            </p>
            <h2 className="font-display text-3xl">
              Let me tell you about yourself
            </h2>
            <p className="text-sm text-white/70">
              Powered by deterministic Kundli JSON + BNN planet rules. No RAG.
            </p>
          </div>
          <AstroButton onClick={() => router.push("/categories")}>
            Proceed to Categories
          </AstroButton>
        </div>
      </AstroCard>
      <AstroCard>
        {isLoading ? (
          <p className="animate-pulse text-sm text-white/60">
            Generating deterministic profile...
          </p>
        ) : (
          <p className="text-lg leading-relaxed text-white/80 whitespace-pre-wrap break-words">
            {personality || "Awaiting generation..."}
          </p>
        )}
      </AstroCard>
    </div>
  );
};

