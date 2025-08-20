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

    setSpecData(console.log("성능 또 다시 보여줘야돼", specData,), specData);
    setTrafficData(console.log("트래픽 또 다시 보여줘야돼", trafficData,), trafficData);
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
    { role: "bot", type: "text", content: "안녕하세요! 무엇을 도와드릴까요?" },
  ]);

  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const params = useParams();
  const teamCode = params.teamCode;
  const inputRef = useRef(null);
  // ✅ 팀코드 기반 저장된 메시지 불러오기
  const STORAGE_KEY = `chat_messages_${teamCode}`;

  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return saved
      ? JSON.parse(saved)
      : [{ role: "bot", text: "안녕하세요! 무엇을 도와드릴까요?" }];
  });

  // 2. useSendMessage 훅을 호출하고, mutate 함수와 로딩 상태(isPending)를 가져옵니다.
  const { mutate: postPrompt, isPending } = usePostPrompt();

  // const scrollToBottom = () => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  // };

  // ✅ 메시지 저장
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages, STORAGE_KEY]);

  // ✅ 스크롤 항상 아래로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleNavigateToTest = (data) => {

    console.log('--- handleNavigateToTest ---');
    console.log('SpecData로 설정될 데이터:', data.specData);
    console.log('TrafficData로 설정될 데이터:', data.trafficData);
    console.log('-----------------------------');
    // specData가 있으면 상태를 업데이트하고, 없으면 null로 설정합니다.
    setSpecData(data.specData || null);
    // trafficData가 있으면 상태를 업데이트하고, 없으면 null로 설정합니다.
    setTrafficData(data.trafficData || null);

    setActiveTab("성능 테스트");
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || isPending) return; // 로딩 중일 때는 전송 방지

    const now = new Date();
    const userMessage = {
      role: "user",
      type: "text",
      content: input,
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
      { team_code: teamCode, prompt: userInput },
      {
        onSuccess: (response) => {
          const resultsArray = response.output.results || (response.output ? [response.output] : []);

          // 2. spec 또는 traffic 결과를 찾습니다. 둘 중 하나만 있을 수도 있습니다.
          const specResult = resultsArray.find(r => r.testType === 'spec');
          const trafficResult = resultsArray.find(r => r.testType === 'traffic');

          // 3. 둘 중 하나라도 결과가 있다면 버튼 메시지를 생성합니다.
          if (specResult || trafficResult) {
            const botResponse = {
              role: 'bot',
              type: 'performance_test_button',
              content: {
                specData: specResult,
                trafficData: trafficResult
              }
            };
            setMessages(prev => [...prev, botResponse]);
          } else {
            // 둘 다 없다면 일반 텍스트 메시지로 처리
            const botResponse = {
              role: 'bot',
              type: 'text',
              content: response.output || "결과를 이해할 수 없습니다."
            };
            setMessages(prev => [...prev, botResponse]);
          }
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
              <div className="bubble">
                {msg.type === 'text' ? (
                  msg.content
                ) : msg.type === 'performance_test_button' ? (
                  <button
                    className="chat-action-button"
                    onClick={() => handleNavigateToTest(msg.content)}
                  >
                    📊 테스트 결과 보기
                  </button>
                ) : null}
              </div>
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
