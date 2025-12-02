"use client";

import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
};

export const AstroInput = ({ label, hint, className, ...props }: Props) => (
  <label className="flex w-full flex-col space-y-2 text-sm font-medium text-white/80">
    {label && <span>{label}</span>}
    <input
      {...props}
      className={cn(
        "h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-white placeholder:text-white/40 focus:border-astral focus:outline-none",
        className,
      )}
    />
    {hint && <span className="text-xs text-white/40">{hint}</span>}
  </label>
);

