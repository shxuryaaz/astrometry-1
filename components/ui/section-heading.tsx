import { cn } from "@/lib/utils";

export const SectionHeading = ({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) => (
  <div className={cn("space-y-2 text-center text-white", className)}>
    {eyebrow && (
      <p className="text-xs uppercase tracking-[0.3em] text-aurora">
        {eyebrow}
      </p>
    )}
    <h2 className="font-display text-3xl font-semibold">{title}</h2>
    {description && (
      <p className="mx-auto max-w-2xl text-sm text-white/70">{description}</p>
    )}
  </div>
);

