import React, { useState, useRef, useEffect } from "react";
import "../styles/css/Dashboard.css";
import { usePostPrompt } from "../api/hooks/dashBoard"; // 1. 훅을 import 합니다.
import { useParams } from "react-router-dom";

const Dashboard = ({ setActiveTab, setSpecData, setTrafficData }) => {
  const handlePerformanceTest = () => {
    // 예시용 가짜 데이터
    const specData = {
      method: "GET",
      url: "https://api.example.com/users",
      specData: {
        latencies: {
          total: 556136200,
          mean: 37075746,
          "50th": 30709700,
          "95th": 99441250,
          max: 116905200,
        },
        duration: 4666624600,
        throughput: 3.188636956336336,
        successRatio: "100.00%",
        statusCodes: {
          200: 15,
        },
      },
    };

    const trafficData = {
      method: "GET",
      url: "https://api.example.com/users",
      requests: 15,
      bytes: {
        in: {
          total: 585,
          mean: 39,
        },
        out: {
          total: 0,
          mean: 0,
        },
      },
    };

    setSpecData(specData);
    setTrafficData(trafficData);
    setActiveTab("성능 테스트");
  };

  // // 임시 데이터 (실제 API 호출로 대체 예정)
  // const [specData] = useState({
  //   method: "GET",
  //   url: "https://api.example.com/users",
  //   specData: {
  //     latencies: {
  //       total: 556136200,
  //       mean: 37075746,
  //       "50th": 30709700,
  //       "95th": 99441250,
  //       max: 116905200,
  //     },
  //     duration: 4666624600,
  //     throughput: 3.188636956336336,
  //     successRatio: "100.00%",
  //     statusCodes: {
  //       200: 15,
  //     },
  //   },
  // });

  // //  "type": "traffic_test_result" (raw 데이터 이용)
  // const [trafficData] = useState({
  //   method: "GET",
  //   url: "https://api.example.com/users",
  //   requests: 15,
  //   bytes: {
  //     in: {
  //       total: 585,
  //       mean: 39,
  //     },
  //     out: {
  //       total: 0,
  //       mean: 0,
  //     },
  //   },
  // });

  const [messages, setMessages] = useState([
    { role: "bot", text: "안녕하세요! 무엇을 도와드릴까요?" },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const params = useParams();
  const teamCode = params.teamCode;
  const inputRef = useRef(null);

  // 2. useSendMessage 훅을 호출하고, mutate 함수와 로딩 상태(isPending)를 가져옵니다.
  const { mutate: postPrompt, isPending } = usePostPrompt();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || isPending) return; // 로딩 중일 때는 전송 방지

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

    // 3. mutate 함수를 호출하여 API 요청을 보냅니다.
    postPrompt(
      {
        team_code: teamCode, // 팀 코드 전달",
        prompt: userInput, // 사용자 입력 전달
      },
      {
        onSuccess: (response) => {
          // 4. API 요청 성공 시, 받은 응답으로 봇 메시지를 추가합니다.
          //    서버 응답이 { reply: "..." } 형태라고 가정합니다.
          const botResponse = {
            role: "bot",
            text: response.output,
          };
          setMessages((prev) => [...prev, botResponse]);
        },
        onError: (error) => {
          // 5. API 요청 실패 시, 에러 메시지를 표시합니다.
          console.error("메시지 전송 실패:", error);
          const errorMessage = {
            role: "bot",
            text: "죄송합니다. 메시지 처리에 실패했습니다.",
          };
          setMessages((prev) => [...prev, errorMessage]);
        },
      }
    );
    if (inputRef.current) {
      inputRef.current.style.height = "48px";
    }
  };

  return (
    <div className="dashboard">
      <div className="chat-container">
        <div className="message-list">
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.role}`}>
              <div className="bubble">{msg.text}</div>
              <div className="timestamp">{msg.timestamp}</div>
            </div>
          ))}
          {isPending && (
            <div className="message bot">
              <div className="bubble">...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 임시 버튼 */}
        <div className="chat-actions">
          <button
            className="chat-action-button"
            onClick={handlePerformanceTest}
            disabled={isPending}
          >
            📊 성능 테스트 이동
          </button>
        </div>

        <form className="chat-input" onSubmit={handleSend}>
          <textarea
            value={input}
            ref={inputRef}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isPending ? "응답을 기다리는 중..." : "메시지를 입력하세요"
            }
            disabled={isPending}
            rows={1}
            style={{ overflow: "hidden", resize: "none" }}
            onInput={(e) => {
              const textarea = e.target;
              textarea.style.height = "auto";

              const maxHeight = 4 * 24;
              const newHeight = Math.min(textarea.scrollHeight, maxHeight);

              textarea.style.height = `${newHeight}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
          />
          <button type="submit" disabled={!input.trim() || isPending}>
            <img
              src="/assets/icons/icon-send.svg"
              alt="Send"
              className="send-icon"
            />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;
