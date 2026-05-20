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
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemMessages as unknown as Parameters<typeof client.messages.stream>[0]["system"],
      messages: [{ role: "user", content: userMessage }],
    });

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
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
  } catch (error) {
    console.error("[Claude] Erro:", error);
    yield { type: "error", error: String(error) };
  }
}
