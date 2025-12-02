import { getRuleMappings } from "@/lib/excel-loader";
import { getRuleContext } from "@/lib/rule-engine";
import { paidAnswerPrompt } from "@/lib/ai-prompts";
import { runLLM, extractResponseText } from "@/lib/openai-client";

export default async function CategoryQuestionPage(props: {
  params: Promise<{ questionId: string }>;
}) {
  const { questionId } = await props.params; // IMPORTANT FIX

  const mappings = await getRuleMappings();
  const mapping = mappings.find((m) => m.id === questionId);

  if (!mapping) {
    return (
      <div className="p-10 text-center text-red-400">
        Invalid question ID.
      </div>
    );
  }

  // Load rule text for this specific question - pass the questionId (Excel row ID)
  const { combinedText } = await getRuleContext(mapping.category, questionId);

  const prompt = paidAnswerPrompt({
    question: mapping.question,
    snippets: combinedText,
  });

  const llmResponse = await runLLM(prompt);
  const answer = extractResponseText(llmResponse).trim();

  return (
    <div className="p-10 space-y-6">
      <h1 className="text-3xl font-bold">{mapping.question}</h1>
      <p className="text-white/70 leading-relaxed">{answer}</p>
    </div>
  );
}

