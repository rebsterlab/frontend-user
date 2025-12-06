// Chat.js (USer)
import React, { useState, useRef } from "react";
import PdfViewer from "./PdfViewer";
import { motion } from "framer-motion";

export default function Chat({ apiBase }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [viewerState, setViewerState] = useState({ open: false, file: null, page: 1, excerpt: "" });

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("message", input);
      const res = await fetch(`${apiBase}/chat`, { method: "POST", body: fd });
      const data = await res.json();
      if (data.response) {
        const botMsg = { role: "assistant", content: data.response, citations: data.citations || [] };
        setMessages((m) => [...m, botMsg]);
      } else {
        setMessages((m) => [...m, { role: "assistant", content: "Errore: " + (data.error || "risposta non valida") }]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((m) => [...m, { role: "assistant", content: "Errore di rete. Riprova più tardi." }]);
    } finally {
      setLoading(false);
    }
  };

  const openCitation = (cit) => {
    setViewerState({ open: true, file: cit.file, page: cit.page, excerpt: cit.excerpt });
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 16, padding: 16, height: "100vh", boxSizing: "border-box" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ padding: 12, borderRadius: 10, background: "#fff", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
          <h2 style={{ margin: 0 }}>Unicardealer Service Assistant</h2>
          <p style={{ margin: 0, color: "#64748b" }}>Chiedi al tuo assistente tecnico</p>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 8, borderRadius: 10, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
          {messages.length === 0 && <div style={{ color: "#94a3b8", textAlign: "center", paddingTop: 40 }}>Inizia la conversazione...</div>}
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 12, alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%" }}>
              <div style={{ background: m.role === "user" ? "#e0f2fe" : "#fff", padding: 12, borderRadius: 10 }}>
                <div style={{ fontWeight: 600, color: m.role === "user" ? "#0369a1" : "#0f172a" }}>{m.role === "user" ? "Tu" : "Assistant"}</div>
                <div style={{ whiteSpace: "pre-wrap", marginTop: 6 }}>{m.content}</div>

                {m.role === "assistant" && m.citations?.length > 0 && (
                  <div style={{ marginTop: 8, fontSize: 13 }}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>Citazioni</div>
                    <ul style={{ paddingLeft: 18 }}>
                      {m.citations.map((c, idx) => (
                        <li key={idx} style={{ marginBottom: 6 }}>
                          <a href="#" onClick={(e) => { e.preventDefault(); openCitation(c); }} style={{ color: "#0ea5e9" }}>
                            {c.file} — pagina {c.page}
                          </a>
                          <div style={{ color: "#475569", fontSize: 13, marginTop: 4 }}>{c.excerpt}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder="Scrivi la tua domanda..." style={{ flex: 1, padding: 12, borderRadius: 10, border: "1px solid #e2e8f0" }} />
          <button onClick={sendMessage} disabled={loading} style={{ background: "#0ea5e9", color: "#fff", padding: "10px 14px", borderRadius: 10, fontWeight: 700 }}>{loading ? "..." : "Invia"}</button>
        </div>
      </div>

      <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #e2e8f0", background: "#fff" }}>
        <PdfViewer
          apiBase={apiBase}
          file={viewerState.file}
          page={viewerState.page}
          excerpt={viewerState.excerpt}
        />
      </div>
    </div>
  );
}
