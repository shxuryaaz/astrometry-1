// lib/rule-engine.ts
import { getKnowledgeBase } from "./pdf-loader";
import { findRuleMappingByRef, getRuleMappings } from "./excel-loader";
import { findChunksForPlanet } from "./rule-bridge";
import type {
  KnowledgeChunk,
  KundliPlanet,
  KundliProfile,
  RuleEngineResult,
  RuleMapping,
  SectionKey,
} from "./types";

const PLANET_SECTIONS: Record<string, SectionKey> = {
  sun: "planetary_rules",
  moon: "planetary_rules",
  mars: "planetary_rules",
  mercury: "planetary_rules",
  jupiter: "planetary_rules",
  venus: "planetary_rules",
  saturn: "planetary_rules",
  rahu: "planetary_rules",
  ketu: "planetary_rules",
};

const scoreChunk = (chunk: KnowledgeChunk, needles: string[]) => {
  const hay = `${chunk.label} ${chunk.content}`.toLowerCase();
  let score = 0;
  for (const needle of needles) {
    if (!needle) continue;
    if (hay.includes(needle)) score += 3;
    const parts = needle.split(" ");
    for (const p of parts) {
      if (p && hay.includes(p)) score += 1;
    }
  }
  // shorter chunks are more focused
  score += Math.max(0, 5 - Math.floor(chunk.content.length / 300));
  return score;
};

export const getCategoryQuestions = async (category: string) => {
  const mappings = await getRuleMappings();
  if (!category) return mappings;
  return mappings.filter(
    (mapping) => mapping.category?.toLowerCase() === category.toLowerCase(),
  );
};

export const getRuleContext = async (
  category: string,
  ruleRef?: string,
): Promise<RuleEngineResult & { mapping?: RuleMapping | null }> => {
  const mapping = ruleRef ? await findRuleMappingByRef(ruleRef) : null;

  // Build REAL keywords from excel row
  const excelKeywords: string[] = [];
  if (mapping?.planets) excelKeywords.push(...mapping.planets);
  if (mapping?.houses) excelKeywords.push(...mapping.houses);
  if (mapping?.transits) excelKeywords.push(...mapping.transits);
  if (mapping?.primary_pages) excelKeywords.push(mapping.primary_pages);
  if (mapping?.secondary_pages) excelKeywords.push(mapping.secondary_pages);

  const keywords = [
    ...excelKeywords.map((k) => k.toLowerCase()),
    ...(mapping?.keywords ?? []).map((k) => k.toLowerCase()),
    category.toLowerCase(),
  ].filter(Boolean);

  const kb = await getKnowledgeBase();
  const all = Object.values(kb).flat();

  // PRIORITY: match chunks by excel-derived keywords
  const strongMatches = all.filter((chunk) => {
    const hay = (chunk.label + " " + chunk.content).toLowerCase();
    return excelKeywords.some((kw) => hay.includes(kw.toLowerCase()));
  });

  // fallback weak match
  const weakMatches = all.filter((chunk) => {
    const hay = (chunk.label + " " + chunk.content).toLowerCase();
    return keywords.some((kw) => hay.includes(kw));
  });

  const final = [...strongMatches, ...weakMatches].slice(0, 12);

  return {
    mapping,
    snippets: final,
    combinedText: final
      .map((c) => `${c.label}: ${c.content}`)
      .join("\n")
      .slice(0, 5000),
  };
};

export const getPlanetSnippets = async (
  planet: KundliPlanet,
): Promise<KnowledgeChunk[]> => {
  const knowledgeBase = await getKnowledgeBase();
  const allChunks = Object.values(knowledgeBase).flat();

  const matchedChunks = findChunksForPlanet(
    planet.planet,
    planet.sign,
    planet.house,
    allChunks,
    2,
  );

  return matchedChunks;
};

export const buildPersonalityContext = async (
  profile: KundliProfile,
): Promise<string> => {
  const snippets: KnowledgeChunk[] = [];
  const snippetDetails: Array<{
    planet: KundliPlanet;
    snippet: KnowledgeChunk;
  }> = [];

  console.log("[rule-engine] Kundli data:", JSON.stringify(profile, null, 2));

  for (const planet of profile.planets) {
    const planetSnippets = await getPlanetSnippets(planet);
    console.log("[rule-engine] Matched planet snippets", {
      planet: planet.planet,
      sign: planet.sign,
      house: planet.house,
      snippetCount: planetSnippets.length,
    });
    snippets.push(...planetSnippets);
    planetSnippets.forEach((snippet) =>
      snippetDetails.push({ planet, snippet }),
    );

    planetSnippets.forEach((snippet, index) => {
      console.log(
        `[rule-engine] --- Planet ${planet.planet} Snippet ${index} ---`,
      );
      console.log("[rule-engine] Content:", snippet.content.slice(0, 500));
      console.log("[rule-engine] Keywords:", snippet.keywords.slice(0, 10));
      console.log("[rule-engine] ----------------------------------------");
    });
  }

  const combined = snippets
    .map((snippet) => `${snippet.label}: ${snippet.content.slice(0, 150)}`)
    .join("\n\n");

  console.log("[rule-engine] Personality context snippets", {
    profile: profile.name,
    snippetCount: snippets.length,
    combinedLength: combined.length,
  });

  return combined.slice(0, 1500);
};
