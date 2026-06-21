/**
 * lib/claude/keyword-matcher.ts
 *
 * Hybrid tier + keyword module loading: the tier defines the *eligible*
 * universe of modules; this matcher decides which of those eligible modules
 * actually enter the context, based on the user's message.
 *
 * Matching rules (see PARTE 1–3 of the spec):
 *  - Accent-insensitive, lowercase, word-boundary matching (no raw substring).
 *  - Multi-word keywords match as a (separator-tolerant) sequence.
 *  - A SYNONYMS map expands colloquial PT-PT terms onto the right module.
 *  - An AMBIGUOUS map demotes short/ambiguous keywords to "weak" matches that
 *    only count with regional confirmation OR another strong clinical match in
 *    the same message (false-positive guard).
 *
 * Pure module: no I/O, no SDK. The Haiku fallback (PARTE 4) is injected from
 * client.ts so this file stays dependency-free.
 */

export interface EligibleSection {
  filename: string;
  module_id: string;
  keywords: string[];
}

export type Region = "RAM" | "RAA";

export interface MatchOptions {
  /** Confirmed region of the user, if known. Optional gancho for Phase 2. */
  region?: Region;
}

/**
 * Lowercase + strip diacritics via NFD. Applied to BOTH the user message and
 * every keyword before comparison, so "vacinação" matches "vacinacao".
 */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/**
 * Colloquial / synonym expansion, keyed by module_id. These live in code (not
 * in the .md or manifest) and are appended to the manifest keywords for the
 * matching module. Easy to extend: just add entries.
 */
export const SYNONYMS: Record<string, string[]> = {
  "M-VACINAÇÃO": ["pica", "picas", "pico"],
  "M-CLINICA": [
    // mental health
    "pânico",
    "ataque de pânico",
    "ando em baixo",
    "em baixo",
    "sem vontade de nada",
    "sem vontade",
    "nervos",
    "aflição",
    // diabetes
    "açúcar descontrolado",
    "açúcar alto",
    "diabético",
  ],
  "M-CUIDADOR": [
    "já não me conhece",
    "não reconhece",
    "tomar conta de",
    "trato do meu",
    "trato da minha",
  ],
};

/**
 * Ambiguous keywords, keyed by module_id. A match on one of these counts as a
 * "weak" match only: it is NOT enough to load the module on its own. The module
 * loads via a weak match only when (a) the user's region is confirmed for that
 * module, OR (b) some other module produced a strong clinical match in the same
 * message. Prevents e.g. "o meu tio está com tosse" from loading the whole
 * Azorean glossary.
 */
export const AMBIGUOUS: Record<string, string[]> = {
  "M-AÇORES": ["ramo", "tio", "tia", "sentido", "calhau", "andaço"],
  "M-MADEIRA": ["brisa", "horário", "pastilha"],
};

/** Regional glossary modules — their strong matches are regional, not clinical. */
const REGIONAL_MODULES = new Set(["M-AÇORES", "M-MADEIRA"]);

/** Greeting / courtesy patterns used to skip the Haiku fallback (PARTE 4). */
const GREETING_PATTERNS: RegExp[] = [
  /\b(bom dia|boa tarde|boa noite|boas|ola|olá)\b/i,
  /\b(obrigad[oa]|obrigada|agradecido|agradecida|bem haja)\b/i,
  /\b(adeus|ate logo|até logo|ate breve|cumprimentos|com os melhores)\b/i,
];

/**
 * Builds a word-boundary, accent-insensitive, separator-tolerant regex for a
 * keyword. Multi-word keywords match as a sequence ("boletim de vacinas").
 * After normalize() the haystack only contains [a-z0-9], so [^a-z0-9] is a
 * safe word boundary that "tio" won't match inside "antonio".
 */
function buildKeywordRegex(keyword: string): RegExp | null {
  const norm = normalize(keyword).trim();
  if (!norm) return null;
  const escaped = norm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Tolerate any non-alphanumeric run between words of a multi-word keyword.
  const pattern = escaped.replace(/\s+/g, "[^a-z0-9]+");
  return new RegExp(`(?:^|[^a-z0-9])${pattern}(?:[^a-z0-9]|$)`);
}

interface ModuleSignal {
  strong: number;
  weak: number;
}

/**
 * Returns true if the message looks clinical enough to justify the Haiku
 * fallback. A pure greeting/courtesy message (e.g. "boa tarde") returns false,
 * so the fallback never fires on a non-clinical "miss".
 */
export function looksClinical(userMessage: string): boolean {
  const norm = normalize(userMessage).trim();
  if (!norm) return false;
  // Must contain some letters at all.
  if (!/[a-z]/.test(norm)) return false;

  const words = norm.split(/[^a-z0-9]+/).filter(Boolean);
  const isGreeting = GREETING_PATTERNS.some((re) => re.test(userMessage));
  // Short, greeting-only messages are treated as non-clinical.
  if (isGreeting && words.length <= 4) return false;
  return true;
}

/**
 * Matches eligible modules against the user message and returns the matched
 * module_ids. Keywords are aggregated per module (manifest keywords + synonyms)
 * so a multi-file module (e.g. M-VACINAÇÃO) is decided once.
 */
export function matchModules(
  userMessage: string,
  eligibleSections: EligibleSection[],
  options: MatchOptions = {}
): string[] {
  const haystack = normalize(userMessage);
  if (!haystack.trim()) return [];

  // Aggregate keywords per module_id, tracking which are ambiguous.
  const moduleKeywords = new Map<string, Set<string>>();
  for (const section of eligibleSections) {
    if (!section.module_id) continue;
    const set = moduleKeywords.get(section.module_id) ?? new Set<string>();
    for (const kw of section.keywords ?? []) set.add(kw);
    moduleKeywords.set(section.module_id, set);
  }
  // Append synonyms.
  for (const [moduleId, extra] of Object.entries(SYNONYMS)) {
    if (!moduleKeywords.has(moduleId)) continue;
    const set = moduleKeywords.get(moduleId)!;
    for (const kw of extra) set.add(kw);
  }

  // Compute strong/weak signal per module.
  const signals = new Map<string, ModuleSignal>();
  for (const [moduleId, keywords] of moduleKeywords) {
    const ambiguous = new Set((AMBIGUOUS[moduleId] ?? []).map(normalize));
    const signal: ModuleSignal = { strong: 0, weak: 0 };
    for (const kw of keywords) {
      const re = buildKeywordRegex(kw);
      if (!re || !re.test(haystack)) continue;
      if (ambiguous.has(normalize(kw))) signal.weak++;
      else signal.strong++;
    }
    signals.set(moduleId, signal);
  }

  // A strong match on a non-regional module is a "clinical" signal that can
  // rescue ambiguous regional weak matches.
  let clinicalStrongPresent = false;
  for (const [moduleId, signal] of signals) {
    if (!REGIONAL_MODULES.has(moduleId) && signal.strong > 0) {
      clinicalStrongPresent = true;
      break;
    }
  }

  const matched: string[] = [];
  for (const [moduleId, signal] of signals) {
    if (signal.strong > 0) {
      matched.push(moduleId);
      continue;
    }
    if (signal.weak > 0) {
      const regionConfirmed =
        (options.region === "RAA" && moduleId === "M-AÇORES") ||
        (options.region === "RAM" && moduleId === "M-MADEIRA");
      if (regionConfirmed || clinicalStrongPresent) {
        matched.push(moduleId);
      }
    }
  }

  return matched;
}
