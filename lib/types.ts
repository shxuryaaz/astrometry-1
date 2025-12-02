export type SectionKey =
  | "planetary_rules"
  | "combinations"
  | "topics"
  | "two_planet_combinations"
  | "transit_rules"
  | "profession_rules"
  | "relationship_rules";

export type KnowledgeChunk = {
  id: string;
  section: SectionKey;
  label: string;
  content: string;
  pageStart?: number;
  pageEnd?: number;
  primaryPlanet?: string | null;
  secondaryPlanet?: string | null;
  sign?: string | null;
  house?: string | null;
  keywords: string[];
};

export type KnowledgeBase = Record<SectionKey, KnowledgeChunk[]>;

export type RuleMapping = {
  id: string;
  category: string;
  question: string;
  rule_ref: string;
  pdf_page?: string;
  keywords: string[];
  planets?: string[];
  houses?: string[];
  transits?: string[];
  primary_pages?: string;
  secondary_pages?: string;
};

export type KundliPlanet = {
  planet: string;
  sign: string;
  house: number;
  degree?: number;
};

export type KundliProfile = {
  name: string;
  gender: string;
  dob: string;
  tob: string;
  pob: string;
  raw: Record<string, unknown>;
  planets: KundliPlanet[];
};

export type RuleEngineRequest = {
  category?: string;
  ruleRef?: string;
  keywords?: string[];
  planets?: string[];
  signs?: string[];
  houses?: (string | number)[];
  limit?: number;
  rule?: RuleMapping | null;
};

export type RuleEngineResult = {
  snippets: KnowledgeChunk[];
  combinedText: string;
};

