import { NextResponse } from "next/server";
import type { KundliProfile } from "@/lib/types";
import { buildPersonalityContext } from "@/lib/rule-engine";
import { personalityPrompt } from "@/lib/ai-prompts";
import { extractResponseText, runLLM } from "@/lib/openai-client";

export const POST = async (request: Request) => {
  const { profile } = (await request.json()) as { profile: KundliProfile };

  if (!profile) {
    return NextResponse.json({ error: "Missing profile" }, { status: 400 });
  }

  const context = await buildPersonalityContext(profile);
  const prompt = personalityPrompt({
    name: profile.name,
    kundliContext: context,
  });
  console.log("[debug] OpenAI Prompt Length:", prompt.length);
  console.log("[debug] OpenAI Prompt:", prompt);

  const response = await runLLM(prompt);

  let output = extractResponseText(response);
  output = output.replace(/\s+/g, " ").trim();

  return NextResponse.json({ output });
};

