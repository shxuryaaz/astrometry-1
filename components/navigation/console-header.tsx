"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { AstroButton } from "@/components/ui/astro-button";

const links = [
  { href: "/modules", label: "Modules" },
  { href: "/astrology", label: "Astrology" },
  { href: "/categories", label: "Categories" },
  { href: "/paywall", label: "Paywall" },
];

export const ConsoleHeader = () => {
  const pathname = usePathname();

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/5 bg-white/5 px-6 py-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-aurora">
          Astrology Intelligence
        </p>
        <h1 className="font-display text-xl font-semibold">Mission Control</h1>
      </div>
      <nav className="flex flex-wrap items-center gap-3 text-sm text-white/70">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-full px-4 py-2 ${
              pathname.startsWith(link.href)
                ? "bg-astral text-white"
                : "bg-white/5 text-white/70"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <AstroButton variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
        Logout
      </AstroButton>
    </header>
  );
};

