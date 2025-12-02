"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AstroCard } from "@/components/ui/astro-card";
import { useAppStore } from "@/lib/store";

export const PaidAnswerPanel = () => {
  const router = useRouter();
  const paidUnlocked = useAppStore((state) => state.paidUnlocked);
  const category = useAppStore((state) => state.selectedCategory);
  const question = useAppStore((state) => state.selectedQuestion);
  const [answer, setAnswer] = useState<string>("");

  useEffect(() => {
    const run = async () => {
      if (!paidUnlocked) {
        router.replace("/paywall");
        return;
      }
      if (!category || !question) return;
      const response = await fetch("/api/paid-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          ruleRef: question.rule_ref,
          question: question.question,
        }),
      });
      const data = await response.json();
      setAnswer(data.answer);
    };
    run();
  }, [category, question, paidUnlocked, router]);

  if (!category || !question) {
    return (
      <AstroCard>
        <p className="text-sm text-white/60">
          Select a question from the categories board to generate an answer.
        </p>
      </AstroCard>
    );
  }

  return (
    <AstroCard className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-aurora">
          Paid answer (500 chars)
        </p>
        <h2 className="font-display text-3xl">{question.question}</h2>
      </div>
      <p className="text-sm text-white/60">
        Rule Ref: {question.rule_ref} · Keywords: {question.keywords.join(", ")}
      </p>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-lg leading-relaxed text-white/80">
        {answer || "Generating deterministic paid answer..."}
      </div>
    </AstroCard>
  );
};

