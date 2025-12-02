import type { KnowledgeChunk } from "./types";
import type { RuleMapping } from "./types";

// Sign synonym mapping for better matching
const SIGN_SYNONYMS: Record<string, string[]> = {
  aries: ["aries", "mesha"],
  taurus: ["taurus", "vrishabha", "vrishab"],
  gemini: ["gemini", "mithuna", "mithun"],
  cancer: ["cancer", "karka", "kark"],
  leo: ["leo", "simha", "singh"],
  virgo: ["virgo", "kanya"],
  libra: ["libra", "tula"],
  scorpio: ["scorpio", "vrischika", "vrishchik"],
  sagittarius: ["sagittarius", "dhanus", "dhanu"],
  capricorn: ["capricorn", "makara", "makar"],
  aquarius: ["aquarius", "kumbha", "kumbh"],
  pisces: ["pisces", "meena", "mina"],
};

function normalizeSign(sign: string): string[] {
  const signLower = sign.toLowerCase();
  for (const [canonical, variants] of Object.entries(SIGN_SYNONYMS)) {
    if (variants.some((v) => v === signLower || signLower.includes(v) || v.includes(signLower))) {
      return [canonical, ...variants];
    }
  }
  return [signLower];
}

export function findBestChunksForRule(
  rule: RuleMapping,
  chunks: KnowledgeChunk[],
  limit = 8,
): KnowledgeChunk[] {
  const matches: { chunk: KnowledgeChunk; score: number }[] = [];

  const ruleKeywords = new Set(
    (rule.keywords || []).map((k) => k.toLowerCase()),
  );

  for (const chunk of chunks) {
    let score = 0;

    if (rule.planets && rule.planets.length > 0 && chunk.keywords) {
      const chunkPlanets = chunk.keywords
        .filter((k) =>
          [
            "sun",
            "moon",
            "mars",
            "mercury",
            "jupiter",
            "venus",
            "saturn",
            "rahu",
            "ketu",
          ].includes(k.toLowerCase()),
        )
        .map((k) => k.toLowerCase());
      const rulePlanets = rule.planets.map((p) => p.toLowerCase().trim());

      for (const rp of rulePlanets) {
        if (chunkPlanets.some((cp) => cp.includes(rp) || rp.includes(cp))) {
          score += 100;
        }
      }
    }

    if (rule.houses && rule.houses.length > 0 && chunk.keywords) {
      const chunkHouses = chunk.keywords
        .filter((k) => k.toLowerCase().startsWith("house "))
        .map((k) => k.replace("house ", "").toLowerCase());
      const ruleHouses = rule.houses.map((h) =>
        h.toLowerCase().replace(/\D/g, ""),
      );

      for (const rh of ruleHouses) {
        if (chunkHouses.includes(rh)) {
          score += 30;
        }
      }
    }

    if (chunk.keywords) {
      const chunkTokens = new Set(chunk.keywords.map((k) => k.toLowerCase()));
      for (const k of ruleKeywords) {
        if (chunkTokens.has(k)) {
          score += 5;
        }
      }
    }

    if (score > 0) {
      matches.push({ chunk, score });
    }
  }

  if (!matches.length) {
    return chunks.slice(0, limit);
  }

  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((m) => m.chunk);
}

function isGarbageChunk(chunk: KnowledgeChunk): boolean {
  const content = chunk.content.trim();
  
  // Filter out headings-only chunks (less than 80 chars)
  if (content.length < 80) return true;
  
  // Filter out index/table of contents style chunks like "Saturn ................ 81"
  if (/^\s*(Sun|Moon|Mars|Mercury|Jupiter|Venus|Saturn|Rahu|Ketu)[^a-z]*\d+$/i.test(content)) {
    return true;
  }
  
  // Filter out chunks that are just planet name with dots/separators
  if (/^\s*(Sun|Moon|Mars|Mercury|Jupiter|Venus|Saturn|Rahu|Ketu)[\s\.\-\:]+$/i.test(content)) {
    return true;
  }
  
  // Filter out "Planet : Other Significations" style headers
  if (/^\s*(Sun|Moon|Mars|Mercury|Jupiter|Venus|Saturn|Rahu|Ketu)\s*[:\.]\s*(Other|Significations|Signification|Rules|Rule)/i.test(content)) {
    return true;
  }
  
  // Filter out chunks that are just dots/separators
  if (/^[\s\.\-\:]+$/.test(content)) return true;
  
  // Filter out page numbers only
  if (/^\d+$/.test(content)) return true;
  
  // Filter out chunks that are mostly non-alphabetic (likely formatting artifacts)
  const alphaChars = content.match(/[a-zA-Z]/g)?.length || 0;
  if (alphaChars < content.length * 0.3) return true;
  
  return false;
}

export function findChunksForPlanet(
  planet: string,
  sign?: string,
  house?: number,
  chunks: KnowledgeChunk[],
  limit = 2,
): KnowledgeChunk[] {
  const planetLower = planet.toLowerCase();
  const signLower = sign?.toLowerCase();
  const houseStr = house ? String(house) : null;

  const matches: { chunk: KnowledgeChunk; score: number }[] = [];

  for (const chunk of chunks) {
    // Skip garbage chunks
    if (isGarbageChunk(chunk)) continue;
    
    let score = 0;

    if (chunk.keywords) {
      const chunkPlanets = chunk.keywords
        .filter((k) =>
          [
            "sun",
            "moon",
            "mars",
            "mercury",
            "jupiter",
            "venus",
            "saturn",
            "rahu",
            "ketu",
          ].includes(k.toLowerCase()),
        )
        .map((k) => k.toLowerCase());

      if (
        chunkPlanets.some(
          (cp) => cp.includes(planetLower) || planetLower.includes(cp),
        )
      ) {
        score += 100;
      }

      if (signLower) {
        const signVariants = normalizeSign(signLower);
        const chunkSigns = chunk.keywords
          .filter((k) => k.toLowerCase().startsWith("sign "))
          .map((k) => k.replace("sign ", "").toLowerCase());
        
        // Check if any chunk sign matches any variant of the target sign
        const hasSignMatch = chunkSigns.some((cs) =>
          signVariants.some((sv) => cs.includes(sv) || sv.includes(cs))
        );
        
        if (hasSignMatch) {
          score += 50;
        }
      }

      if (houseStr) {
        const chunkHouses = chunk.keywords
          .filter((k) => k.toLowerCase().startsWith("house "))
          .map((k) => k.replace("house ", "").toLowerCase());
        if (chunkHouses.includes(houseStr)) {
          score += 30;
        }
      }
    }

    if (score > 0) {
      matches.push({ chunk, score });
    }
  }

  if (!matches.length) {
    const fallback = chunks
      .filter((c) => !isGarbageChunk(c))
      .filter((c) =>
        c.keywords?.some((k) => k.toLowerCase().includes(planetLower)),
      );
    return fallback.length > 0 ? fallback.slice(0, 1) : [];
  }

  // Only keep high-scoring matches (score > 50) and limit to 1-2 best
  const highQualityMatches = matches
    .filter((m) => m.score > 50)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  // If we have high-quality matches, return them; otherwise return top 1 even if score is lower
  if (highQualityMatches.length > 0) {
    return highQualityMatches.map((m) => m.chunk);
  }

  // Fallback: return top 1 match even if score is lower (but still > 0)
  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, 1)
    .map((m) => m.chunk);
}
