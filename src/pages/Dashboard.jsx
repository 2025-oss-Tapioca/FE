import React, { useState, useRef, useEffect } from "react";
import "../styles/css/Dashboard.css";

const Dashboard = () => {
  const [messages, setMessages] = useState([
    { role: "bot", text: "안녕하세요! 무엇을 도와드릴까요?" },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const now = new Date();
    const userMessage = {
      role: "user",
      text: input,
      timestamp: now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, userMessage]);

    const userInput = input;
    setInput("");

    const botResponse = await mockApi(userInput);
    setMessages((prev) => [...prev, { role: "bot", text: botResponse.reply }]);
  };

  const mockApi = async (inputText) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          reply: `"${inputText}"에 대한 응답입니다.`,
        });
      }, 1000);
    });
  };

  return (
    <div className="dashboard">
      <div className="chat-container">
        <div className="message-list">
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.role}`}>
              <div className="bubble">{msg.text}</div>
              <div className="timestamp"> {msg.timestamp}</div>
              <div ref={messagesEndRef} />
            </div>
          ))}
        </div>

        {/* ✅ form 태그로 전송 처리 */}
        <form className="chat-input" onSubmit={handleSend}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="메시지를 입력하세요"
          />
          <button onClick={handleSend} disabled={!input.trim()}>
            <img
              src="/assets/icons/icon-send.svg"
              alt="Send"
              className="send-icon"
            />
          </button>{" "}
        </form>
      </div>
    </div>
  );
};

export default Dashboard;
