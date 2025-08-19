import React, { useState, useEffect, useRef } from "react";
import { ReadyState } from "react-use-websocket";
import "../styles/css/LogMonitoring.css";
import { Pause, Play } from "lucide-react";
import { usePostLogMonitoring } from '../api/hooks/logMonitoring';
import { useParams } from "react-router-dom";

// 2. 컴포넌트는 이제 어떤 로그를 보여줄지 props로 받습니다.
export default function LogMonitoring( { sourceType = "frontend" }) {
  // 3. useLogStream 훅을 호출하여 실시간 로그 데이터와 연결 상태를 가져옵니다.
  const params = useParams();
  const teamCode = params.teamCode; // URL 파라미터에서 팀 코드를 가져옵니다.
  const { mutate: requestRegistration } = usePostLogMonitoring();
  // console.log("Current WebSocket ReadyState:", connectionStatus);
  // console.log('Received WebSocket Message:', logs);

  // '일시정지'는 데이터 수신을 멈추는게 아닌, 자동 스크롤을 멈추는 기능으로 변경합니다.
  const [isPaused, setIsPaused] = useState(false);
  const [filterLevel, setFilterLevel] = useState("ALL");
  const logEndRef = useRef(null);

  // 4. 자동 스크롤 로직: 일시정지 상태가 아닐 때만 맨 아래로 스크롤합니다.
  // useEffect(() => {
  //   if (!isPaused && logEndRef.current) {
  //     logEndRef.current.scrollIntoView({ behavior: "smooth" });
  //   }
  // }, [logs, isPaused]); // logs나 isPaused 상태가 바뀔 때마다 실행

  // 5. 필터링 로직: 이제 로그는 객체이므로, log.level을 기준으로 필터링합니다.
  // const filteredLogs = logs.filter((log) => {
  //   if (log.type === 'system' || log.type === 'system-error') return true; // 시스템 메시지는 항상 표시
  //   if (filterLevel === "ALL") return true;
  //   return log.level?.toUpperCase() === filterLevel;
  // });

  // WebSocket 연결 상태를 텍스트로 변환합니다.
  // const connectionStatusText = {
  //   [ReadyState.CONNECTING]: '연결 중...',
  //   [ReadyState.OPEN]: '연결됨',
  //   [ReadyState.CLOSING]: '종료 중...',
  //   [ReadyState.CLOSED]: '연결 끊김',
  //   [ReadyState.UNINSTANTIATED]: '준비 안됨', // 👈 이 부분이 빠졌을 가능성이 높습니다.
  // }[connectionStatus] || '준비 안됨';

  const handleStart = (sourceType) => {
    requestRegistration({ sourceType, teamCode }, {
      onSuccess: () => {
        // 2. 신호 보내기가 성공하면, 부모 컴포넌트에게 알려줍니다.
      },
    });

    setIsPaused((prev) => !prev)

  };

  // 로그 레벨에 따라 다른 CSS 클래스를 부여하는 헬퍼 함수
  const getLogLevelClass = (level) => {
    switch (level?.toUpperCase()) {
      case 'ERROR': return 'log-entry error';
      case 'WARN': return 'log-entry warn';
      case 'INFO': return 'log-entry info';
      default: return 'log-entry debug';
    }
  };

  return (
    <div className="log-monitoring-container">
      <h1 className="log-title">
        CLI 로그 모니터링 ({sourceType} - {teamCode})
        <span className="connection-status">()</span>
      </h1>

      <div className="log-controls">
        <button
          onClick={() => handleStart('BACKEND')
            }
          className="toggle-button"
        >
          {isPaused ? (
            <> <Play size={16} /> 자동 스크롤 재시작 </>
          ) : (
            <> <Pause size={16} /> 자동 스크롤 일시정지 </>
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

      <pre className="log-viewer">
        {/* {filteredLogs.map((log, i) => (
          // 6. 구조화된 로그 객체의 각 필드를 렌더링합니다.
          <div key={i} className={getLogLevelClass(log.level)}>
            {log.type === 'system' || log.type === 'system-error' ? (
              <span className="log-message">{log.message}</span>
            ) : (
              <>
                <span className="log-timestamp">{new Date(log.timestamp).toLocaleString()}</span>
                <span className="log-level">{log.level}</span>
                <span className="log-service">[{log.service || '-'}]</span>
                <span className="log-message">{log.message}</span>
              </>
            )}
          </div>
        ))} */}
        {/* 자동 스크롤의 기준점이 될 빈 div */}
        <div ref={logEndRef} />
      </pre>
    </div>
  );
}