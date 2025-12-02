import { AstrologyForm } from "@/components/forms/astrology-form";
import { SectionHeading } from "@/components/ui/section-heading";

export default function AstrologyInputPage() {
  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Astrology Intake"
        title="Enter Kundli Input Exactly"
        description="Collect Name, Gender, DOB, TOB, POB per the pixel-perfect card layout."
      />
      <AstrologyForm />
    </div>
  );
}

