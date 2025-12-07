// PdfViewer.js
import React, { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PdfViewer({ apiBase, file, page = 1, excerpt }) {
  const viewerRef = useRef();
  const [numPages, setNumPages] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    if (!file) {
      setPdfUrl(null);
      return;
    }
    const url = `${apiBase}/pdf/${encodeURIComponent(file)}`;
    setPdfUrl(url);
  }, [file, apiBase]);

  useEffect(() => {
    if (viewerRef.current && page) {
      const el = viewerRef.current.querySelector(`[data-page-number="${page}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [page, pdfUrl, numPages]);

  useEffect(() => {
    const v = viewerRef.current;
    if (!v) return;
    const onContext = (e) => e.preventDefault();
    v.addEventListener("contextmenu", onContext);
    return () => v.removeEventListener("contextmenu", onContext);
  }, [viewerRef, pdfUrl]);

  if (!file) {
    return (
      <div style={{ padding: 16 }}>
        <div style={{ color: "#64748b" }}>Nessun documento selezionato.</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <div style={{ flex: 1, overflow: "auto" }} ref={viewerRef}>
        {pdfUrl ? (
          <Document
            file={pdfUrl}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            loading={<div style={{ padding: 16 }}>Caricamento PDF…</div>}
            options={{ cMapUrl: "cmaps/", cMapPacked: true }}
          >
            {Array.from(new Array(numPages), (el, index) => (
              <div key={`page_${index+1}`} data-page-number={index+1}>
                <Page
                  pageNumber={index+1}
                  width={800}
                  renderTextLayer={true}
                  renderAnnotationLayer={false}
                />
              </div>
            ))}
          </Document>
        ) : (
          <div style={{ padding: 12 }}>Caricamento…</div>
        )}
      </div>
      <div style={{ width: 360, borderLeft: "1px solid #e6eef8", padding: 12, boxSizing: "border-box" }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Estratto</div>
        <div style={{ fontSize: 13, color: "#334155", whiteSpace: "pre-wrap" }}>{excerpt || "Seleziona una citazione per vedere la porzione di testo."}</div>
        <div style={{ marginTop: 12, fontSize: 13, color: "#64748b" }}>
          Pagina: <strong>{page}</strong>
        </div>
        <div style={{ marginTop: 18, fontSize: 12, color: "#94a3b8" }}>
          Nota: per la sicurezza, il pulsante di download è disabilitato nell'interfaccia. Tuttavia, gli utenti tecnici possono comunque salvare risorse dal browser.
        </div>
      </div>
    </div>
  );
}
