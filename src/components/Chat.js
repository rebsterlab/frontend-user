import React, { useState } from "react";
import { motion } from "framer-motion";

export default function Chat({ apiBase }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);
    setInput("");

    try {
      const fd = new FormData();
      fd.append("message", input);
      const res = await fetch(`${apiBase}/chat`, { method: "POST", body: fd });
      const data = await res.json();
      if (data.response) {
        const botMsg = {
          role: "assistant",
          content: data.response,
          citations: data.citations || [],
        };
        setMessages((m) => [...m, botMsg]);
      } else {
        throw new Error(data.error || "Errore risposta server");
      }
    } catch (err) {
      console.error(err);
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "❌ Errore di rete. Riprova più tardi." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        padding: "20px 16px",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 999,
            background: "#e0f2fe",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
          }}
        >
          🤖
        </div>
        <div>
          <div style={{ fontWeight: 700 }}>Unicardealer Service Tech Assistant</div>
          <div style={{ fontSize: 13, color: "#64748b" }}>
            Risposte tecniche basate su documentazione interna
          </div>
        </div>
      </header>

      {/* Chat area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "10px 6px",
          background: "#f8fafc",
          borderRadius: 10,
          border: "1px solid #e2e8f0",
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              color: "#94a3b8",
              textAlign: "center",
              paddingTop: 100,
              fontSize: 15,
            }}
          >
            💬 Inizia a scrivere una domanda tecnica...
          </div>
        ) : (
          messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                background: m.role === "user" ? "#e0f2fe" : "#fff",
                color: "#0f172a",
                padding: "12px 14px",
                borderRadius: 12,
                marginBottom: 10,
                maxWidth: "90%",
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 13,
                  color: "#0369a1",
                  marginBottom: 4,
                }}
              >
                {m.role === "user" ? "Tu" : "Assistant"}
              </div>
              <div style={{ whiteSpace: "pre-wrap", fontSize: 14 }}>{m.content}</div>

              {/* Citazioni */}
              {m.role === "assistant" && m.citations?.length > 0 && (
                <div
                  style={{
                    marginTop: 10,
                    background: "#f1f5f9",
                    borderRadius: 8,
                    padding: "8px 10px",
                    fontSize: 13,
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>📄 Citazioni</div>
                  {m.citations.map((c, ci) => (
                    <div
                      key={ci}
                      style={{
                        marginBottom: 6,
                        borderLeft: "3px solid #0ea5e9",
                        paddingLeft: 6,
                      }}
                    >
                      <div style={{ fontWeight: 500, color: "#0369a1" }}>{c.file}</div>
                      <div
                        style={{
                          color: "#334155",
                          fontSize: 13,
                          marginTop: 2,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {c.excerpt}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Input area */}
      <div
        style={{
          display: "flex",
          marginTop: 14,
          gap: 8,
          background: "white",
          borderRadius: 12,
          border: "1px solid #e2e8f0",
          padding: 6,
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Scrivi una domanda tecnica..."
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            padding: "8px 10px",
            fontSize: 15,
            borderRadius: 10,
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          style={{
            background: "#0ea5e9",
            color: "white",
            borderRadius: 10,
            fontWeight: 600,
            padding: "8px 14px",
            cursor: "pointer",
          }}
        >
          {loading ? "..." : "Invia"}
        </button>
      </div>
    </div>
  );
}
