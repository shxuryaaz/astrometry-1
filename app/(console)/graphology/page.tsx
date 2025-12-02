import { GraphologyUpload } from "@/components/forms/graphology-upload";
import { SectionHeading } from "@/components/ui/section-heading";

export default function GraphologyPage() {
  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Graphology"
        title="Upload Handwriting Sample"
        description="Identical glass card with upload slot and CTA to push into Supabase Storage."
      />
      <GraphologyUpload />
    </div>
  );
}

