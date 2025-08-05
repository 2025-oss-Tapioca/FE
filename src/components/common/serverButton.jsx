import React, { useState } from "react";
import "../../styles/css/serverButton.css";

export default function ServerButton({ label }) {
  const [connected, setConnected] = useState(false); // 초기 false

  const handleToggle = (e) => {
    e.stopPropagation(); // 버튼 전체 클릭 방지
    setConnected((prev) => !prev); // true/false 토글
  };

  return (
    <button className={`server ${connected ? "connected" : "disconnected"}`}>
      <div className="light"></div>
      <span>{label}</span>
      <span className="connect-button" onClick={handleToggle}>
        연결 {connected ? "해제" : ""}
      </span>
    </button>
  );
}
