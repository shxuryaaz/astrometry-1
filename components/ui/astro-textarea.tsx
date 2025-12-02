"use client";

import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
};

export const AstroTextarea = ({
  label,
  hint,
  className,
  ...props
}: Props) => (
  <label className="flex w-full flex-col space-y-2 text-sm font-medium text-white/80">
    {label && <span>{label}</span>}
    <textarea
      {...props}
      className={cn(
        "min-h-[120px] rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-astral focus:outline-none",
        className,
      )}
    />
    {hint && <span className="text-xs text-white/40">{hint}</span>}
  </label>
);

