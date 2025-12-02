import { NextResponse } from "next/server";
import { getRuleContext } from "@/lib/rule-engine";
import { paidAnswerPrompt } from "@/lib/ai-prompts";
import { extractResponseText, runLLM } from "@/lib/openai-client";

export const POST = async (request: Request) => {
  const { category, ruleRef, question } = (await request.json()) as {
    category: string;
    ruleRef?: string;
    question: string;
  };

  if (!category || !question) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { combinedText } = await getRuleContext(category, ruleRef);
  const prompt = paidAnswerPrompt({
    question,
    snippets: combinedText,
  });

  const response = await runLLM(prompt);
  let answer = extractResponseText(response).replace(/\s+/g, " ").trim();
  if (answer.length > 500) {
    answer = `${answer.slice(0, 500).trim()}…`;
  }
  return NextResponse.json({ answer });
};

