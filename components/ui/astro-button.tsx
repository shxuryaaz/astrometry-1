"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  variant?: "primary" | "outline" | "ghost";
  className?: string;
  isLoading?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
};

export const AstroButton = ({
  children,
  variant = "primary",
  className,
  isLoading,
  ...props
}: Props) => {
  const styles = {
    primary:
      "bg-astral hover:bg-astral/80 text-white shadow-glow border border-white/10",
    outline:
      "border border-white/20 text-white hover:border-astral hover:text-astral",
    ghost: "text-white/60 hover:text-white",
  }[variant];

  return (
    <button
      {...props}
      className={cn(
        "relative inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-medium transition-all",
        styles,
        className,
      )}
      disabled={isLoading || props.disabled}
    >
      {isLoading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
      )}
      {children}
    </button>
  );
};

