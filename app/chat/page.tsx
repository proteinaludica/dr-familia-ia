"use client";

import { useState, useRef, useEffect } from "react";

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

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tier, setTier] = useState<"free" | "paid">("free");
  const [cacheMetrics, setCacheMetrics] = useState<CacheMetrics | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage: input, tier }),
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
              {msg.content}
            </div>
          </div>
        ))}
        {loading && <div>...</div>}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} style={{ padding: "1rem", borderTop: "1px solid #ddd", display: "flex", gap: "0.5rem" }}>
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