// app/api/category-summary/route.ts
import { NextResponse } from "next/server";
import { getCategoryQuestions, getRuleContext } from "@/lib/rule-engine";
import { categorySummaryPrompt } from "@/lib/ai-prompts";
import { extractResponseText, runLLM } from "@/lib/openai-client";
import type { KundliProfile } from "@/lib/types";

export const POST = async (request: Request) => {
  try {
    const { category, kundli } = (await request.json()) as {
      category: string;
      kundli?: KundliProfile;
    };
    if (!category) {
      return NextResponse.json({ error: "Missing category" }, { status: 400 });
    }

    if (!kundli) {
      return NextResponse.json(
        { error: "Missing kundli data" },
        { status: 400 },
      );
    }

    const { combinedText } = await getRuleContext(category);

    const prompt = categorySummaryPrompt({
      category,
      snippets: combinedText,
    });

    let rawResponse = await runLLM(prompt);
    let summary = extractResponseText(rawResponse).replace(/\s+/g, " ").trim();

    // Enforce between 300 and 600 chars
    const MIN = 300;
    const MAX = 600;

    // If too short, regenerate with strict instruction
    if (summary.length < MIN) {
      const regenPrompt = `System: Do not invent new facts. Use the provided text verbatim and expand deterministically.

Rewrite the following to be between ${MIN} and ${MAX} characters, using only the supplied snippets.

Original:
"""${summary}"""
      `;

      const regenResponse = await runLLM(regenPrompt);
      summary = extractResponseText(regenResponse).replace(/\s+/g, " ").trim();
    }

    // If too long, regenerate with strict instruction to condense
    if (summary.length > MAX) {
      const regenPrompt = `System: Do not invent new facts. Use the provided text verbatim and condense deterministically.

Rewrite the following to be between ${MIN} and ${MAX} characters (preferably closer to ${MAX}), using only the supplied snippets. Maintain all key insights but make it more concise.

Original:
"""${summary}"""
      `;

      const regenResponse = await runLLM(regenPrompt);
      summary = extractResponseText(regenResponse).replace(/\s+/g, " ").trim();
      
      // If still too long after regeneration, truncate as last resort (shouldn't happen)
      if (summary.length > MAX) {
        summary = summary.slice(0, MAX).trim();
      }
    }

    const questions = await getCategoryQuestions(category);

    return NextResponse.json({
      summary,
      questions,
    });
  } catch (error) {
    console.error("Category summary error:", error);
    return NextResponse.json({ error: "Failed to generate category summary" }, { status: 500 });
  }
};
