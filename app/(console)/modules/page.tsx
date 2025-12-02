import Link from "next/link";
import { Sun, Calculator, PenSquare, ScrollText } from "lucide-react";
import { AstroCard } from "@/components/ui/astro-card";
import { SectionHeading } from "@/components/ui/section-heading";

const modules = [
  {
    title: "Astrology",
    description: "Full Kundli intelligence with planetary deep dives.",
    href: "/astrology",
    icon: <Sun className="h-10 w-10 text-aurora" />,
  },
  {
    title: "Numerology",
    description: "Deterministic DOB numerology pathways.",
    href: "/numerology",
    icon: <Calculator className="h-10 w-10 text-aurora" />,
  },
  {
    title: "Graphology",
    description: "Upload handwriting for structured analysis.",
    href: "/graphology",
    icon: <PenSquare className="h-10 w-10 text-aurora" />,
  },
  {
    title: "Tarot",
    description: "Guardrailed tarot interpretations (500 chars).",
    href: "/tarot",
    icon: <ScrollText className="h-10 w-10 text-aurora" />,
  },
];

export default function ModuleSelectionPage() {
  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Select module"
        title="Choose your Intelligence Channel"
        description="Match the exact layout from the design. One tap module selection cards with lucide icons."
      />
      <div className="grid gap-6 md:grid-cols-2">
        {modules.map((module) => (
          <Link key={module.title} href={module.href}>
            <AstroCard className="h-full transition-all hover:-translate-y-1 hover:border-astral/60">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  {module.icon}
                  <span className="text-sm uppercase tracking-[0.4em] text-white/40">
                    Launch
                  </span>
                </div>
                <h3 className="font-display text-2xl font-semibold">
                  {module.title}
                </h3>
                <p className="text-sm text-white/70">{module.description}</p>
              </div>
            </AstroCard>
          </Link>
        ))}
      </div>
    </div>
  );
}

