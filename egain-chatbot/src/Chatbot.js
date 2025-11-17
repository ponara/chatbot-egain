import React, { useState, useRef, useEffect } from "react";
import "./Chatbot.css";

// static data for packages
const packages = {
  "123ABC": { status: "In transit", delivery: "2025-11-20" },
  "456DEF": { status: "Delivered", delivery: "2025-11-15" },
  "789GHI": { status: "Shipment delayed", delivery: "2025-11-22" },
};

export default function Chatbot() {
  // state to store all chat messages
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! i'm eGainbot. How can i help you today?" },
    {
      from: "bot",
      text: "1. Track a package\n2. Report an issue with a package\n3. Exit",
    },
  ]);

  // state to store user input from the input box
  const [userInput, setUserInput] = useState("");

  // state machine to track which part of the conversation we are in
  const [state, setState] = useState("mainMenu");

  // ref to scroll chat window automatically to the bottom
  const messagesEndRef = useRef(null);
  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  // scroll to bottom whenever messages change
  useEffect(scrollToBottom, [messages]);

  // helper function to add a new message to the chat
  const addMessage = (from, text) =>
    setMessages((prev) => [...prev, { from, text }]);

  // handle user input when user clicks send or presses enter
  const handleUserInput = () => {
    const input = userInput.trim(); // remove whitespace
    if (!input) return; // ignore empty input

    addMessage("user", input); // add user's message to chat
    setUserInput(""); // clear input box

    if (state === "mainMenu") {
      if (input === "1") {
        addMessage(
          "bot",
          "Great! Please enter your tracking number (6 characters)."
        );
        setState("askTracking"); // move to tracking number state
      } else if (input === "2") {
        addMessage("bot", "Please describe the issue with your package:");
        setState("reportIssue"); // move to report issue state
      } else if (input === "3") {
        addMessage("bot", "Thanks for using eGainbot! Have a great day!");
        setState("end"); // end chat
      } else {
        addMessage(
          "bot",
          "I'm sorry, I don't understand. Please enter 1, 2, or 3."
        );
      }
    } else if (state === "askTracking") {
      // validate tracking number format
      if (!/^[0-9A-Z]{6}$/.test(input.toUpperCase())) {
        addMessage(
          "bot",
          "Hmm, that doesn't look right. Please enter a 6-character tracking number."
        );
        return;
      }

      const trackingNumber = input.toUpperCase();
      if (packages[trackingNumber]) {
        const pkg = packages[trackingNumber];
        addMessage(
          "bot",
          `Status: ${pkg.status}. Estimated delivery: ${pkg.delivery}`
        );
      } else {
        addMessage("bot", "I'm sorry, I can't find a package with that number.");
      }

      addMessage("bot", "Do you want to do something else? (yes/no)");
      setState("backToMenu"); // prompt to go back to main menu
    } else if (state === "reportIssue") {
      addMessage(
        "bot",
        "Thank you for reporting the issue. Our support team will contact you shortly."
      );
      addMessage("bot", "Do you want to do something else? (yes/no)");
      setState("backToMenu");
    } else if (state === "backToMenu") {
      if (input.toLowerCase() === "yes") {
        addMessage("bot", "How can I help you today?");
        addMessage(
          "bot",
          "1. Track a package\n2. Report an issue with a package\n3. Exit"
        );
        setState("mainMenu");
      } else if (input.toLowerCase() === "no") {
        addMessage("bot", "Thanks for using eGainbot! Have a great day!");
        setState("end");
      } else {
        addMessage(
          "bot",
          "I'm sorry, I don't understand. Please reply with yes or no."
        );
      }
    }
  };

  // handle pressing enter key in input box
  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleUserInput();
  };

  return (
    <div className="chatbot-container">
      {/* chatbot title */}
      <h2 className="chatbot-title">eGain Chatbot</h2>

      {/* chat messages window */}
      <div className="chat-window">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-message ${msg.from}`}>
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* input box and send button (hidden if chat ended) */}
      {state !== "end" && (
        <>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
          />
          <button onClick={handleUserInput}>Send</button>
        </>
      )}
    </div>
  );
}
