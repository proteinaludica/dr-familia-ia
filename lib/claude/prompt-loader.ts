/**
 * lib/claude/prompt-loader.ts (V2 — hybrid tier + keyword)
 *
 * Reads `prompts/manifest.json` to determine which files to load. The tier
 * defines the *eligible* universe of modules; the user message decides which
 * eligible keyword-modules actually enter the context (see keyword-matcher.ts).
 *
 * Cache layout (PARTE 5): three system blocks, in order
 *   1. coreBlock        — fixed core, identical every message, cache_control.
 *   2. modulesBlock     — conditional keyword modules, varies, own cache_control.
 *   3. userContextBlock — user context, no cache_control.
 * The fixed core comes first so its cached prefix stays stable regardless of
 * which conditional modules vary.
 */

import fs from "fs";
import path from "path";
import {
  EligibleSection,
  matchModules,
  looksClinical,
  Region,
} from "./keyword-matcher";

export type TierType = "free" | "paid";

/**
 * Injected from client.ts (which owns the Anthropic SDK). Given the message and
 * the candidate modules, returns the module_ids that best fit. Keeps the SDK out
 * of this file. Only invoked on a clinical "miss".
 */
export type FallbackResolver = (params: {
  userMessage: string;
  candidates: { module_id: string; name: string }[];
}) => Promise<string[]>;

export interface LoadOptions {
  userName?: string;
  userRegistryText?: string;
  region?: Region;
  fallbackResolver?: FallbackResolver;
}

export interface SystemPromptWithCache {
  coreBlock: {
    type: "text";
    text: string;
    cache_control?: { type: "ephemeral" };
  };
  /** Present only when at least one conditional module was selected. */
  modulesBlock?: {
    type: "text";
    text: string;
    cache_control?: { type: "ephemeral" };
  };
  userContextBlock: {
    type: "text";
    text: string;
  };
  metadata: {
    tier: TierType;
    fixedModuleCount: number;
    conditionalModuleIds: string[];
    fallbackUsed: boolean;
    coreTokensEstimated: number;
    modulesTokensEstimated: number;
    userContextTokensEstimated: number;
    cacheControl: boolean;
  };
}

function readPromptFile(filename: string): string {
  const filepath = path.join(process.cwd(), "prompts", filename);
  try {
    return fs.readFileSync(filepath, "utf-8");
  } catch (err) {
    console.warn(`[prompt-loader] Ficheiro não encontrado: ${filename}`);
    return `<!-- Ficheiro não encontrado: ${filename} -->`;
  }
}

interface ManifestSection {
  index?: number;
  filename: string;
  kind?: string;
  module_id?: string | null;
  name?: string;
  keywords?: string[];
}

function loadManifest(): ManifestSection[] {
  const manifestPath = path.join(process.cwd(), "prompts", "manifest.json");
  try {
    const raw = fs.readFileSync(manifestPath, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.sections) ? parsed.sections : [];
  } catch (err) {
    console.warn("[prompt-loader] Não foi possível ler prompts/manifest.json", err);
    return [];
  }
}

/**
 * Conditional (keyword-driven) modules per tier. The tier sets the universe;
 * the matcher picks from it. M-CLINICA and M-MADEIRA are eligible in both tiers;
 * the remaining paid modules add to the universe for paid users.
 */
const CONDITIONAL_MODULES_FREE = ["M-CLINICA", "M-MADEIRA"];
const CONDITIONAL_MODULES_PAID_EXTRA = [
  "M-AÇORES",
  "M-VACINAÇÃO",
  "M-RAM-RASTREIOS",
  "M-PEDIATRIA",
  "M-CUIDADOR",
];

export interface EligibleModules {
  /** Filenames always loaded into the fixed core block. */
  fixed: string[];
  /** Keyword-matchable sections (may include several files per module_id). */
  conditional: EligibleSection[];
}

/**
 * Returns the eligible universe for a tier: the always-loaded fixed core, and
 * the keyword-matchable conditional sections. Fixed set is unchanged from V1
 * (preâmbulo + CORE 2..6 + M-DICAS), preserving the stable cached prefix.
 */
