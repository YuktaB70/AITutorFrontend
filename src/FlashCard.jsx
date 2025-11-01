import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import "./FlashCard.css";

function FlashCard() {


    return ReactDOM.createPortal (
        <div className="flashcard-overlay">
            <div className="header">
                <p>Practice Questions</p>
                <span class="close-btn">&times;</span>
            </div>

            <div className="flashcard-container">
                <div className="question-container">
                    
                </div>
            </div>
       
        </div>,
        document.body


    );
    
}



export default FlashCard;
