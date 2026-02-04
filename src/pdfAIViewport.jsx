import React, { useEffect, useRef, useState } from "react";
import "./pdfLayout.css";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?url";
import { Rnd } from "react-rnd";
import AIChatBox from "./AIChatBox";
import FlashCard  from "./FlashCard";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
const apiUrl = "https://aitutor-backend-pdf.onrender.com";

function AIPDFViewport({ FileId }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!FileId) return;

    const loadMetadata = async () => {
      try {
        const res = await fetch(`${apiUrl}/pdf/${FileId}/metadata`);
        if (!res.ok) throw new Error("Failed to fetch metadata");

        const data = await res.json();
        setTotalPages(data.PageNumber);
        console.log("Total pages:", data.PageNumber);
        setCurrentPage(1);
      } catch (e) {
        console.error(e);
      }
    };

    loadMetadata();
  }, [FileId]);

  useEffect(() => {
    if (!FileId) return;

    const loadPdf = async () => {
      try {
        const response = await fetch(`${apiUrl}/pdf/${FileId}`);
        if (!response.ok) throw new Error("Failed to fetch PDF page");

        await loadPage(response, FileId, 1, containerRef, canvasRef);
      } catch (e) {
        console.error(e);
      }
    };

    loadPdf();
  }, [FileId]);

  useEffect(() => {
    if (!FileId || currentPage === 0) return;

    const timer = setTimeout(async () => {
      const response = await fetch(`${apiUrl}/pdf/${FileId}`);
      loadPage(response, FileId, currentPage, containerRef, canvasRef);
    }, 50); // slightly faster

    return () => clearTimeout(timer);
  }, [currentPage, FileId]);

  const handleNextPage = async () => {
    await fetch(`${apiUrl}/pdf/${FileId}/Next`);
    setCurrentPage((prev) => Math.min(totalPages, prev + 1)); // ✅ clamp
  };

  const handlePrevPage = async () => {
    await fetch(`${apiUrl}/pdf/${FileId}/Prev`);
    setCurrentPage((prev) => Math.max(1, prev - 1)); // ✅ clamp
  };

  return (
    <div>
      {totalPages ? (
        <div className="pdf-viewport-container">
          <div className="pdf-main">
            <div className="pdf-viewport" ref={containerRef}>
              <div className="pdf-navigation">
                <button
                  className="nav-button prev-button"
                  onClick={handlePrevPage}
                  disabled={currentPage <= 1}
                >
                  ← Previous
                </button>

                <div className="page-indicator">
                  Page {currentPage} of {totalPages}
                </div>

                <button
                  className="nav-button next-button"
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages}
                >
                  Next →
                </button>
              </div>

              <div className="pdf-wrapper">
                <canvas className="pdf-canvas" ref={canvasRef} />
              </div>
            </div>

            <div className="chat-box-container">
              <AIChatBox fileId={FileId} />
            </div>
          </div>
        </div>
      ) : (
        <div className="loading-spinner-container">
          <p>Loading</p>
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
}

async function loadPage(response, FileId, pageNumber, containerRef, canvasRef) {
  try {
    const base64 = await response.text();
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
    const page = await pdf.getPage(pageNumber); // ✅ FIXED: use pageNumber

    await renderPage(page, containerRef, canvasRef);
  } catch (error) {
    console.error("Error loading page:", error);
  }
}

async function renderPage(page, containerRef, canvasRef, attempts = 0) {
  try {
    if (!containerRef.current || !canvasRef.current) {
      if (attempts < 30) {
        requestAnimationFrame(() =>
          renderPage(page, containerRef, canvasRef, attempts + 1)
        );
      }
      return;
    }

    const containerX = containerRef.current.clientWidth;
    const containerY = containerRef.current.clientHeight;

    if (containerX === 0 || containerY === 0) {
      if (attempts < 30) {
        requestAnimationFrame(() =>
          renderPage(page, containerRef, canvasRef, attempts + 1)
        );
      }
      return;
    }

    const PRINT_RESOLUTION = 250;
    const PRINT_UNITS = PRINT_RESOLUTION / 72.0;

    const unscaledViewport = page.getViewport({ scale: 1 });
    const scaleX = containerX / unscaledViewport.width;
    const scaleY = containerY / unscaledViewport.height;
    const scale = Math.min(scaleX, scaleY);

    const viewport = page.getViewport({ scale });
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const bottomMargin = 50 * PRINT_UNITS;
    canvas.width = Math.floor(viewport.width * PRINT_UNITS);
    canvas.height = Math.floor(viewport.height * PRINT_UNITS) + bottomMargin;
    canvas.style.width = viewport.width + "px";
    canvas.style.height = viewport.height + 50 + "px";

    context.clearRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: context,
      viewport,
      transform: [PRINT_UNITS, 0, 0, PRINT_UNITS, 0, 0],
    }).promise;

    console.log("PDF page rendered successfully");
  } catch (error) {
    console.error("Error rendering PDF page:", error);
  }
}

export default AIPDFViewport;
