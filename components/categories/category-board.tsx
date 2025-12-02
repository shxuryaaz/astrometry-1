// components/CategoryBoard.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AstroCard } from "@/components/ui/astro-card";
import { useAppStore } from "@/lib/store";
import type { RuleMapping } from "@/lib/types";

const categories = ["Relationships", "Career", "Money", "Health"];

export const CategoryBoard = () => {
  const router = useRouter();
  const kundli = useAppStore((state) => state.kundli);
  const setSelectedCategory = useAppStore((state) => state.setSelectedCategory);
  const setSelectedQuestion = useAppStore(
    (state) => state.setSelectedQuestion,
  );
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [summary, setSummary] = useState("");
  const [questions, setQuestions] = useState<RuleMapping[]>([]);
  const [isLoading, setLoading] = useState(false);

  const handleSelect = async (category: string) => {
    if (!kundli) {
      alert("Please generate your kundli first from the Astrology module.");
      return;
    }

    setActiveCategory(category);
    setSelectedCategory(category);
    setSelectedQuestion(null);
    setLoading(true);
    const response = await fetch("/api/category-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, kundli }),
    });
    const data = await response.json();
    setSummary(data.summary);
    setQuestions(data.questions ?? []);
    setLoading(false);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[2fr,1.2fr]">
      <div className="grid gap-4 md:grid-cols-2">
        {categories.map((category) => (
          <button key={category} onClick={() => handleSelect(category)}>
            <AstroCard
              className={`h-full text-left ${
                activeCategory === category
                  ? "border-astral"
                  : "border-white/10"
              }`}
            >
              <p className="text-xs uppercase tracking-[0.4em] text-white/40">
                {category}
              </p>
              <h3 className="font-display text-2xl font-semibold">
                {category} Matrix
              </h3>
              <p className="mt-2 text-sm text-white/70">
                Tap to fetch a deterministic 300–600 char summary and question stack.
              </p>
            </AstroCard>
          </button>
        ))}
      </div>
      <AstroCard className="flex flex-col gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-aurora">
            {activeCategory ?? "Category Detail"}
          </p>
          <h3 className="font-display text-2xl">
            {activeCategory ? `${activeCategory} Insights` : "Select a category"}
          </h3>
        </div>
        <p className="text-sm text-white/70">
          {isLoading
            ? "Loading deterministic rule stack..."
            : summary || "A deterministic 300–600 character summary will appear here."}
        </p>
        <div className="space-y-2">
          {questions.map((question) => (
            <button
              key={question.id}
              onClick={() => {
                setSelectedQuestion(question);
                router.push(`/categories/${question.id}`);
              }}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-white/80 hover:border-astral"
            >
              {question.question}
            </button>
          ))}
        </div>
      </AstroCard>
    </div>
  );
};
