import React, { useEffect, useRef, useState } from "react";
import "./pdfLayout.css";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?url";
import { Rnd } from "react-rnd";
import AIChatBox from "./AIChatBox";

import questionIcon from "./assets/icons8-question-60.png";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

function AIPDFViewport({ FileId }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!FileId) return;
    const loadPdf = async () => {
      const res = await fetch(`https://aitutor-shky.onrender.com/pdf/${FileId}/metadata`);
      const response = await fetch(`https://aitutor-shky.onrender.com/pdf/${FileId}`);
      if (!response.ok) throw new Error("Failed to fetch PDF page");
      
      if(!res.ok) throw new Error("Failed to fetch metadata");
      
      const numPages = await res.text(); 
      setTotalPages(parseInt(numPages, 10));
      setCurrentPage(1);
      
      // Load the first page directly
      await loadPage(response, FileId, 1, containerRef, canvasRef);
    }
    loadPdf();
  }, [FileId]);


  useEffect(() => {
    if (!containerRef.current || currentPage === 0) return;
    
    // Add a small delay to ensure container has proper dimensions
    const timer = setTimeout(() => {
      loadPage(FileId, currentPage, containerRef, canvasRef);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [currentPage, FileId]);
  
  const handleNextPage = async () => {
    const response = await fetch(`https://aitutor-shky.onrender.com/pdf/${FileId}/Next`);
    if (!response.ok) throw new Error("Failed to fetch PDF page");
    await loadPage(response, FileId, 1, containerRef, canvasRef);
    setCurrentPage(prev => Math.max(1, prev + 1))
  }
  const handlePrevPage = async () => {
    const response = await fetch(`https://aitutor-shky.onrender.com/pdf/${FileId}/Prev`);
    if (!response.ok) throw new Error("Failed to fetch PDF page");
    await loadPage(response, FileId, 1, containerRef, canvasRef);
    setCurrentPage(prev => Math.max(1, prev - 1))
  }
  return (
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
          <button className="cardBtn">
            <img src={questionIcon} alt="flashCard" style={{ width: 50, height: 50 }}/>
          </button>

          <div className="pdf-wrapper">
              <canvas className="pdf-canvas" ref={canvasRef} />
          </div>
          </div>

          <div className="chat-box-container">
              <AIChatBox fileId={FileId}/>
          </div>



      </div>
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
    const page = await pdf.getPage(1);
    
    await renderPage(page, containerRef, canvasRef);
  }
  catch(error) {
    console.error("Error loading page:", error);
  }
}


async function renderPage(page, containerRef, canvasRef) {
  try {
    if (!containerRef.current || !canvasRef.current) {
      console.error("Container or canvas ref not available");
      return;
    }

    const containerX = containerRef.current.clientWidth;
    const containerY = containerRef.current.clientHeight;
    
    if (containerX === 0 || containerY === 0) {
      console.error("Container has no dimensions");
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
    canvas.style.width = viewport.width + 'px';
    canvas.style.height = (viewport.height + 50) + 'px';

    // Clear canvas before rendering
    context.clearRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: context,
      viewport: viewport,
      transform: [PRINT_UNITS, 0, 0, PRINT_UNITS, 0, 0],
    }).promise;

    console.log("PDF page rendered successfully");
  } catch (error) {
    console.error("Error rendering PDF page:", error);
  }
}




export default AIPDFViewport;
