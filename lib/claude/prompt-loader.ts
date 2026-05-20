/**
 * lib/claude/prompt-loader.ts (V1.1)
 *
 * Leitura dinâmica do `prompts/manifest.json` para determinar os ficheiros
 * a carregar por `tier`. Resolve mismatch de nomes e evita hardcoding
 * de ficheiros que mudam de nome entre versões.
 */

import fs from "fs";
import path from "path";

export type TierType = "free" | "paid";

export interface SystemPromptWithCache {
  coreBlock: {
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
    moduleCount: number;
    coreTokensEstimated: number;
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

function loadManifest(): any[] {
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

function getModulesForTier(tier: TierType): string[] {
  const sections = loadManifest();

  // Always include preâmbulo
  const modules: string[] = [];
  const preambulo = sections.find((s: any) => s.filename === "00_preambulo.md");
  if (preambulo) modules.push(preambulo.filename);

  // Include Core blocks 1..5 (indexes 2..6 in manifest)
  for (const s of sections) {
    if (s.kind === "CORE" && typeof s.index === "number" && s.index >= 2 && s.index <= 6) {
      modules.push(s.filename);
    }
  }

  // Free-tier additional modules (M-DICAS, M-MADEIRA)
  for (const id of ["M-DICAS", "M-MADEIRA"]) {
    const sec = sections.find((s: any) => s.module_id === id || (s.filename && s.filename.toLowerCase().includes(id.toLowerCase().replace("m-","m-"))));
    if (sec) modules.push(sec.filename);
  }

  // Paid-tier modules: vaccination (M-VACINAÇÃO), rastreios, pediatria, cuidador
  if (tier === "paid") {
    const paidIds = ["M-VACINAÇÃO", "M-RAM-RASTREIOS", "M-RASTREIOS", "M-PEDIATRIA", "M-CUIDADOR"];
    for (const id of paidIds) {
      for (const s of sections) {
        if (s.module_id === id || (s.filename && s.filename.toLowerCase().includes(id.toLowerCase().replace("m-","m-")))) {
          if (!modules.includes(s.filename)) modules.push(s.filename);
        }
      }
    }
    // Some vaccines content comes in two files (12 and 13) — include both if present
    const vacs = sections.filter((s: any) => s.module_id === "M-VACINAÇÃO");
    for (const v of vacs) if (!modules.includes(v.filename)) modules.push(v.filename);
  }

  return modules;
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function buildCoreBlock(modules: string[]): string {
  let coreText = "# Dr. Família IA — Sistema Core\n\n";
  for (const module of modules) {
    const content = readPromptFile(module);
    coreText += `\n## Módulo: ${module}\n\n${content}\n`;
  }
  return coreText;
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

export function loadSystemPromptWithCache(
  tier: TierType = "free",
  userName?: string,
  userRegistryText?: string
): SystemPromptWithCache {
  const modules = getModulesForTier(tier);
  const coreText = buildCoreBlock(modules);
  const contextBase = buildUserContextBlock(tier, userName);
  const userContextText = userRegistryText
    ? `${contextBase}\n\n${userRegistryText}`
    : contextBase;

  return {
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
      moduleCount: modules.length,
      coreTokensEstimated: estimateTokens(coreText),
      userContextTokensEstimated: estimateTokens(userContextText),
      cacheControl: true,
    },
  };
}

export function validatePromptFiles(tier: TierType): {
  valid: boolean;
  missing: string[];
} {
  const modules = getModulesForTier(tier);
  const missing: string[] = [];
  for (const module of modules) {
    const filepath = path.join(process.cwd(), "prompts", module);
    if (!fs.existsSync(filepath)) {
      missing.push(module);
    }
  }
  return { valid: missing.length === 0, missing };
}
