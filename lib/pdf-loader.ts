import fs from "fs";
import path from "path";
import { v4 as uuid } from "uuid";
import type {
  KnowledgeBase,
  KnowledgeChunk,
  RuleEngineRequest,
  RuleEngineResult,
  SectionKey,
} from "./types";

const findPdfPath = () => {
  const candidates = [
    process.env.BNN_PDF_PATH,
    path.join(process.cwd(), "BNN_05_Dec_24.pdf"),
    path.join(process.cwd(), "data", "BNN_05_Dec_24.pdf"),
    path.join(process.cwd(), "..", "data", "BNN_05_Dec_24.pdf"),
    path.join(process.cwd(), "..", "BNN_05_Dec_24.pdf"),
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  throw new Error(`BNN PDF not found in expected paths: ${candidates.join(", ")}`);
};

const PLANET_PATTERNS: Record<string, RegExp[]> = {
  sun: [
    /\b(Sun|Surya)\b/i,
    /Sun\s+in\s+[A-Za-z]+/i,
    /If\s+Sun\s+is\s+in/i,
    /When\s+Sun\s+is\s+placed/i,
    /Surya\s+.*\s+in/i,
  ],
  moon: [
    /\b(Moon|Chandra)\b/i,
    /Moon\s+in\s+[A-Za-z]+/i,
    /If\s+Moon\s+is\s+in/i,
    /When\s+Moon\s+is\s+placed/i,
    /Chandra\s+.*\s+in/i,
  ],
  mars: [
    /\b(Mars|Mangal|Kuja)\b/i,
    /Mars\s+in\s+[A-Za-z]+/i,
    /If\s+Mars\s+is\s+in/i,
    /Mangal\s+.*\s+in/i,
  ],
  mercury: [
    /\b(Mercury|Budh|Budha)\b/i,
    /Mercury\s+in\s+[A-Za-z]+/i,
    /If\s+Mercury\s+is\s+in/i,
  ],
  jupiter: [
    /\b(Jupiter|Guru|Brihaspati)\b/i,
    /Jupiter\s+in\s+[A-Za-z]+/i,
    /If\s+Jupiter\s+is\s+in/i,
    /Guru\s+.*\s+in/i,
  ],
  venus: [
    /\b(Venus|Shukra)\b/i,
    /Venus\s+in\s+[A-Za-z]+/i,
    /If\s+Venus\s+is\s+in/i,
  ],
  saturn: [
    /\b(Saturn|Shani|Sani)\b/i,
    /Saturn\s+in\s+[A-Za-z]+/i,
    /If\s+Saturn\s+is\s+in/i,
    /Shani\s+.*\s+in/i,
  ],
  rahu: [
    /\b(Rahu|North\s+Node)\b/i,
    /Rahu\s+in\s+[A-Za-z]+/i,
    /If\s+Rahu\s+is\s+in/i,
  ],
  ketu: [
    /\b(Ketu|South\s+Node)\b/i,
    /Ketu\s+in\s+[A-Za-z]+/i,
    /If\s+Ketu\s+is\s+in/i,
  ],
};

// Expanded sign pattern with all Sanskrit variants
const SIGN_PATTERN = /\b(Aries|Taurus|Gemini|Cancer|Leo|Virgo|Libra|Scorpio|Sagittarius|Capricorn|Aquarius|Pisces|Mesha|Vrishabha|Vrishab|Mithuna|Mithun|Karka|Kark|Simha|Singh|Kanya|Tula|Vrischika|Vrishchik|Dhanus|Dhanu|Makara|Makar|Kumbha|Kumbh|Meena|Mina)\b/i;

const HOUSE_PATTERN = /\b([1-9]|10|11|12)(?:st|nd|rd|th)?\s+house\b/i;

const SKIP_PATTERNS = [
  /गुरुर्ब्रह्मा/i,
  /न अहं कता/i,
  /Notion Press/i,
  /ISBN/i,
  /Publisher/i,
  /^\s*$/, // empty lines
];

function isSkipLine(line: string): boolean {
  return SKIP_PATTERNS.some((pattern) => pattern.test(line));
}

// Enhanced heading pattern that matches "Planet in Sign", "Planet placed in Sign", etc.
const HEADING_PATTERN = /(\bSun|Moon|Mars|Mercury|Jupiter|Venus|Saturn|Rahu|Ketu|Surya|Chandra|Mangal|Budh|Guru|Shukra|Shani\b).{0,20}\b(in|placed in|occupies|situated in|posited in|is in|is placed in)\b.{0,20}\b(Aries|Taurus|Gemini|Cancer|Leo|Virgo|Libra|Scorpio|Sagittarius|Capricorn|Aquarius|Pisces|Mesha|Vrishabha|Vrishab|Mithuna|Mithun|Karka|Kark|Simha|Singh|Kanya|Tula|Vrischika|Vrishchik|Dhanus|Dhanu|Makara|Makar|Kumbha|Kumbh|Meena|Mina)\b/i;

// Sign-first pattern: "Aries (Sun Exalted)", "Cancer (Moon's Rashi)", etc.
const SIGN_PLANET_HEADING = /\b(Aries|Taurus|Gemini|Cancer|Leo|Virgo|Libra|Scorpio|Sagittarius|Capricorn|Aquarius|Pisces|Mesha|Vrishabha|Vrishab|Mithuna|Mithun|Karka|Kark|Simha|Singh|Kanya|Tula|Vrischika|Vrishchik|Dhanus|Dhanu|Makara|Makar|Kumbha|Kumbh|Meena|Mina)\b\s*[:\-\(]?\s*\(([^)]+)\)/i;

// Inline rule patterns for bullet points and conditional statements
const INLINE_RULE_PATTERN = /(?:●|•|[-*])\s*(Sun|Moon|Mars|Mercury|Jupiter|Venus|Saturn|Rahu|Ketu|Surya|Chandra|Mangal|Budh|Guru|Shukra|Shani)\s+in\s+(Aries|Taurus|Gemini|Cancer|Leo|Virgo|Libra|Scorpio|Sagittarius|Capricorn|Aquarius|Pisces|Mesha|Vrishabha|Vrishab|Mithuna|Mithun|Karka|Kark|Simha|Singh|Kanya|Tula|Vrischika|Vrishchik|Dhanus|Dhanu|Makara|Makar|Kumbha|Kumbh|Meena|Mina)/i;

const INLINE_CONDITIONAL_PATTERN = /If\s+(Sun|Moon|Mars|Mercury|Jupiter|Venus|Saturn|Rahu|Ketu|Surya|Chandra|Mangal|Budh|Guru|Shukra|Shani)\s+(?:is\s+)?(?:in|placed in|occupies)\s+(?:the\s+)?(\d{1,2})(?:st|nd|rd|th)?\s+house/i;

const INLINE_HOUSE_PATTERN = /(Sun|Moon|Mars|Mercury|Jupiter|Venus|Saturn|Rahu|Ketu|Surya|Chandra|Mangal|Budh|Guru|Shukra|Shani).{0,15}(?:in|placed in|occupies)\s+(?:the\s+)?(\d{1,2})(?:st|nd|rd|th)?\s+house/i;

function extractPlanetFromParentheses(parenText: string): string | null {
  const text = parenText.toLowerCase();
  const planetMap: Record<string, string> = {
    sun: "sun", surya: "sun", exalted: "sun", // "Sun Exalted" -> sun
    moon: "moon", chandra: "moon", rashi: "moon", // "Moon's Rashi" -> moon
    mars: "mars", mangal: "mars", kuja: "mars",
    mercury: "mercury", budh: "mercury", budha: "mercury",
    jupiter: "jupiter", guru: "jupiter", brihaspati: "jupiter",
    venus: "venus", shukra: "venus",
    saturn: "saturn", shani: "saturn", sani: "saturn",
    rahu: "rahu",
    ketu: "ketu",
  };
  
  for (const [key, planet] of Object.entries(planetMap)) {
    if (text.includes(key)) return planet;
  }
  return null;
}

function detectHeading(line: string): {
  planet: string | null;
  sign: string | null;
  house: string | null;
} | null {
  if (isSkipLine(line)) return null;

  const normalized = line.trim();
  if (normalized.length < 5 || normalized.length > 200) return null;

  const planetMap: Record<string, string> = {
    sun: "sun", surya: "sun",
    moon: "moon", chandra: "moon",
    mars: "mars", mangal: "mars", kuja: "mars",
    mercury: "mercury", budh: "mercury", budha: "mercury",
    jupiter: "jupiter", guru: "jupiter", brihaspati: "jupiter",
    venus: "venus", shukra: "venus",
    saturn: "saturn", shani: "saturn", sani: "saturn",
    rahu: "rahu",
    ketu: "ketu",
  };

  // Pattern 1: Sign-first format "Aries (Sun Exalted)"
  const signPlanetMatch = line.match(SIGN_PLANET_HEADING);
  if (signPlanetMatch) {
    const signName = signPlanetMatch[1];
    const parenText = signPlanetMatch[2];
    const detectedPlanet = extractPlanetFromParentheses(parenText);
    
    if (detectedPlanet) {
      const houseMatch = line.match(HOUSE_PATTERN);
      const house = houseMatch ? houseMatch[1] : null;
      return { planet: detectedPlanet, sign: signName, house };
    }
  }

  // Pattern 2: Enhanced heading pattern "Planet in Sign"
  const headingMatch = line.match(HEADING_PATTERN);
  if (headingMatch) {
    const planetName = headingMatch[1].toLowerCase();
    const signName = headingMatch[3];
    const detectedPlanet = planetMap[planetName] || null;
    
    if (detectedPlanet) {
      const houseMatch = line.match(HOUSE_PATTERN);
      const house = houseMatch ? houseMatch[1] : null;
      return { planet: detectedPlanet, sign: signName, house };
    }
  }

  // Pattern 3: Inline rule pattern "● Mars in Leo"
  const inlineMatch = line.match(INLINE_RULE_PATTERN);
  if (inlineMatch) {
    const planetName = inlineMatch[1].toLowerCase();
    const signName = inlineMatch[2];
    const detectedPlanet = planetMap[planetName] || null;
    
    if (detectedPlanet) {
      return { planet: detectedPlanet, sign: signName, house: null };
    }
  }

  // Pattern 4: Conditional house pattern "If Saturn is in the 11th house"
  const conditionalMatch = line.match(INLINE_CONDITIONAL_PATTERN);
  if (conditionalMatch) {
    const planetName = conditionalMatch[1].toLowerCase();
    const house = conditionalMatch[2];
    const detectedPlanet = planetMap[planetName] || null;
    
    if (detectedPlanet) {
      return { planet: detectedPlanet, sign: null, house };
    }
  }

  // Pattern 5: Inline house pattern "Venus in the 2nd house"
  const houseMatch = line.match(INLINE_HOUSE_PATTERN);
  if (houseMatch) {
    const planetName = houseMatch[1].toLowerCase();
    const house = houseMatch[2];
    const detectedPlanet = planetMap[planetName] || null;
    
    if (detectedPlanet) {
      return { planet: detectedPlanet, sign: null, house };
    }
  }

  // Fallback: Original pattern matching
  let detectedPlanet: string | null = null;
  for (const [planet, patterns] of Object.entries(PLANET_PATTERNS)) {
    if (patterns.some((pattern) => pattern.test(line))) {
      detectedPlanet = planet;
      break;
    }
  }

  if (!detectedPlanet) return null;

  const signMatch = line.match(SIGN_PATTERN);
  const sign = signMatch ? signMatch[0] : null;

  const housePatternMatch = line.match(HOUSE_PATTERN);
  const house = housePatternMatch ? housePatternMatch[1] : null;

  return { planet: detectedPlanet, sign, house };
}

function isRuleBoundary(line: string, nextLine?: string, prevLine?: string): boolean {
  // Blank line followed by capitalized heading indicates new rule
  if (!line && nextLine && /^[A-Z]/.test(nextLine)) {
    const nextHeading = detectHeading(nextLine);
    if (nextHeading && nextHeading.planet) return true;
  }
  
  // New bullet point indicates new rule
  if (/^[●•\-\*]\s/.test(line)) return true;
  
  // Colon after planet placement indicates rule end
  if (/:\s*$/.test(line) && /(Sun|Moon|Mars|Mercury|Jupiter|Venus|Saturn|Rahu|Ketu|in|house)/i.test(line)) {
    return true;
  }
  
  // Next line starts with capital letter and is a new heading
  if (nextLine && /^[A-Z]/.test(nextLine) && detectHeading(nextLine)) {
    return true;
  }
  
  // Line is very short and looks like a heading/separator
  if (line.length < 30 && /^[A-Z][a-z]+\s*[:\-]/.test(line)) {
    return true;
  }
  
  return false;
}

function normalizeText(text: string): string {
  return text
    .replace(/[•·▪◦]/g, "-")
    .replace(/\u2013|\u2014/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

const SECTION_META: Record<
  SectionKey,
  { label: string; anchors: string[]; keywords: string[] }
> = {
  planetary_rules: {
    label: "Planetary Rules",
    anchors: ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"],
    keywords: ["planet", "placement", "interpretation"],
  },
  combinations: {
    label: "Combinations",
    anchors: ["Combination", "Dual", "Pairing"],
    keywords: ["combination", "pair", "alignment"],
  },
  topics: {
    label: "Life Topics",
    anchors: ["Marriage", "Career", "Health", "Wealth", "Education"],
    keywords: ["topic", "aspect", "focus"],
  },
  two_planet_combinations: {
    label: "Two Planet Combinations",
    anchors: ["Two-Planet", "Dual Planet", "Synergy"],
    keywords: ["two-planet", "interaction"],
  },
  transit_rules: {
    label: "Transit Rules",
    anchors: ["Transit", "Gochar", "Movement"],
    keywords: ["transit", "movement", "current"],
  },
  profession_rules: {
    label: "Profession Rules",
    anchors: ["Profession", "Career Path", "Work"],
    keywords: ["profession", "career", "job"],
  },
  relationship_rules: {
    label: "Relationship Rules",
    anchors: ["Relationship", "Marriage", "Compatibility"],
    keywords: ["relationship", "marriage", "compatibility"],
  },
};

const createEmptyKnowledgeBase = (): KnowledgeBase =>
  Object.keys(SECTION_META).reduce((acc, key) => {
    acc[key as SectionKey] = [];
    return acc;
  }, {} as KnowledgeBase);

export const chunkPdfText = (text: string): KnowledgeBase => {
  const base = createEmptyKnowledgeBase();
  // Preserve blank lines for boundary detection
  const lines = text.split(/\r?\n/).map((line) => line.trim());

  let currentChunk: {
    id: string;
    planet: string | null;
    sign: string | null;
    house: string | null;
    section: SectionKey;
    content: string;
    keywords: string[];
  } | null = null;

  const chunks: KnowledgeChunk[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const prevLine = i > 0 ? lines[i - 1] : undefined;
    const nextLine = i + 1 < lines.length ? lines[i + 1] : undefined;
    
    // Skip garbage lines but preserve blank lines for boundary detection
    if (line && isSkipLine(line)) continue;

    const heading = detectHeading(line);

    // Check if this is a new heading - start new chunk
    if (heading && heading.planet) {
      if (currentChunk && currentChunk.content.trim().length > 20) {
        chunks.push({
          id: currentChunk.id,
          section: currentChunk.section,
          label: SECTION_META[currentChunk.section].label,
          content: normalizeText(currentChunk.content),
          keywords: currentChunk.keywords,
        });
      }

      const keywords = [heading.planet];
      if (heading.sign) keywords.push(`sign ${heading.sign.toLowerCase()}`);
      if (heading.house) keywords.push(`house ${heading.house}`);

      currentChunk = {
        id: `chunk_${chunks.length + 1}`,
        planet: heading.planet,
        sign: heading.sign,
        house: heading.house,
        section: "planetary_rules",
        content: line + "\n",
        keywords,
      };
      continue;
    }

    if (currentChunk) {
      // Check if this line is an inline rule pattern (bullet with planet+sign)
      const inlineHeading = detectHeading(line);
      if (inlineHeading && inlineHeading.planet && /^[●•\-\*]/.test(line)) {
        // Close current chunk and start new one for inline rule
        if (currentChunk.content.trim().length > 20) {
          chunks.push({
            id: currentChunk.id,
            section: currentChunk.section,
            label: SECTION_META[currentChunk.section].label,
            content: normalizeText(currentChunk.content),
            keywords: currentChunk.keywords,
          });
        }
        
        const keywords = [inlineHeading.planet];
        if (inlineHeading.sign) keywords.push(`sign ${inlineHeading.sign.toLowerCase()}`);
        if (inlineHeading.house) keywords.push(`house ${inlineHeading.house}`);
        
        currentChunk = {
          id: `chunk_${chunks.length + 1}`,
          planet: inlineHeading.planet,
          sign: inlineHeading.sign,
          house: inlineHeading.house,
          section: "planetary_rules",
          content: line + "\n",
          keywords,
        };
        continue;
      }
      
      // Handle blank lines - if blank line followed by heading, it's a boundary
      if (!line && nextLine) {
        const nextHeading = detectHeading(nextLine);
        if (nextHeading && nextHeading.planet) {
          // Close current chunk if it has content
          if (currentChunk && currentChunk.content.trim().length > 50) {
            chunks.push({
              id: currentChunk.id,
              section: currentChunk.section,
              label: SECTION_META[currentChunk.section].label,
              content: normalizeText(currentChunk.content),
              keywords: currentChunk.keywords,
            });
          }
          // The next iteration will handle the heading and start new chunk
          continue;
        }
        // Blank line but not followed by heading - just skip it
        continue;
      }
      
      // Skip blank lines that aren't boundaries
      if (!line) continue;
      
      // Check if we've hit a rule boundary
      const isBoundary = isRuleBoundary(line, nextLine, prevLine);
      
      // If boundary detected and chunk has meaningful content, close it
      if (isBoundary && currentChunk.content.trim().length > 50) {
        chunks.push({
          id: currentChunk.id,
          section: currentChunk.section,
          label: SECTION_META[currentChunk.section].label,
          content: normalizeText(currentChunk.content),
          keywords: currentChunk.keywords,
        });
        
        // Start new chunk if this line is a heading
        const nextHeading = detectHeading(line);
        if (nextHeading && nextHeading.planet) {
          const keywords = [nextHeading.planet];
          if (nextHeading.sign) keywords.push(`sign ${nextHeading.sign.toLowerCase()}`);
          if (nextHeading.house) keywords.push(`house ${nextHeading.house}`);
          
          currentChunk = {
            id: `chunk_${chunks.length + 1}`,
            planet: nextHeading.planet,
            sign: nextHeading.sign,
            house: nextHeading.house,
            section: "planetary_rules",
            content: line + "\n",
            keywords,
          };
        } else {
          currentChunk = null;
        }
        continue;
      }

      currentChunk.content += line + "\n";

      // Reduced max chunk size from 3000 to 1000 to prevent mixing multiple rules
      if (currentChunk.content.length > 1000) {
        chunks.push({
          id: currentChunk.id,
          section: currentChunk.section,
          label: SECTION_META[currentChunk.section].label,
          content: normalizeText(currentChunk.content),
          keywords: currentChunk.keywords,
        });
        currentChunk = null;
      }
    } else {
      // Skip blank lines when starting new chunk
      if (!line) continue;
      
      const section = detectSection(line);
      currentChunk = {
        id: `chunk_${chunks.length + 1}`,
        planet: null,
        sign: null,
        house: null,
      section,
        content: line + "\n",
        keywords: SECTION_META[section].keywords,
      };
    }
  }

  if (currentChunk && currentChunk.content.trim().length > 20) {
    chunks.push({
      id: currentChunk.id,
      section: currentChunk.section,
      label: SECTION_META[currentChunk.section].label,
      content: normalizeText(currentChunk.content),
      keywords: currentChunk.keywords,
    });
  }

  chunks.forEach((chunk) => {
    base[chunk.section].push(chunk);
  });

  console.log("[pdf-loader] Total chunks created:", chunks.length);
  console.log("[pdf-loader] Chunks by section:", Object.entries(base).map(([k, v]) => `${k}: ${v.length}`).join(", "));

  chunks.slice(0, 10).forEach((chunk, i) => {
    console.log(`[pdf-loader] Chunk ${i}`, {
      section: chunk.section,
      keywords: chunk.keywords.slice(0, 5),
      preview: chunk.content.slice(0, 200),
    });
  });

  return base;
};

function detectSection(paragraph: string): SectionKey {
  const normalized = paragraph.toLowerCase();

  for (const [sectionKey, meta] of Object.entries(SECTION_META)) {
    if (
      meta.anchors.some((anchor) => normalized.includes(anchor.toLowerCase())) ||
      meta.keywords.some((keyword) => normalized.includes(keyword.toLowerCase()))
    ) {
      return sectionKey as SectionKey;
    }
  }

  return "planetary_rules";
}

let knowledgeBasePromise: Promise<KnowledgeBase> | null = null;

export const loadBNNPdf = async (): Promise<string> => {
  const pdfPath = findPdfPath();
  try {
    const buffer = fs.readFileSync(pdfPath);
    // Import directly from lib to bypass debug code in index.js
    const pdfParse = require("pdf-parse/lib/pdf-parse.js");
    const result = await pdfParse(buffer);
    console.log("[pdf-loader] PDF loaded", {
      pdfPath,
      pages: result.numpages,
      textLength: result.text?.length ?? 0,
    });
    console.log(
      "[pdf-loader] PDF preview (first 2000 chars):",
      result.text?.slice(0, 2000) ?? "",
    );
    return result.text ?? "";
  } catch (error) {
    console.error("[pdf-loader] Error reading PDF:", error);
    return "";
  }
};

const loadKnowledgeBase = async (): Promise<KnowledgeBase> => {
  const text = await loadBNNPdf();
  if (!text) return createEmptyKnowledgeBase();
  return chunkPdfText(text);
};

export const getKnowledgeBase = async () => {
  if (!knowledgeBasePromise) {
    knowledgeBasePromise = loadKnowledgeBase();
  }
  return knowledgeBasePromise;
};

export const runRuleSearch = async (
  request: RuleEngineRequest,
): Promise<RuleEngineResult> => {
  const knowledgeBase = await getKnowledgeBase();
  const snippets: KnowledgeChunk[] = [];

  const normalizeNeedle = (value: string) =>
    value
      ?.toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const expandNeedles = (rawValues: string[]) => {
    const normalized = rawValues
      .map((value) => normalizeNeedle(value ?? ""))
      .filter(Boolean) as string[];

    const expanded = new Set<string>();
    normalized.forEach((needle) => {
      expanded.add(needle);
      needle.split(" ").forEach((token) => expanded.add(token));
    });

    return Array.from(expanded).filter(Boolean);
  };

  const SECTION_KEYS = Object.keys(SECTION_META) as SectionKey[];

  const resolveSectionsToSearch = (category?: string): SectionKey[] => {
    if (!category) return SECTION_KEYS;

    if (SECTION_KEYS.includes(category as SectionKey)) {
      return [category as SectionKey];
    }

    const normalizedCategory = normalizeNeedle(category);
    if (!normalizedCategory) return SECTION_KEYS;

    const matches = SECTION_KEYS.filter((sectionKey) => {
      const meta = SECTION_META[sectionKey];
      const labelMatch = meta.label.toLowerCase().includes(normalizedCategory);
      const anchorMatch = meta.anchors.some((anchor) => {
        const normalizedAnchor = normalizeNeedle(anchor);
        return (
          normalizedAnchor.includes(normalizedCategory) ||
          normalizedCategory.includes(normalizedAnchor)
        );
      });
      const keywordMatch = meta.keywords.some((keyword) => {
        const normalizedKeyword = normalizeNeedle(keyword);
        return (
          normalizedKeyword.includes(normalizedCategory) ||
          normalizedCategory.includes(normalizedKeyword)
        );
      });
      return labelMatch || anchorMatch || keywordMatch;
    });

    return matches.length ? matches : SECTION_KEYS;
  };

  const rawNeedles = [
    ...(request.keywords ?? []),
    request.category ?? "",
    request.ruleRef ?? "",
  ];
  const needles = expandNeedles(rawNeedles);
  const sectionsToSearch = resolveSectionsToSearch(request.category);

  sectionsToSearch.forEach((section) => {
    knowledgeBase[section].forEach((chunk) => {
      const haystack = normalizeNeedle(`${chunk.label} ${chunk.content}`);
      const keywordMatch = chunk.keywords.some((keyword) =>
        needles.includes(normalizeNeedle(keyword)),
      );
      if (
        needles.length === 0 ||
        needles.some((needle) => haystack?.includes(needle)) ||
        keywordMatch
      ) {
        snippets.push(chunk);
      }
    });
  });

  const combinedText = normalizeText(
    snippets
      .map((snippet) => `${snippet.label}: ${snippet.content}`)
      .join("\n"),
  ).slice(0, 4000);

  return { snippets, combinedText };
};
