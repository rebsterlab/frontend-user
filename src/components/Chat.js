import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

export default function Chat({ apiBase }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef();

  useEffect(() => {
    if (endRef.current)
      endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const q = input.trim();
    if (!q) return;

    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setInput("");
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("message", q);

      const res = await fetch(`${apiBase}/chat`, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
  /*    const answer =
        data.response || data.answer || "Non ho trovato informazioni rilevanti.";
*/
const answer = data.answer || data.response || "Nessuna informazione trovata.";
setMessages(prev => [...prev, {role: "assistant", text: answer, sources: data.citations || []}]);



      
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: answer, sources: data.sources || [] },
      ]);
    } catch (err) {
      console.error("Errore in send:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            "Errore di rete: impossibile contattare il server o endpoint non raggiungibile.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: 16,
        background: "#ffffff",
        borderRadius: 12,
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <div
          style={{
            width: 48,
            height: 48,
            background: "#e0f2fe",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
          }}
        >
          🤖
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18, color: "#0f172a" }}>
            Unicardealer Service Assistant
          </div>
          <div style={{ fontSize: 13, color: "#64748b" }}>
            Assistenza tecnica specializzata
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div
        style={{
          height: 420,
          overflowY: "auto",
          padding: 12,
          borderRadius: 8,
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              textAlign: "center",
              color: "#94a3b8",
              marginTop: 80,
              fontSize: 15,
            }}
          >
            Benvenuto — chiedi un codice errore o una procedura.
          </div>
        )}

        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              marginBottom: 12,
              textAlign: m.role === "user" ? "right" : "left",
            }}
          >
            <div
              style={{
                display: "inline-block",
                background: m.role === "user" ? "#0ea5e9" : "#fff",
                color: m.role === "user" ? "#fff" : "#0f172a",
                padding: "10px 14px",
                borderRadius: 12,
                maxWidth: "78%",
                boxShadow:
                  m.role === "assistant"
                    ? "0 1px 4px rgba(0,0,0,0.05)"
                    : "none",
              }}
            >
              <div style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>


 {m.sources && m.sources.length>0 && (
  <div style={{marginTop:8, fontSize:13, color:'#475569'}}>
    Citazioni:
    <ul style={{marginTop:6, marginLeft:16}}>
      {m.sources.map((s,idx)=> (
        <li key={idx}>
          <blockquote style={{fontStyle:'italic',color:'#334155'}}>{s.slice(0,180)}...</blockquote>
        </li>
      ))}
    </ul>
  </div>
)}



  /*            {m.sources && m.sources.length > 0 && (
                <div style={{ marginTop: 8, fontSize: 13, color: "#475569" }}>
                  Fonti:
                  <ul style={{ marginTop: 6, marginLeft: 16 }}>
                    {m.sources.map((s, idx) => (
                      <li key={idx}>
                        <a
                          style={{ color: "#0ea5e9" }}
                          href={
                            s.download_url || `/download/${s.file}`
                          }
                          target="_blank"
                          rel="noreferrer"
                        >
                          {s.file}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              */
            </div>
          </motion.div>
        ))}

        {loading && (
          <div style={{ color: "#64748b", textAlign: "center" }}>Digitando...</div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input bar */}
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
          placeholder="Scrivi la tua domanda..."
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 10,
            border: "1px solid #e2e8f0",
            fontSize: 15,
          }}
        />
        <button
          onClick={send}
          disabled={loading}
          style={{
            background: loading ? "#94a3b8" : "#0ea5e9",
            color: "#fff",
            padding: "10px 16px",
            borderRadius: 10,
            fontWeight: 700,
            transition: "background 0.2s",
          }}
        >
          {loading ? "..." : "Invia"}
        </button>
      </div>
    </div>
  );
}
