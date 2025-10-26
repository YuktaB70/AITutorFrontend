import React, { useEffect, useState, useRef } from "react";
import "./ChatBox.css";

function AIChatBox({ fileId }) {
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hello, I am your AI tutor. I can summarize notes and explain difficult concept.b How may I help you today?" }, //Begin conversation 
  ]);
  const [input, setInput] = useState(""); //Stores what user types 
  const [displayedMessages, setDisplayedMessages] = useState([]); //adds messages to list
  const messagesEndRef = useRef(null);

  // Function to scroll to bottom of chat
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    if (messages.length === 0) return; 

    const lastMessage = messages[messages.length - 1]; //get most recent added message

    if (lastMessage.sender === "user") { //user message
      setDisplayedMessages([...messages]); //immediately display messages
      scrollToBottom(); // scroll to show user message
      return;
    }

    if (lastMessage.sender === "ai") {//ai message
      let index = 0;
      const interval = setInterval(() => {
        setDisplayedMessages(() => {
          const updated = [...messages.slice(0, messages.length - 1)];
          const currentText = lastMessage.text.slice(0, index + 1);
          updated.push({ ...lastMessage, text: currentText }); //we want to animate ai response like its typing it out in front of user
          return updated;
        });

        scrollToBottom();

        index++;
        if (index >= lastMessage.text.length) clearInterval(interval);
      }, 25);

      return () => clearInterval(interval);
     }
   }, [messages]);

   // Scroll to bottom whenever displayed messages change
   useEffect(() => {
     scrollToBottom();
   }, [displayedMessages]);

  const sendMessage = async () => {
    if (!input.trim()) return; //check if user typed anything

    const userMessage = { sender: "user", text: input }; //create object to rep. user's message
    setMessages((prev) => [...prev, userMessage]);//creates a new array with added message
    setInput(""); //reset input

    //AI response, send an api to backend, with user input. 
    setTimeout(async () => {
      const res = await fetch(`https://aitutor-shky.onrender.com/pdf/${fileId}/QAs` , {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: input

      })
      if (!res.ok) throw new Error("Failed to retrieve AI response");
      const aiResponse = await res.text();
      if(aiResponse) {
        setMessages((prev) => [...prev, { sender: "ai", text: aiResponse }]);
      }



    }, 1000);
  };

  return (
    <div className="chat-box">
        <div className="chat-messages">
          {displayedMessages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
export default AIChatBox;
