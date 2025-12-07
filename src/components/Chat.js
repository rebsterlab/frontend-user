// src/components/Chat.js
import React, { useState, useRef, useEffect } from "react";
import PdfViewer from "./PdfViewer";
import { motion } from "framer-motion";

export default function Chat({ apiBase }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [viewerState, setViewerState] = useState({
    open: false,
    file: null,
    page: null,
    excerpt: null,
    highlights: []
  });

  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const form = new FormData();
      form.append("message", input);

      const res = await fetch(`${apiBase}/chat`, {
        method: "POST",
        body: form
      });

      const data = await res.json();

      const assistantMessage = {
        role: "assistant",
        content: data.response,
        citations: data.citations || []
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (e) {
      console.error("Chat error:", e);
    }

    setInput("");
    setLoading(false);
  };

  // open PDF citation in the viewer
  const openCitation = (cit) => {
    const highlights = cit.bbox
      ? [{ page: cit.page, bbox: cit.bbox }]
      : [];

    setViewerState({
      open: true,
      file: cit.file,
      page: cit.page,
      excerpt: cit.excerpt,
      highlights
    });
  };

  return (
    <div className="w-full h-full flex">
      
      {/* Left side — Chat */}
      <div className="flex-1 flex flex-col border-r border-gray-200">
        <div className="flex-1 overflow-y-auto p-4">
          
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-4 ${m.role === "user" ? "text-right" : "text-left"}`}
            >
              <div
                className={`inline-block px-3 py-2 rounded-xl ${
                  m.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                {m.content}
              </div>

              {/* Citations block */}
              {m.citations && m.citations.length > 0 && (
                <div className="mt-2 space-y-2">
                  {m.citations.map((c, idx) => (
                    <div
                      key={idx}
                      onClick={() => openCitation(c)}
                      className="cursor-pointer px-3 py-2 bg-yellow-100 hover:bg-yellow-200 rounded-lg text-sm border border-yellow-300"
                    >
                      <strong>{c.file}</strong> – Pag. {c.page}
                      <div className="text-gray-700 text-xs mt-1">
                        {c.excerpt?.slice(0, 150)}...
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}

          <div ref={chatEndRef}></div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" ? sendMessage() : null}
            className="flex-1 border rounded-lg px-3 py-2"
            placeholder="Scrivi la tua domanda tecnica..."
          />
          <button
            disabled={loading}
            onClick={sendMessage}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            {loading ? "..." : "Invia"}
          </button>
        </div>
      </div>

      {/* Right side — PDF Viewer */}
      <div className={`w-[60%] ${viewerState.open ? "block" : "hidden"} bg-white`}>
        <PdfViewer
          apiBase={apiBase}
          file={viewerState.file}
          page={viewerState.page}
          excerpt={viewerState.excerpt}
          highlights={viewerState.highlights}
        />
      </div>
    </div>
  );
}
