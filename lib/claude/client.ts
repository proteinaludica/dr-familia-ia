/**
 * lib/claude/client.ts
 * Wrapper do Anthropic SDK com prompt caching e streaming.
 */

import Anthropic from "@anthropic-ai/sdk";
import { loadSystemPromptWithCache, TierType } from "./prompt-loader";

let anthropicClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY não está definida");
    }
    anthropicClient = new Anthropic({ apiKey });
  }
  return anthropicClient;
}

export async function* callClaudeWithCacheStreaming(
  userMessage: string,
  tier: TierType = "free",
  userName?: string,
  userRegistryText?: string
) {
  const client = getAnthropicClient();
  const systemPrompt = loadSystemPromptWithCache(tier, userName, userRegistryText);

  const systemMessages = [
    systemPrompt.coreBlock,
    systemPrompt.userContextBlock,
  ];

  try {
    const stream = await client.messages.stream({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      system: systemMessages as unknown as Parameters<typeof client.messages.stream>[0]["system"],
      messages: [{ role: "user", content: userMessage }],
    });

    // Accumulate the full assistant text so we can derive follow-up chips later.
    let assistantText = "";

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        assistantText += event.delta.text;
        yield { type: "text_delta", text: event.delta.text };
      }
    }

    const usage = (await stream.finalMessage())?.usage;
    yield {
      type: "cache_metrics",
      cacheMetrics: {
        inputTokens: usage?.input_tokens || 0,
        cacheCreationTokens: (usage as any)?.cache_creation_input_tokens || 0,
        cacheReadTokens: (usage as any)?.cache_read_input_tokens || 0,
        outputTokens: usage?.output_tokens || 0,
      },
    };

    // Dynamic follow-up chips: a short, cheap second call based on the answer.
    const chips = await generateFollowUpChips(client, assistantText);
    yield { type: "chips", chips };
  } catch (error) {
    console.error("[Claude] Erro:", error);
    yield { type: "error", error: String(error) };
  }
}

/**
 * Generates up to 4 short follow-up question suggestions ("chips") based on the
 * assistant's last answer. Uses a cheap, non-streaming Haiku call. Parsing is
 * defensive: any failure returns an empty array so the main response is safe.
 */
async function generateFollowUpChips(
  client: Anthropic,
  assistantText: string
): Promise<string[]> {
  // Nothing to suggest from an empty answer.
  if (!assistantText.trim()) return [];

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 256,
      messages: [
        {
          role: "user",
          content:
            "A partir desta resposta do assistente de saúde, sugere no máximo 4 " +
            "perguntas curtas de seguimento que o utente poderia querer fazer a " +
            "seguir. Escreve em PT-PT pré-acordo ortográfico (ex.: \"acção\", " +
            "\"vacinação\"), na perspectiva do utente a falar com o assistente. " +
            "Devolve APENAS um array JSON de strings, sem texto à volta, sem " +
            "markdown.\n\n---\n" +
            assistantText,
        },
      ],
    });

    // Concatenate all text blocks from the response.
    const raw = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("")
      .trim();

    // Strip a possible ```json ... ``` fence before parsing.
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) return [];

    // Keep only non-empty strings, capped at 4.
    return parsed
      .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      .slice(0, 4);
  } catch (error) {
    console.error("[Claude] Falha ao gerar chips:", error);
    return [];
  }
}
