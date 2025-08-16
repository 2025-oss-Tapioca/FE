import React, { useState, useEffect } from "react";
import "../../styles/css/serverButton.css";

export default function ServerButton({ label, url, defaultConnected = false }) {
  const [connected, setConnected] = useState(defaultConnected);

  useEffect(() => {
    setConnected(defaultConnected);
  }, [defaultConnected]);

  // const handleToggle = (e) => {
  //   e.stopPropagation(); // 버튼 전체 클릭 방지
  //   setConnected((prev) => !prev);

  //   // TODO: 연결 상태에 따른 API 호출 or 서버 ping 등 처리하고 싶다면 여기서 가능
  //   // ex) await toggleServerConnection(url)
  // };

  return (
    <button
      className={`server ${connected ? "connected" : "disconnected"}`}
      title={url}
    >
      <div className="light" />
      <span className="label">{label}</span>
    </button>
  );
}
