import { cn } from "@/lib/utils";

export const AstroCard = ({
  children,
  className,
  padded = true,
}: {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}) => (
  <div
    className={cn(
      "glass-panel rounded-3xl border border-white/5 shadow-card",
      className,
      padded ? "p-8" : "",
    )}
  >
    {children}
  </div>
);

