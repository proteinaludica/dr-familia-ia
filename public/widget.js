(function () {
  "use strict";

  const BRAND = "#2C7A7B";
  const BRAND_DARK = "#234E52";
  const API_ENDPOINT = "/api/chat";
  const STORAGE_KEY = "drfamilia_chat_history_v1";

  // Static starter chips shown before any message. Mirrors the "free" tier of
  // STARTER_CHIPS in app/chat/page.tsx (the widget cannot import from the app).
  const STARTER_CHIPS = [
    "Quero ver as minhas análises",
    "Que rastreios devo fazer?",
    "Tenho uma dúvida sobre a minha medicação",
  ];

  const style = document.createElement("style");
  style.textContent = `
    #drf-btn {
      position: fixed; bottom: 24px; right: 24px;
      background: ${BRAND}; color: #fff;
      border: none; border-radius: 999px;
      padding: 14px 22px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
      font-size: 15px; font-weight: 600;
      cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,.18);
      z-index: 99998; display: flex; align-items: center; gap: 8px;
      transition: transform .15s ease, box-shadow .15s ease;
    }
    #drf-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,.22); }
    #drf-btn.drf-hidden { display: none; }
    #drf-panel {
      position: fixed; bottom: 24px; right: 24px;
      width: 400px; height: 600px; max-height: calc(100vh - 48px);
      background: #fff; border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,.25);
      z-index: 99999; display: none; flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
      overflow: hidden;
    }
    #drf-panel.drf-open { display: flex; }
    #drf-header {
      background: ${BRAND}; color: #fff;
      padding: 16px 18px; display: flex; align-items: center; justify-content: space-between;
    }
    #drf-header h3 { margin: 0; font-size: 16px; font-weight: 600; }
    #drf-header small { display: block; font-size: 12px; opacity: .85; margin-top: 2px; }
    #drf-close {
      background: transparent; border: none; color: #fff;
      font-size: 24px; cursor: pointer; padding: 0; line-height: 1;
      width: 28px; height: 28px;
    }
    #drf-close:hover { opacity: .8; }
    #drf-messages {
      flex: 1; overflow-y: auto; padding: 16px;
      background: #f7fafa; display: flex; flex-direction: column; gap: 12px;
    }
    .drf-msg {
      max-width: 85%; padding: 10px 14px; border-radius: 12px;
      font-size: 15px; line-height: 1.5; word-wrap: break-word; white-space: pre-wrap;
    }
    .drf-msg-user {
      align-self: flex-end; background: ${BRAND}; color: #fff;
      border-bottom-right-radius: 4px;
    }
    .drf-msg-bot {
      align-self: flex-start; background: #fff; color: #1a202c;
      border: 1px solid #e2e8f0; border-bottom-left-radius: 4px;
    }
    .drf-typing { font-style: italic; color: #718096; }
    /* Compact Markdown inside bot bubbles. */
    .drf-msg-bot p { margin: 0 0 8px 0; }
    .drf-msg-bot p:last-child { margin-bottom: 0; }
    .drf-msg-bot ul { margin: 0 0 8px 0; padding-left: 20px; }
    .drf-msg-bot ul:last-child { margin-bottom: 0; }
    .drf-msg-bot li { margin: 2px 0; }
    /* Suggestion chips (starter + dynamic follow-ups). */
    .drf-chips {
      align-self: flex-start; display: flex; flex-wrap: wrap; gap: 8px;
      max-width: 100%;
    }
    .drf-chip {
      background: #fff; color: ${BRAND}; border: 1px solid ${BRAND};
      border-radius: 999px; padding: 8px 14px;
      font-family: inherit; font-size: 14px; line-height: 1.3;
      cursor: pointer; transition: background .15s ease, color .15s ease;
    }
    .drf-chip:hover { background: ${BRAND}; color: #fff; }
    .drf-chip:disabled { opacity: .5; cursor: not-allowed; }
    #drf-input-wrap {
      border-top: 1px solid #e2e8f0; padding: 12px; background: #fff;
      display: flex; gap: 8px;
    }
    #drf-input {
      flex: 1; resize: none; border: 1px solid #cbd5e0; border-radius: 10px;
      padding: 10px 12px; font-family: inherit; font-size: 15px;
      max-height: 100px; min-height: 42px; outline: none;
    }
    #drf-input:focus { border-color: ${BRAND}; }
    #drf-send {
      background: ${BRAND}; color: #fff; border: none; border-radius: 10px;
      padding: 0 18px; font-weight: 600; cursor: pointer; font-size: 15px;
    }
    #drf-send:hover { background: ${BRAND_DARK}; }
    #drf-send:disabled { opacity: .5; cursor: not-allowed; }
    #drf-disclaimer {
      font-size: 11px; color: #718096; text-align: center;
      padding: 6px 12px 10px; background: #fff;
    }
    @media (max-width: 600px) {
      #drf-panel {
        bottom: 0; right: 0; left: 0; top: 0;
        width: 100%; height: 100%; max-height: 100%;
        border-radius: 0;
      }
      #drf-btn { bottom: 16px; right: 16px; padding: 12px 18px; font-size: 14px; }
    }
  `;
  document.head.appendChild(style);

  const btn = document.createElement("button");
  btn.id = "drf-btn";
  btn.innerHTML = '<span>💬</span><span>Falar com Dr. Família</span>';
  btn.setAttribute("aria-label", "Abrir chat com Dr. Família IA");

  const panel = document.createElement("div");
  panel.id = "drf-panel";
  panel.innerHTML = `
    <div id="drf-header">
      <div>
        <h3>Dr. Família IA</h3>
        <small>Saúde longitudinal · PT-PT</small>
      </div>
      <button id="drf-close" aria-label="Fechar chat">×</button>
    </div>
    <div id="drf-messages"></div>
    <div id="drf-input-wrap">
      <textarea id="drf-input" placeholder="Escreva a sua mensagem..." rows="1"></textarea>
      <button id="drf-send" aria-label="Enviar">Enviar</button>
    </div>
    <div id="drf-disclaimer">Versão de demonstração — não substitui consulta médica.</div>
  `;

  document.body.appendChild(btn);
  document.body.appendChild(panel);

  const messagesEl = document.getElementById("drf-messages");
  const inputEl = document.getElementById("drf-input");
  const sendBtn = document.getElementById("drf-send");
  const closeBtn = document.getElementById("drf-close");

  let history = [];
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) history = JSON.parse(saved);
  } catch (e) {}

  function persist() {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history)); } catch (e) {}
  }

  // Escape user/assistant text before any markup is applied, to avoid XSS.
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // Apply inline markdown (bold, italic) on already-escaped text.
  function inlineMarkdown(str) {
    return str
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>");
  }

  // Tiny, dependency-free Markdown -> HTML converter. Covers only: **bold**,
  // *italic*, "- " bullet lists, and paragraphs / line breaks. HTML is escaped
  // first so the output is safe to inject.
  function markdownToHtml(raw) {
    const lines = escapeHtml(raw).split("\n");
    let html = "";
    let para = [];
    let list = [];

    function flushPara() {
      if (para.length) {
        html += "<p>" + para.map(inlineMarkdown).join("<br>") + "</p>";
        para = [];
      }
    }
    function flushList() {
      if (list.length) {
        html += "<ul>" + list
          .map(function (item) { return "<li>" + inlineMarkdown(item) + "</li>"; })
          .join("") + "</ul>";
        list = [];
      }
    }

    lines.forEach(function (line) {
      const bullet = line.match(/^\s*-\s+(.*)$/);
      if (bullet) {
        flushPara();
        list.push(bullet[1]);
      } else if (line.trim() === "") {
        flushPara();
        flushList();
      } else {
        flushList();
        para.push(line);
      }
    });
    flushPara();
    flushList();
    return html;
  }

  // Single container holding the suggestion chips at the bottom of the thread.
  let chipsEl = null;

  function clearChips() {
    if (chipsEl && chipsEl.parentNode) chipsEl.parentNode.removeChild(chipsEl);
    chipsEl = null;
  }

  // Render up to 4 pill chips under the latest message; clicking one sends it.
  function renderChips(chips) {
    clearChips();
    if (!Array.isArray(chips) || chips.length === 0) return;
    chipsEl = document.createElement("div");
    chipsEl.className = "drf-chips";
    chips.slice(0, 4).forEach(function (chip) {
      if (typeof chip !== "string" || !chip.trim()) return;
      const b = document.createElement("button");
      b.className = "drf-chip";
      b.type = "button";
      b.textContent = chip;
      b.addEventListener("click", function () {
        if (sendBtn.disabled) return;
        sendMessage(chip);
      });
      chipsEl.appendChild(b);
    });
    messagesEl.appendChild(chipsEl);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function renderHistory() {
    messagesEl.innerHTML = "";
    // innerHTML reset detached any chips container; drop the stale reference.
    chipsEl = null;
    if (history.length === 0) {
      const div = document.createElement("div");
      div.className = "drf-msg drf-msg-bot";
      div.textContent = "Olá! Sou o Dr. Família IA. Como o posso ajudar hoje?";
      messagesEl.appendChild(div);
      // Starter chips, shown only before the first message.
      renderChips(STARTER_CHIPS);
    } else {
      history.forEach((m) => {
        const div = document.createElement("div");
        div.className = "drf-msg " + (m.role === "user" ? "drf-msg-user" : "drf-msg-bot");
        if (m.role === "user") {
          div.textContent = m.content;
        } else {
          // Assistant content is Markdown; render it safely.
          div.innerHTML = markdownToHtml(m.content);
        }
        messagesEl.appendChild(div);
      });
    }
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function addUserMessage(text) {
    const div = document.createElement("div");
    div.className = "drf-msg drf-msg-user";
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    history.push({ role: "user", content: text });
    persist();
  }

  btn.addEventListener("click", () => {
    panel.classList.add("drf-open");
    btn.classList.add("drf-hidden");
    renderHistory();
    setTimeout(() => inputEl.focus(), 100);
  });

  closeBtn.addEventListener("click", () => {
    panel.classList.remove("drf-open");
    btn.classList.remove("drf-hidden");
  });

  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  inputEl.addEventListener("input", () => {
    inputEl.style.height = "auto";
    inputEl.style.height = Math.min(inputEl.scrollHeight, 100) + "px";
  });

  sendBtn.addEventListener("click", sendMessage);

  async function sendMessage(presetText) {
    // Accept an explicit text (from a chip) or fall back to the input field,
    // so chips and the text box share the exact same send path.
    const text = (typeof presetText === "string" ? presetText : inputEl.value).trim();
    if (!text || sendBtn.disabled) return;

    // Clear dynamic chips on send; they reappear with the next "chips" event.
    clearChips();
    addUserMessage(text);
    inputEl.value = "";
    inputEl.style.height = "auto";
    sendBtn.disabled = true;

    const botDiv = document.createElement("div");
    botDiv.className = "drf-msg drf-msg-bot drf-typing";
    botDiv.textContent = "A pensar...";
    messagesEl.appendChild(botDiv);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    let assembled = "";
    let firstChunk = true;
    let pendingChips = [];

    try {
      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: text,
          tier: "free",
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error("Erro " + res.status);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim() || !line.startsWith("data:")) continue;
          const data = line.slice(5).trim();
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.type === "text_delta" && parsed.text) {
              if (firstChunk) {
                botDiv.classList.remove("drf-typing");
                botDiv.textContent = "";
                firstChunk = false;
              }
              assembled += parsed.text;
              // Assistant text is Markdown; render it safely on each update.
              botDiv.innerHTML = markdownToHtml(assembled);
              messagesEl.scrollTop = messagesEl.scrollHeight;
            } else if (parsed.type === "chips") {
              // Follow-up suggestions for the answer just rendered.
              pendingChips = Array.isArray(parsed.chips) ? parsed.chips : [];
            } else if (parsed.type === "error") {
              throw new Error(parsed.error || "Erro desconhecido");
            }
          } catch (e) {}
        }
      }

      if (assembled) {
        history.push({ role: "assistant", content: assembled });
        persist();
        // Show follow-up chips under the latest answer, if any arrived.
        renderChips(pendingChips);
      } else if (firstChunk) {
        botDiv.classList.remove("drf-typing");
        botDiv.textContent = "Sem resposta. Tente novamente.";
      }
    } catch (err) {
      botDiv.classList.remove("drf-typing");
      botDiv.textContent = "Desculpe, ocorreu um erro. Tente daqui a uns segundos.";
      console.error("[drf-widget]", err);
    } finally {
      sendBtn.disabled = false;
      inputEl.focus();
    }
  }
})();
