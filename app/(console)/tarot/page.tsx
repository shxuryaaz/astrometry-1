import { TarotForm } from "@/components/forms/tarot-form";
import { SectionHeading } from "@/components/ui/section-heading";

export default function TarotPage() {
  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Tarot"
        title="Question Input Panel"
        description="Card layout mirrors the design, culminating in 500-char tarot generation."
      />
      <TarotForm />
    </div>
  );
}

