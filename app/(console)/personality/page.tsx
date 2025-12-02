import { PersonalityPanel } from "@/components/personality/personality-panel";
import { SectionHeading } from "@/components/ui/section-heading";

export default function PersonalityPage() {
  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Self Narrative"
        title="Let me tell you about yourself"
        description="500-character personality summary using Kundli JSON plus BNN PDF rule snippets."
      />
      <PersonalityPanel />
    </div>
  );
}

