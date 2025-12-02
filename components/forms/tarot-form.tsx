"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AstroCard } from "@/components/ui/astro-card";
import { AstroTextarea } from "@/components/ui/astro-textarea";
import { AstroButton } from "@/components/ui/astro-button";
import { useAppStore } from "@/lib/store";

const TAROT_RULES = [
  "Emphasize archetypal symbolism only.",
  "Reference upright energies unless dev flag toggled.",
  "Keep responses deterministic and capped at 500 chars.",
];

export const TarotForm = () => {
  const router = useRouter();
  const setTarotQuestion = useAppStore((state) => state.setTarotQuestion);
  const [question, setQuestion] = useState("");
  const [isLoading, setLoading] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setTarotQuestion(question);
    router.push("/categories");
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <AstroCard>
        <div className="space-y-4">
          <AstroTextarea
            label="Ask your tarot question"
            placeholder="Type your question..."
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            required
          />
          <div className="grid gap-3 md:grid-cols-3">
            {TAROT_RULES.map((rule) => (
              <div
                key={rule}
                className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-white/70"
              >
                {rule}
              </div>
            ))}
          </div>
        </div>
        <AstroButton className="mt-6 w-full" type="submit" isLoading={isLoading}>
          Generate Tarot Preview
        </AstroButton>
      </AstroCard>
    </form>
  );
};

