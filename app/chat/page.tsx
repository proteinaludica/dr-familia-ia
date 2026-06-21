"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface CacheMetrics {
  inputTokens: number;
  cacheCreationTokens: number;
  cacheReadTokens: number;
  outputTokens: number;
}

// Brand teal used for active/follow-up chips.
const BRAND_TEAL = "#2C7A7B";

// Static starter chips shown before any message exists. Provisional copy —
// edit these strings here. Keyed by tier.
const STARTER_CHIPS: Record<"free" | "paid", string[]> = {
  free: [
    "Quero ver as minhas análises",
    "Que rastreios devo fazer?",
    "Tenho uma dúvida sobre a minha medicação",
  ],
  paid: [
    "Quero ver as minhas análises",
    "Que rastreios devo fazer?",
    "Tenho uma dúvida sobre a minha medicação",
    "Vacinas do meu filho",
    "Preciso de ajuda como cuidador",
  ],
};

// Compact Markdown renderers so paragraphs/lists fit tightly inside a bubble.
const markdownComponents = {
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p style={{ margin: "0 0 0.5rem 0" }} {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul style={{ margin: "0 0 0.5rem 0", paddingLeft: "1.25rem" }} {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol style={{ margin: "0 0 0.5rem 0", paddingLeft: "1.25rem" }} {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li style={{ margin: "0.15rem 0" }} {...props} />
  ),
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tier, setTier] = useState<"free" | "paid">("free");
  const [cacheMetrics, setCacheMetrics] = useState<CacheMetrics | null>(null);
  // Dynamic follow-up chips delivered via the SSE "chips" event.
  const [dynamicChips, setDynamicChips] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Sends a message through the same path the text input uses. Accepts the raw
  // text so both the form and the suggestion chips can call it identically.
  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    // Clear dynamic chips as soon as the user sends; they only reappear when
    // the next "chips" event arrives.
    setDynamicChips([]);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage: trimmed, tier }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Sem body");

      const decoder = new TextDecoder();
      let assistantContent = "";
      const assistantId = (Date.now() + 1).toString();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;

            try {
              const parsed = JSON.parse(data);
              if (parsed.type === "text_delta") {
                assistantContent += parsed.text;
                setMessages((prev) => {
                  const exists = prev.some((m) => m.id === assistantId);
                  if (exists) {
                    return prev.map((m) =>
                      m.id === assistantId ? { ...m, content: assistantContent } : m
                    );
                  } else {
                    return [
                      ...prev,
                      { id: assistantId, role: "assistant", content: assistantContent },
                    ];
                  }
                });
              } else if (parsed.type === "cache_metrics") {
                setCacheMetrics(parsed.cacheMetrics);
              } else if (parsed.type === "chips") {
                // Follow-up suggestions for the answer just rendered.
                setDynamicChips(Array.isArray(parsed.chips) ? parsed.chips : []);
              }
            } catch (e) {}
          }
        }
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: "error-" + Date.now(),
          role: "assistant",
          content: `Erro: ${error instanceof Error ? error.message : "Erro"}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  // Shared pill-button style for both starter and dynamic chips.
  const chipStyle: React.CSSProperties = {
    padding: "0.5rem 1rem",
    borderRadius: "999px",
    border: `1px solid ${BRAND_TEAL}`,
    backgroundColor: "white",
    color: BRAND_TEAL,
    fontSize: "14px",
    cursor: loading ? "not-allowed" : "pointer",
    opacity: loading ? 0.6 : 1,
    lineHeight: 1.3,
  };

  const starterChips = STARTER_CHIPS[tier];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "#f5f5f5" }}>
      <div style={{ padding: "1rem", backgroundColor: "#007bff", color: "white" }}>
        <h1 style={{ margin: 0, fontSize: "1.5rem" }}>Dr. Família IA</h1>
        <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.9rem" }}>Chat com prompt caching</p>
      </div>

      <div style={{ padding: "1rem", borderBottom: "1px solid #ddd" }}>
        <label style={{ marginRight: "1rem" }}>
          Tier:
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value as "free" | "paid")}
            disabled={loading}
            style={{ marginLeft: "0.5rem" }}
          >
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
        </label>
        {cacheMetrics && (
          <div style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "#666" }}>
            Input: {cacheMetrics.inputTokens} | Cache Write: {cacheMetrics.cacheCreationTokens} | Cache Read: {cacheMetrics.cacheReadTokens} | Output: {cacheMetrics.outputTokens}
          </div>
        )}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", color: "#999", marginTop: "2rem" }}>
            <p>Escreve uma mensagem para começar</p>
            {/* Static starter chips, shown only before the first message. */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem",
                justifyContent: "center",
                marginTop: "1.5rem",
              }}
            >
              {starterChips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  disabled={loading}
                  onClick={() => sendMessage(chip)}
                  style={chipStyle}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "70%",
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              backgroundColor: msg.role === "user" ? "#007bff" : "#e9ecef",
              color: msg.role === "user" ? "white" : "black",
              wordWrap: "break-word",
            }}>
              {/* Assistant answers arrive as Markdown; user input stays literal. */}
              {msg.role === "assistant" ? (
                <ReactMarkdown components={markdownComponents}>{msg.content}</ReactMarkdown>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        {/* Dynamic follow-up chips, rendered under the last assistant reply. */}
        {!loading && dynamicChips.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "flex-start" }}>
            {dynamicChips.map((chip) => (
              <button
                key={chip}
                type="button"
                disabled={loading}
                onClick={() => sendMessage(chip)}
                style={chipStyle}
              >
                {chip}
              </button>
            ))}
          </div>
        )}
        {loading && <div>...</div>}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} style={{ padding: "1rem", borderTop: "1px solid #ddd", display: "flex", gap: "0.5rem" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          placeholder="Escreve a tua pergunta..."
          style={{ flex: 1, padding: "0.75rem", borderRadius: "4px", border: "1px solid #ddd", fontSize: "1rem" }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: loading ? "#999" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "..." : "Enviar"}
        </button>
      </form>
    </div>
  );
}
