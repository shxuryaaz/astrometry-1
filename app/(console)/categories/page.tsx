import { CategoryBoard } from "@/components/categories/category-board";
import { SectionHeading } from "@/components/ui/section-heading";

export default function CategoriesPage() {
  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Ask Questions"
        title="Relationships / Career / Money / Health"
        description="Each category generates a 150-character summary and surfaces Excel-mapped questions."
      />
      <CategoryBoard />
    </div>
  );
}

