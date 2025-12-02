// lib/ai-prompts.ts
const guardrail = "Do not invent any new astrological facts. Use only the provided BNN rule text.";

export const personalityPrompt = ({
  name,
  kundliContext,
}: {
  name: string;
  kundliContext: string;
}) => `System: ${guardrail}

You are the Astrology Intelligence Engine. Generate a vivid yet concise personality read for ${name}. You must stay within 500 characters. Use ONLY the supplied kundli and BNN rule snippets.

Kundli context:
${kundliContext}

Output:`;

export const categorySummaryPrompt = ({
  category,
  snippets,
}: {
  category: string;
  snippets: string;
}) => `System: ${guardrail}

Summarize the ${category} outlook in 300-600 characters.

Use ONLY the provided BNN snippets.

Do NOT generalize. Do NOT write vague astrology.

Extract specific deterministic meaning from the rules below:

${snippets}

Respond with plain text only.`;

export const paidAnswerPrompt = ({
  question,
  snippets,
}: {
  question: string;
  snippets: string;
}) => `System: ${guardrail}

Question: ${question}

Reference text:
${snippets}

Compose a deterministic 500-character answer referencing the supplied rule text only.`;
