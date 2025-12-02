import { PaidAnswerPanel } from "@/components/answers/paid-answer-panel";
import { SectionHeading } from "@/components/ui/section-heading";

export default function PaidAnswerPage() {
  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Paid Output"
        title="Deterministic 500-char Answer"
        description="Uses Excel rule_ref to fetch PDF snippets via the rule engine."
      />
      <PaidAnswerPanel />
    </div>
  );
}

