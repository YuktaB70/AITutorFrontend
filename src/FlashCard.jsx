import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import "./FlashCard.css";

function FlashCard({ onDelete, fileId }) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [questions, setQuestions] = useState([]);
    const [selectedAnswers, setSelectedAnswers] = useState([]);
    const [showAnswer, setShowAnswer] = useState([]);
    useEffect(() => {
      const genQA = async () => {
        try {
          const response = await fetch(`https://aitutor-production-cb21.up.railway.app/pdf/${fileId}/GenQA`);
          if (!response.ok) throw new Error("Failed to generate questions");
  
          const data = await response.json(); 
          setQuestions(data);
          setSelectedAnswers(new Array(data.length).fill(null));
          setShowAnswer(new Array(data.length).fill(false))

        } catch (error) {
          console.error(error);
        }
      };
  
      genQA();
    }, [fileId]);
  
    const handleSubmitQuestion = () => {
      const selected = selectedAnswers[currentQuestion];

      if (selected === null || selected === undefined) {
        return;
      }
    
      const updatedShowAnswers = [...showAnswer];
      updatedShowAnswers[currentQuestion] = true; 
      setShowAnswer(updatedShowAnswers);
        };
  
    const handleNextQuestion = () => {
      setCurrentQuestion((prev) => Math.min(questions.length - 1, prev + 1));
    };
  
    const handleSelect = (index) => {
      const updatedAnswers = [...selectedAnswers];
      updatedAnswers[currentQuestion] = index;
      setSelectedAnswers(updatedAnswers);

     
    };
  
    const question = questions[currentQuestion];
  
    return ReactDOM.createPortal(
      <div className="flashcard-overlay">
        <div className="header">
          <p>Practice Questions</p>
          <span className="close-btn" onClick={onDelete}>
            &times;
          </span>
        </div>
  
        <div className="flashcard-container">
          {question ? (
            <>
              <div className="question-container">
                <p>{question.question}</p>
              </div>
  
              <div className="option-container">
                {question.options.map((answer, i) => (
                  <label key={i} className="container">
                    {answer}
                    <input
                      type="radio"
                      name="radio"
                      checked={selectedAnswers[currentQuestion] === i}
                      onChange={() => handleSelect(i)}
                    />
                    <span className="checkmark"></span>
                  </label>
                ))}
              </div>

              <div className="answer-container">
                {showAnswer[currentQuestion] && <p>Correct Answer: {question.answer}</p>}
              </div>
              <div className="button-container">
              {!showAnswer[currentQuestion] ? (
                <button
                className="submitBtn"
                onClick={handleSubmitQuestion}
                disabled={selectedAnswers[currentQuestion] === null}
                >
                  Submit
                </button>
              ) : (
                <button
                  className="nextBtn"
                  onClick={handleNextQuestion}
                  disabled={currentQuestion === questions.length - 1}
                >
                  Next
                </button>
              )}

              </div>
            </>
          ) : (
            <div className="question-container">
              <p>Loading questions...</p>
            </div>
          )}
        </div>
      </div>,
      document.body
    );
  }
  


export default FlashCard;