export function getEligibleModulesForTier(tier: TierType): EligibleModules {
  const sections = loadManifest();

  // --- Fixed core (always loaded) ---
  const fixed: string[] = [];
  const preambulo = sections.find((s) => s.filename === "00_preambulo.md");
  if (preambulo) fixed.push(preambulo.filename);

  for (const s of sections) {
    if (s.kind === "CORE" && typeof s.index === "number" && s.index >= 2 && s.index <= 6) {
      fixed.push(s.filename);
    }
  }

  // M-DICAS stays always-loaded (no keywords; age/end-of-conversation activation).
  for (const s of sections) {
    if (s.module_id === "M-DICAS" && !fixed.includes(s.filename)) {
      fixed.push(s.filename);
    }
  }

  // --- Conditional eligible modules ---
  const eligibleIds = new Set(CONDITIONAL_MODULES_FREE);
  if (tier === "paid") {
    for (const id of CONDITIONAL_MODULES_PAID_EXTRA) eligibleIds.add(id);
  }

  const conditional: EligibleSection[] = [];
  for (const s of sections) {
    if (s.module_id && eligibleIds.has(s.module_id) && !fixed.includes(s.filename)) {
      conditional.push({
        filename: s.filename,
        module_id: s.module_id,
        keywords: s.keywords ?? [],
      });
    }
  }

  return { fixed, conditional };
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function buildBlockText(title: string, modules: string[]): string {
  let text = `# ${title}\n\n`;
  for (const module of modules) {
    const content = readPromptFile(module);
    text += `\n## Módulo: ${module}\n\n${content}\n`;
  }
  return text;
}

function buildUserContextBlock(tier: TierType, userName?: string): string {
  let contextText = `# Contexto do Utilizador\n\n`;
  contextText += `Tier: ${tier}\n`;
  if (userName) {
    contextText += `Nome: ${userName}\n`;
  }
  contextText += `\nRegisto longitudinal: [preenchido dinamicamente]\n`;
  return contextText;
}

export async function loadSystemPromptWithCache(
  tier: TierType = "free",
  userMessage: string = "",
  opts: LoadOptions = {}
): Promise<SystemPromptWithCache> {
  const { userName, userRegistryText, region, fallbackResolver } = opts;
  const { fixed, conditional } = getEligibleModulesForTier(tier);

  // 1) Deterministic keyword matching.
  let matchedIds = matchModules(userMessage, conditional, { region });
  let fallbackUsed = false;

  // 2) Haiku fallback: only on a clinical "miss".
  if (
    matchedIds.length === 0 &&
    fallbackResolver &&
    looksClinical(userMessage)
  ) {
    const seen = new Set<string>();
    const candidates: { module_id: string; name: string }[] = [];
    for (const s of conditional) {
      if (s.module_id && !seen.has(s.module_id)) {
        seen.add(s.module_id);
        candidates.push({ module_id: s.module_id, name: s.module_id });
      }
    }
    try {
      const suggested = await fallbackResolver({ userMessage, candidates });
      const valid = new Set(candidates.map((c) => c.module_id));
      matchedIds = (suggested ?? []).filter((id) => valid.has(id));
      fallbackUsed = matchedIds.length > 0;
    } catch (err) {
      // Defensive: a failed fallback must never break the response.
      console.warn("[prompt-loader] Fallback Haiku falhou; sem módulos extra.", err);
    }
  }

  // Expand matched module_ids to filenames (preserves manifest order, includes
  // co-loaded files like M-VACINAÇÃO's two anexos).
  const matchedSet = new Set(matchedIds);
  const conditionalFiles: string[] = [];
  for (const s of conditional) {
    if (s.module_id && matchedSet.has(s.module_id)) conditionalFiles.push(s.filename);
  }

  // No-PII log for metrics validation.
  console.log(
    `[prompt-loader] tier=${tier} fixed=${fixed.length} ` +
      `modules=[${matchedIds.join(",")}] fallback=${fallbackUsed}`
  );

  // --- Build blocks ---
  const coreText = buildBlockText("Dr. Família IA — Sistema Core", fixed);
  const contextBase = buildUserContextBlock(tier, userName);
  const userContextText = userRegistryText
    ? `${contextBase}\n\n${userRegistryText}`
    : contextBase;

  const result: SystemPromptWithCache = {
    coreBlock: {
      type: "text",
      text: coreText,
      cache_control: { type: "ephemeral" },
    },
    userContextBlock: {
      type: "text",
      text: userContextText,
    },
    metadata: {
      tier,
      fixedModuleCount: fixed.length,
      conditionalModuleIds: matchedIds,
      fallbackUsed,
      coreTokensEstimated: estimateTokens(coreText),
      modulesTokensEstimated: 0,
      userContextTokensEstimated: estimateTokens(userContextText),
      cacheControl: true,
    },
  };

  // Only emit the modules block when something matched (avoids an empty
  // cache breakpoint and keeps the core prefix clean).
  if (conditionalFiles.length > 0) {
    const modulesText = buildBlockText("Módulos Condicionais", conditionalFiles);
    result.modulesBlock = {
      type: "text",
      text: modulesText,
      cache_control: { type: "ephemeral" },
    };
    result.metadata.modulesTokensEstimated = estimateTokens(modulesText);
  }

  return result;
}

export function validatePromptFiles(tier: TierType): {
  valid: boolean;
  missing: string[];
} {
  const { fixed, conditional } = getEligibleModulesForTier(tier);
  const all = [...fixed, ...conditional.map((s) => s.filename)];
  const missing: string[] = [];
  for (const module of all) {
    const filepath = path.join(process.cwd(), "prompts", module);
    if (!fs.existsSync(filepath)) {
      missing.push(module);
    }
  }
  return { valid: missing.length === 0, missing };
}
