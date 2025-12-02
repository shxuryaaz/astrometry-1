"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AstroCard } from "@/components/ui/astro-card";
import { AstroInput } from "@/components/ui/astro-input";
import { AstroButton } from "@/components/ui/astro-button";
import { useAppStore } from "@/lib/store";

export const AstrologyForm = () => {
  const router = useRouter();
  const setKundli = useAppStore((state) => state.setKundli);
  const [isLoading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    gender: "Female",
    dob: "",
    tob: "",
    pob: "",
  });

  const handleChange = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/kundli", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (data.profile) {
        setKundli(data.profile);
        router.push("/personality");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <AstroCard>
        <div className="grid gap-6 md:grid-cols-2">
          <AstroInput
            label="Name"
            placeholder="Enter name"
            value={form.name}
            onChange={(event) => handleChange("name", event.target.value)}
            required
          />
          <AstroInput
            label="Gender"
            placeholder="Female"
            value={form.gender}
            onChange={(event) => handleChange("gender", event.target.value)}
            required
          />
          <AstroInput
            label="Date of Birth"
            type="date"
            value={form.dob}
            onChange={(event) => handleChange("dob", event.target.value)}
            required
          />
          <AstroInput
            label="Time of Birth"
            type="time"
            value={form.tob}
            onChange={(event) => handleChange("tob", event.target.value)}
            required
          />
          <AstroInput
            label="Place of Birth"
            placeholder="City, Country"
            value={form.pob}
            onChange={(event) => handleChange("pob", event.target.value)}
            required
          />
        </div>
        <AstroButton className="mt-8 w-full" type="submit" isLoading={isLoading}>
          Generate Kundli via Prokerala
        </AstroButton>
      </AstroCard>
    </form>
  );
};

