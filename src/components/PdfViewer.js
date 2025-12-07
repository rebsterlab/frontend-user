// src/components/PdfViewer.js
import React, { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PdfViewer({ apiBase, file, page = 1, excerpt, highlights = [] }) {
  const viewerRef = useRef();
  const pageRefs = useRef({}); // store pageProxy objects: pageNumber -> pageProxy
  const [numPages, setNumPages] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [renderedWidth, setRenderedWidth] = useState(800);

  useEffect(() => {
    if (!file) { setPdfUrl(null); return; }
    setPdfUrl(`${apiBase}/pdf/${encodeURIComponent(file)}`);
  }, [file, apiBase]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  // called when a page renders; pageEntity is the PDFPageProxy
  const onPageRenderSuccess = (pageProxy) => {
    const pnum = pageProxy.pageNumber;
    pageRefs.current[pnum] = pageProxy;
    // compute rendered width (from the DOM)
    const pageDiv = viewerRef.current?.querySelector(`[data-page-number="${pnum}"]`);
    if (pageDiv) {
      const canvas = pageDiv.querySelector("canvas");
      if (canvas) setRenderedWidth(canvas.width);
    }
    // after render, try to highlight excerpt on requested page
    if (pnum === page && excerpt) {
      highlightExcerptOnPage(pnum, excerpt);
    }
  };

  useEffect(() => {
    // when viewer url ready or page changes, scroll to the page
    if (viewerRef.current && page) {
      const el = viewerRef.current.querySelector(`[data-page-number="${page}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      // highlight if highlights for this page exist
      if (highlights && highlights.length) {
        // highlights is an array of {page, bbox:{x0,x1,top,bottom}}
        setTimeout(() => {
          drawHighlights(highlights);
        }, 300);
      }
    }
  }, [pdfUrl, page, highlights, numPages]);

  // convert bbox in PDF points to viewport rectangle and draw overlays for all highlights
  const drawHighlights = (highlightsList) => {
    if (!viewerRef.current) return;
    highlightsList.forEach(h => {
      const pnum = h.page;
      const bbox = h.bbox; // {x0,x1,top,bottom}
      const pageProxy = pageRefs.current[pnum];
      const pageDiv = viewerRef.current.querySelector(`[data-page-number="${pnum}"]`);
      if (!pageProxy || !pageDiv) return;
      // compute viewport conversion scale using pageProxy.getViewport
      const viewport = pageProxy.getViewport({ scale: 1 });
      // rendered width in CSS pixels:
      const canvas = pageDiv.querySelector("canvas");
      const cssWidth = canvas ? canvas.width : (renderedWidth || viewport.width);
      const scale = cssWidth / viewport.width;
      // pdf coordinate origin: bottom-left; pdfplumber top/bottom origin: top (distance from top). pdf.js uses bottom-left.
      // bbox from pdfplumber: x0,x1, top, bottom (top = distance from top of page)
      // we need y coordinates in PDF units measured from bottom: y_pdf = page_height - bottom
      const pageHeight = viewport.height;
      const x0 = bbox.x0;
      const x1 = bbox.x1;
      // pdfplumber: top, bottom are in same units as page height (distance from top)
      const top = bbox.top;
      const bottom = bbox.bottom;
      const y0_pdf = pageHeight - bottom; // bottom in pdf coords
      const y1_pdf = pageHeight - top;
      // convert to viewport rect
      const rect = viewport.convertToViewportRectangle([x0, y0_pdf, x1, y1_pdf]); // returns [x1,y1,x2,y2] possibly
      // normalize to left/top/width/height in CSS pixels
      const left = Math.min(rect[0], rect[2]) * scale;
      const topPx = Math.min(rect[1], rect[3]) * scale;
      const widthPx = Math.abs(rect[2] - rect[0]) * scale;
      const heightPx = Math.abs(rect[3] - rect[1]) * scale;

      // create overlay element
      let overlayContainer = pageDiv.querySelector(".highlight-overlays");
      if (!overlayContainer) {
        overlayContainer = document.createElement("div");
        overlayContainer.className = "highlight-overlays";
        overlayContainer.style.position = "absolute";
        overlayContainer.style.left = 0;
        overlayContainer.style.top = 0;
        overlayContainer.style.width = "100%";
        overlayContainer.style.height = "100%";
        overlayContainer.style.pointerEvents = "none";
        pageDiv.style.position = "relative";
        pageDiv.appendChild(overlayContainer);
      }

      const highlight = document.createElement("div");
      highlight.style.position = "absolute";
      highlight.style.left = `${left}px`;
      highlight.style.top = `${topPx}px`;
      highlight.style.width = `${widthPx}px`;
      highlight.style.height = `${heightPx}px`;
      highlight.style.background = "rgba(250,215,60,0.45)";
      highlight.style.borderRadius = "3px";
      highlight.style.pointerEvents = "none";
      overlayContainer.appendChild(highlight);
      // optional: auto-scroll first highlight into center
      highlight.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  const highlightExcerptOnPage = (pnum, excerptText) => {
    // attempt fuzzy highlight by searching text layer spans (fallback)
    const pageDiv = viewerRef.current?.querySelector(`[data-page-number="${pnum}"]`);
    if (!pageDiv) return;
    const textLayer = pageDiv.querySelector(".react-pdf__Page__textContent");
    if (!textLayer) return;
    const spans = Array.from(textLayer.querySelectorAll("span"));
    const full = spans.map(s => s.textContent || "").join("");
    const idx = full.indexOf(excerptText);
    if (idx === -1) {
      // try a shorter excerpt
      const short = excerptText.slice(0, 120);
      const idx2 = full.indexOf(short);
      if (idx2 === -1) return;
    }
    // fallback: just draw nothing here (we rely on server bbox highlights)
  };

  if (!file) {
    return (
      <div style={{ padding: 16 }}>
        <div style={{ color: "#64748b" }}>Nessun documento selezionato.</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <div style={{ flex: 1, overflow: "auto", position: "relative" }} ref={viewerRef}>
        {pdfUrl ? (
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<div style={{ padding: 16 }}>Caricamento PDF…</div>}
            options={{ cMapUrl: "cmaps/", cMapPacked: true }}
          >
            {Array.from(new Array(numPages || 0), (el, index) => (
              <div key={`page_${index+1}`} data-page-number={index+1} style={{ position: "relative", marginBottom: 8 }}>
                <Page
                  pageNumber={index+1}
                  width={800}
                  renderTextLayer={true}
                  renderAnnotationLayer={false}
                  onRenderSuccess={onPageRenderSuccess}
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
      </div>
    </div>
  );
}
