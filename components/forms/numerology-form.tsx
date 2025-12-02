"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AstroCard } from "@/components/ui/astro-card";
import { AstroInput } from "@/components/ui/astro-input";
import { AstroButton } from "@/components/ui/astro-button";
import { useAppStore } from "@/lib/store";

const NUMEROLOGY_RULES: Record<string, string> = {
  "1": "Leadership bursts, initiate projects, command presence.",
  "2": "Diplomatic bridge builder, harmonize every situation.",
  "3": "Creative communicator, turn insights into inspiring words.",
  "4": "System builder with discipline and grounded execution.",
  "5": "Adventurous multi-hyphenate thriving on change.",
  "6": "Guardian energy—family, beauty, service in balance.",
  "7": "Mystic analyst, trusts data plus intuition.",
  "8": "Strategic wealth architect, manifesting ambition responsibly.",
  "9": "Altruistic closer, finishing cycles with wisdom.",
  "11": "Visionary transmitter of intuition and innovation.",
  "22": "Master builder converting cosmic blueprints to reality.",
};

const reduceDob = (dob: string) => {
  if (!dob) return null;
  const digits = dob.replace(/\D/g, "").split("").map(Number);
  let sum = digits.reduce((acc, digit) => acc + digit, 0);
  while (sum > 9 && sum !== 11 && sum !== 22) {
    sum = sum
      .toString()
      .split("")
      .map(Number)
      .reduce((acc, digit) => acc + digit, 0);
  }
  return String(sum);
};

export const NumerologyForm = () => {
  const router = useRouter();
  const setOutput = useAppStore((state) => state.setNumerologyOutput);
  const [dob, setDob] = useState("");
  const [isLoading, setLoading] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    const pathNumber = reduceDob(dob);
    if (pathNumber) {
      const summary = NUMEROLOGY_RULES[pathNumber] ?? "Calibrate path manually.";
      setOutput(`Path ${pathNumber}: ${summary}`);
      router.push("/categories");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <AstroCard>
        <AstroInput
          label="Date of Birth"
          type="date"
          value={dob}
          onChange={(event) => setDob(event.target.value)}
          required
        />
        <AstroButton className="mt-8 w-full" type="submit" isLoading={isLoading}>
          Generate Numerology
        </AstroButton>
      </AstroCard>
    </form>
  );
};

