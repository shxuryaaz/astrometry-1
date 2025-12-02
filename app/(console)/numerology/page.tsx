import { NumerologyForm } from "@/components/forms/numerology-form";
import { SectionHeading } from "@/components/ui/section-heading";

export default function NumerologyPage() {
  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Numerology"
        title="Deterministic DOB Channel"
        description="Exactly like the PDF card—single DOB input, CTA to compute and push to categories."
      />
      <NumerologyForm />
    </div>
  );
}

