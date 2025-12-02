"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { AstroCard } from "@/components/ui/astro-card";
import { AstroButton } from "@/components/ui/astro-button";
import { useAppStore } from "@/lib/store";

export const GraphologyUpload = () => {
  const router = useRouter();
  const setFileUrl = useAppStore((state) => state.setGraphologyFileUrl);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fileInput = event.currentTarget.elements.namedItem(
      "graphology-file",
    ) as HTMLInputElement;

    if (!fileInput.files?.[0]) return;

    setLoading(true);
    const body = new FormData();
    body.append("file", fileInput.files[0]);
    const response = await fetch("/api/graphology/upload", {
      method: "POST",
      body,
    });
    const data = await response.json();
    if (data.url) {
      setFileUrl(data.url);
      router.push("/categories");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleUpload}>
      <AstroCard className="flex flex-col items-center gap-6 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/5">
          <Upload className="h-10 w-10 text-aurora" />
        </div>
        <p className="text-sm text-white/70">
          Upload handwriting sample to Supabase Storage. We will pass the public
          URL to the AI graphology parser per specifications.
        </p>
        <label className="w-full cursor-pointer rounded-2xl border border-dashed border-white/20 bg-white/5 p-6 text-sm text-white/70 hover:border-astral/70">
          <input
            id="graphology-file"
            name="graphology-file"
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(event) =>
              setFileName(event.target.files?.[0]?.name ?? null)
            }
            required
          />
          {fileName ? `Selected: ${fileName}` : "Choose file"}
        </label>
        <AstroButton className="w-full" type="submit" isLoading={isLoading}>
          Upload to Supabase Storage
        </AstroButton>
      </AstroCard>
    </form>
  );
};

