// lib/openai-client.ts
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

console.log(
  "[openai-client] OpenAI Key Loaded:",
  process.env.OPENAI_API_KEY ? "YES" : "NO",
);

export const runLLM = async (prompt: string) => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY missing");
  }

  console.log("[openai-client] Calling OpenAI", {
    promptLength: prompt.length,
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  });

  const response = await openai.responses.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    input: prompt,
    temperature: 0,
    max_output_tokens: 1024,
  });

  return response;
};

export const extractResponseText = (response: any): string => {
  if (!response) return "";

  // 1) top-level shortcut (some SDKs expose output_text)
  if (response.output_text) {
    if (Array.isArray(response.output_text)) {
      return response.output_text.join(" ").trim();
    }
    if (typeof response.output_text === "string") {
      return response.output_text.trim();
    }
  }

  // 2) new-style response.output[] with content nodes
  try {
    const output = response.output ?? response.result?.output ?? [];
    if (Array.isArray(output) && output.length) {
      const pieces: string[] = [];
      for (const item of output) {
        if (!item) continue;
        // item.content is often an array of nodes
        const nodes = item.content ?? item;
        if (Array.isArray(nodes)) {
          for (const node of nodes) {
            if (node?.text?.content) pieces.push(node.text.content);
            else if (node?.text?.value) pieces.push(node.text.value);
            else if (typeof node === "string") pieces.push(node);
            else if (node?.type === "output_text" && node?.text) pieces.push(node.text);
          }
        } else if (typeof nodes === "string") {
          pieces.push(nodes);
        }
      }
      const joined = pieces.join(" ").trim();
      if (joined) return joined;
    }
  } catch (err) {
    // fallthrough
  }

  // 3) final fallback to JSON stringify and brute-force text extraction
  try {
    const text = JSON.stringify(response);
    return text.slice(0, 10000);
  } catch (_) {
    return "";
  }
};
