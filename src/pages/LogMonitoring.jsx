import React, { useState, useEffect, useRef } from "react";
import "../styles/css/LogMonitoring.css";
import { Pause, Play } from "lucide-react";

const mockLogs = [
  "[INFO] 서버가 시작되었습니다.",
  "[WARN] 메모리 사용량 증가 감지",
  "[ERROR] 데이터베이스 연결 실패",
  "[INFO] 요청이 정상 처리되었습니다.",
];

function LogMonitoring() {
  const [logs, setLogs] = useState([]);
  const [isStreaming, setIsStreaming] = useState(true);
  const [filterLevel, setFilterLevel] = useState("ALL");
  const logEndRef = useRef(null);

  // 실제 API 요청
  // const fetchLogs = async () => {
  //   try {
  //     const res = await fetch("/logging/live");
  //     if (!res.ok) throw new Error("로그 로딩 실패");
  //     const data = await res.json();
  //     setLogs(data);
  //   } catch (err) {
  //     console.error("로그 가져오기 실패:", err);
  //   }
  // };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isStreaming) return;

      // 모의 로그 추가
      setLogs((prev) => {
        const nextLog = mockLogs[Math.floor(Math.random() * mockLogs.length)];
        return [...prev, nextLog];
      });

      // 실제 API 요청
      // fetchLogs();
    }, 2000);

    return () => clearInterval(interval);
  }, [isStreaming]);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  const filteredLogs = logs.filter((log) => {
    if (filterLevel === "ALL") return true;
    return log.includes(filterLevel);
  });

  return (
    <div className="log-monitoring-container">
      <h1 className="log-title">CLI 로그 모니터링</h1>

      <div className="log-controls">
        <button
          onClick={() => setIsStreaming((prev) => !prev)}
          className="toggle-button"
        >
          {isStreaming ? (
            <>
              <Pause size={16} /> 일시정지
            </>
          ) : (
            <>
              <Play size={16} /> 재시작
            </>
          )}
        </button>

        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          className="filter-select"
        >
          <option value="ALL">전체</option>
          <option value="INFO">INFO</option>
          <option value="WARN">WARN</option>
          <option value="ERROR">ERROR</option>
        </select>
      </div>

      <div className="log-viewer">
        {filteredLogs.map((log, i) => (
          <div
            key={i}
            className={
              log.includes("ERROR")
                ? "log-entry error"
                : log.includes("WARN")
                ? "log-entry warn"
                : "log-entry info"
            }
          >
            {log}
          </div>
        ))}
        {/* 자동 스크롤 대상 */}
        <div ref={logEndRef} />
      </div>
    </div>
  );
}

export default LogMonitoring;
