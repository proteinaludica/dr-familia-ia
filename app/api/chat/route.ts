/**
 * app/api/chat/route.ts
 * POST /api/chat — devolve resposta do Claude em streaming SSE
 */

import { NextRequest, NextResponse } from "next/server";
import { callClaudeWithCacheStreaming } from "@/lib/claude/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userMessage, tier = "free", userName, userRegistryText } = body;

    if (!userMessage || typeof userMessage !== "string") {
      return NextResponse.json(
        { error: "userMessage é obrigatório" },
        { status: 400 }
      );
    }

    if (!["free", "paid"].includes(tier)) {
      return NextResponse.json(
        { error: "tier deve ser 'free' ou 'paid'" },
        { status: 400 }
      );
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of callClaudeWithCacheStreaming(
            userMessage,
            tier as "free" | "paid",
            userName,
            userRegistryText
          )) {
            if (chunk.type === "text_delta") {
              const data = `data: ${JSON.stringify({
                type: "text_delta",
                text: chunk.text,
              })}\n\n`;
              controller.enqueue(encoder.encode(data));
            } else if (chunk.type === "cache_metrics") {
              const data = `data: ${JSON.stringify({
                type: "cache_metrics",
                cacheMetrics: chunk.cacheMetrics,
              })}\n\n`;
              controller.enqueue(encoder.encode(data));
            } else if (chunk.type === "chips") {
              const data = `data: ${JSON.stringify({
                type: "chips",
                chips: chunk.chips,
              })}\n\n`;
              controller.enqueue(encoder.encode(data));
            } else if (chunk.type === "error") {
              const data = `data: ${JSON.stringify({
                type: "error",
                error: chunk.error,
              })}\n\n`;
              controller.enqueue(encoder.encode(data));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("[/api/chat] Erro:", error);
    return NextResponse.json(
      {
        error: "Erro interno",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
