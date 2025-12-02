// lib/excel-loader.ts
import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";
import { getSupabaseServiceClient } from "./supabase";
import type { RuleMapping } from "./types";

const resolveExcelPath = () => {
  const candidates = [
    process.env.RULE_MAPPING_PATH,
    path.join(process.cwd(), "Astrology_245_Question_Mapping.xlsx"),
    path.join(process.cwd(), "data", "Astrology_245_Question_Mapping.xlsx"),
    path.join(process.cwd(), "..", "Astrology_245_Question_Mapping.xlsx"),
    path.join("/mnt/data", "Astrology_245_Question_Mapping.xlsx"), // dev container / uploads
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  // fallback: return first path so caller can log
  return candidates[0]!;
};

let ruleMappingsPromise: Promise<RuleMapping[]> | null = null;

const normalizeList = (raw: unknown): string[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((entry) => String(entry).trim()).filter(Boolean);
  }
  return String(raw)
    .split(/[,;/&]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
};

const detectCategory = (row: Record<string, unknown>): string => {
  // Accept explicit "category" column, else fall back to "section", else try keywords
  const maybe =
    (row.category ?? row.Category ?? row.section ?? row.Section ?? "") as string;

  if (maybe && typeof maybe === "string") {
    const v = maybe.trim().toLowerCase();
    if (!v) return "General";
    if (v.includes("relationship") || v.includes("marriage") || v.includes("compat")) return "Relationships";
    if (v.includes("career") || v.includes("profession") || v.includes("job") || v.includes("work")) return "Career";
    if (v.includes("money") || v.includes("wealth") || v.includes("finance") || v.includes("wealth")) return "Money";
    if (v.includes("health") || v.includes("wellness") || v.includes("illness")) return "Health";
    // return titlecased best-effort
    return v.charAt(0).toUpperCase() + v.slice(1);
  }

  // fallback: try to infer from question keywords
  const question = String(row.question ?? row.Question ?? "").toLowerCase();
  if (question.includes("money") || question.includes("wealth") || question.includes("finance")) return "Money";
  if (question.includes("job") || question.includes("career") || question.includes("work") || question.includes("profession")) return "Career";
  if (question.includes("health") || question.includes("illness") || question.includes("wellness")) return "Health";
  if (question.includes("marriage") || question.includes("spouse") || question.includes("relationship") || question.includes("partner")) return "Relationships";

  return "General";
};

const parseWorkbook = (filePath: string): RuleMapping[] => {
  const fileBuffer = fs.readFileSync(filePath);
  const workbook = XLSX.read(fileBuffer, {
    type: "buffer",
    cellDates: true,
    cellNF: false,
    cellText: false,
  });

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });

  const mappings: RuleMapping[] = rows
    .map((row, index) => {
      // normalize keys: try several common header names
      const id =
        String(row.id ?? row.ID ?? row["q_no."] ?? row["q_no"] ?? index + 1) ?? String(index + 1);

      const rawQuestion = String(row.question ?? row.Question ?? row["Question Text"] ?? row["q"] ?? "");
      const question = rawQuestion.trim();

      const rule_ref = String(row.rule_ref ?? row.ruleRef ?? row["Rule"] ?? row.rule ?? "").trim() || "";

      const pdf_page =
        row.pdf_page ?? row.Page ?? row["primary_pages"] ?? row.primary_pages ?? row["primary_pages"] ?? "";

      const primary_pages = String(
        row.primary_pages ??
          row.PrimaryPages ??
          row["Primary Pages"] ??
          row["primary pages"] ??
          row.primary ??
          ""
      ).trim() || undefined;

      const secondary_pages = String(
        row.secondary_pages ??
          row.SecondaryPages ??
          row["Secondary Pages"] ??
          row["secondary pages"] ??
          row.secondary ??
          ""
      ).trim() || undefined;

      // planets/houses/transits columns might be comma separated, or space separated
      const planets = normalizeList(row.planets ?? row.Planets ?? row.Planet ?? row["planet(s)"] ?? "");
      const houses = normalizeList(row.houses ?? row.Houses ?? row.House ?? "");
      const transits = normalizeList(row.transits ?? row.Transits ?? "");

      const keywords = normalizeList(row.keywords ?? row.Tags ?? row.tags ?? "");

      const category = detectCategory(row);

      return {
        id: String(id),
        category,
        question,
        rule_ref,
        pdf_page: String(pdf_page ?? "").trim() || undefined,
        primary_pages,
        secondary_pages,
        keywords,
        planets,
        houses,
        transits,
      } as RuleMapping;
    })
    .filter((m) => m.question && m.question.length > 0);

  return mappings;
};

const persistMappingsToSupabase = async (mappings: RuleMapping[]) => {
  try {
    const supabase = getSupabaseServiceClient();
    // attempt to upsert — if no creds, getSupabaseServiceClient will throw and we catch
    await supabase.from("rule_mappings").upsert(mappings, {
      onConflict: "id",
    });
    console.log("[excel-loader] persisted mappings to supabase:", mappings.length);
  } catch (error) {
    // non-fatal — warn and continue
    console.warn("[excel-loader] Unable to sync rule mappings:", error instanceof Error ? error.message : String(error));
  }
};

const loadRuleMappings = async (): Promise<RuleMapping[]> => {
  const filePath = resolveExcelPath();
  if (!filePath || !fs.existsSync(filePath)) {
    console.warn("[excel-loader] Excel file missing - looked at:", filePath);
    return [];
  }

  console.log("[excel-loader] Found Excel at:", filePath);
  const parsed = parseWorkbook(filePath);

  // Best-effort persist but do not fail the loader if Supabase isn't configured
  try {
    await persistMappingsToSupabase(parsed);
  } catch (e) {
    // already handled in persistMappingsToSupabase
  }

  console.log("[excel-loader] Loaded", parsed.length, "mappings.");
  return parsed;
};

export const getRuleMappings = async () => {
  if (!ruleMappingsPromise) {
    ruleMappingsPromise = loadRuleMappings();
  }
  return ruleMappingsPromise;
};

export const findRuleMappingByRef = async (ruleRef: string) => {
  const mappings = await getRuleMappings();
  return (
    mappings.find(
      (mapping) => (mapping.rule_ref ?? "").toLowerCase() === (ruleRef ?? "").toLowerCase(),
    ) ?? null
  );
};

export const findRuleMappingById = async (id: string) => {
  const mappings = await getRuleMappings();
  return mappings.find((mapping) => mapping.id === id) ?? null;
};
