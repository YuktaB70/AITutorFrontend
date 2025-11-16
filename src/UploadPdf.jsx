import './Upload.css'
import React, { useState } from "react";
import AIPDFViewport from "./pdfAIViewport";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;


function UploadPdf() {
    const [file, setFile] = useState(null);
    const [fileId, setId] = useState(null);
    const handleFileChange = async (e) => {
        const uploadedFile = e.target.files[0]; 
        const formData = new FormData(); 
        if(uploadedFile && uploadedFile.type === "application/pdf") {
            formData.append("file", uploadedFile);
            setFile(uploadedFile);  

            try{
              const response = await fetch("https://aitutor-production-cb21.up.railway.app/pdf/uploadpdf", {
                method: "POST",
                body: formData
              });
              // const response = await fetch("http://localhost:8090/pdf/uploadpdf", {
              //   method: "POST",
              //   body: formData
              // });
              
              if (!response.ok) throw new Error("PDF failed to upload");
              const data = await response.json();
              if (data && data.fileId) {
                   setId(data.fileId);
              } 


            }
            catch(error) {
              console.error(error)
            }
        }
        else {
            alert("Please upload PDF file");
        }
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        const uploadFile = e.dataTransfer.files[0];

        if(uploadFile && uploadFile.type === "application/pdf") {
            const formData = new FormData();
            formData.append("file", uploadFile);
            setFile(uploadFile);

            try {
              
              const response = await fetch("https://aitutor-production-cb21.up.railway.app/pdf/uploadpdf", {
                method: "POST",
                body: formData
              });
                // const response = await fetch("http://localhost:8090/pdf/uploadpdf", {
                //     method: "POST",
                //     body: formData
                // });
                
                if (!response.ok) throw new Error("PDF failed to upload");
                const data = await response.json();
                if (data && data.fileId) {
                    setId(data.fileId);
                }
            }
            catch(error) {  
                console.error(error);
            }
        }
        else {
            alert("Please upload PDF file");
        }
    };

return (
    <div>
      {!file ? (
        // Upload Page
        <div className="upload-container">

          <div className="Title">Streamline Your Learning with an AI-Powered Tutor</div>
          <div className="Header">Upload your PDFs and let our AI tutor guide you</div>

          <div
            className="upload-box"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <p className="upload-text">Drag and Drop your PDF here</p>
            <label className="upload-btn">
              Browse
              <input
                type="file"
                accept="application/pdf"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </label>
            <p className="upload-text">Supported: PDF only</p>
          </div>
        </div>
      ) : (
           <div>
              <AIPDFViewport FileId={fileId}/>
            </div>
      )}
    </div>
  );

};

export default UploadPdf;