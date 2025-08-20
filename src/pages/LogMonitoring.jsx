// import React, { useState, useEffect, useRef } from "react";
// import "../styles/css/LogMonitoring.css";
// import { Pause, Play } from "lucide-react";

// const mockLogs = [
//   "[INFO] 서버가 시작되었습니다.",
//   "[WARN] 메모리 사용량 증가 감지",
//   "[ERROR] 데이터베이스 연결 실패",
//   "[INFO] 요청이 정상 처리되었습니다.",
// ];

// function LogMonitoring() {
//   const [logs, setLogs] = useState([]);
//   const [isStreaming, setIsStreaming] = useState(true);
//   const [filterLevel, setFilterLevel] = useState("ALL");
//   const logEndRef = useRef(null);

//   // 실제 API 요청
//   // const fetchLogs = async () => {
//   //   try {
//   //     const res = await fetch("/logging/live");
//   //     if (!res.ok) throw new Error("로그 로딩 실패");
//   //     const data = await res.json();
//   //     setLogs(data);
//   //   } catch (err) {
//   //     console.error("로그 가져오기 실패:", err);
//   //   }
//   // };

//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (!isStreaming) return;

//       // 모의 로그 추가
//       setLogs((prev) => {
//         const nextLog = mockLogs[Math.floor(Math.random() * mockLogs.length)];
//         return [...prev, nextLog];
//       });

//       // 실제 API 요청
//       // fetchLogs();
//     }, 2000);

//     return () => clearInterval(interval);
//   }, [isStreaming]);

//   useEffect(() => {
//     if (logEndRef.current) {
//       logEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [logs]);

//   const filteredLogs = logs.filter((log) => {
//     if (filterLevel === "ALL") return true;
//     return log.includes(filterLevel);
//   });

//   return (
//     <div className="log-monitoring-container">
//       <h1 className="log-title">CLI 로그 모니터링</h1>

//       <div className="log-controls">
//         <button
//           onClick={() => setIsStreaming((prev) => !prev)}
//           className="toggle-button"
//         >
//           {isStreaming ? (
//             <>
//               <Pause size={16} /> 일시정지
//             </>
//           ) : (
//             <>
//               <Play size={16} /> 재시작
//             </>
//           )}
//         </button>

//         <select
//           value={filterLevel}
//           onChange={(e) => setFilterLevel(e.target.value)}
//           className="filter-select"
//         >
//           <option value="ALL">전체</option>
//           <option value="INFO">INFO</option>
//           <option value="WARN">WARN</option>
//           <option value="ERROR">ERROR</option>
//         </select>
//       </div>

//       <div className="log-viewer">
//         {filteredLogs.map((log, i) => (
//           <div
//             key={i}
//             className={
//               log.includes("ERROR")
//                 ? "log-entry error"
//                 : log.includes("WARN")
//                 ? "log-entry warn"
//                 : "log-entry info"
//             }
//           >
//             {log}
//           </div>
//         ))}
//         {/* 자동 스크롤 대상 */}
//         <div ref={logEndRef} />
//       </div>
//     </div>
//   );
// }

// export default LogMonitoring;
// src/pages/LogMonitoring.jsx (또는 현재 경로 유지)
// 기존 파일 전체 교체본
import React, { useEffect, useMemo, useRef, useState } from "react";
import "../styles/css/LogMonitoring.css";
import { Pause, Play } from "lucide-react";

// ✅ 네가 만든 훅/REST 래퍼
import useLogSocket from "@/api/hooks/log";
import { registerLog, queryStatus } from "@/api/apis/log";

// 레벨 옵션
const LEVELS = ["ALL", "INFO", "WARN", "ERROR"];

// 화면에 표시할 한 줄을 문자열로 포맷 (기존 스타일 유지)
function formatLine(row) {
  // row: { time, level, service, message }
  // 기존 컴포넌트는 문자열 배열을 썼으므로 같은 스타일로 출력
  return `[${row.level}] ${row.service || "-"} — ${row.message}`;
}

export default function LogMonitoring({ teamCode, defaultSource = "BACKEND" }) {
  // 🔧 필요하면 상단 상태/입력으로 컨트롤
  const [sourceType, setSourceType] = useState(defaultSource); // FRONTEND | RDS

  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");

  const canConnect = !!teamCode;

  const [filterLevel, setFilterLevel] = useState("ALL");
  const [isStreaming, setIsStreaming] = useState(true); // 일시정지/재시작

  // 컴포넌트 내부
  const [statusActive, setStatusActive] = useState(null); // true | false | null
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState(null);

  useEffect(() => {
    if (!teamCode || !sourceType) {
      setStatusActive(null);
      setStatusError(null);
      setStatusLoading(false);
      return;
    }

    let stop = false;
    const tick = async () => {
      // 첫 로딩에만 로딩 표시
      setStatusLoading((prev) => (statusActive === null ? true : prev));
      try {
        const { data } = await queryStatus(sourceType, teamCode);
        if (stop) return;
        setStatusActive(!!data?.active); // true면 "수집 중", false면 "대기"
        setStatusError(null);
      } catch (err) {
        if (stop) return;
        const code = err?.response?.data?.code;
        if (code === "40710") {
          // 서버 약속: 수집 미시작
          setStatusActive(false);
          setStatusError(null);
        } else {
          setStatusError("error");
        }
      } finally {
        if (!stop) setStatusLoading(false);
      }
    };

    tick(); // 즉시 한 번
    const id = setInterval(tick, 15000); // 15초마다
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, [teamCode, sourceType]);

  const StatusBadge = ({ active, loading, error }) => {
    let label = "대기";
    let cls = "bg-zinc-600";
    if (loading) {
      label = "확인중";
      cls = "bg-gray-500";
    } else if (error) {
      label = "오류";
      cls = "bg-red-600";
    } else if (active === true) {
      label = "수집 중";
      cls = "bg-green-600";
    }

    return (
      <span
        className={`inline-flex items-center px-2 py-1 text-xs text-white rounded-full ${cls}`}
        title="수집 상태"
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: 9999,
            background: "currentColor",
            marginRight: 6,
          }}
        />
        {label}
      </span>
    );
  };

  // WS 훅: rows는 [{time, level, service, message}, ...] 최신이 앞
  const {
    status,
    rows,
    lastError,
    requestRange,
    requestLevelContext,
    reconnect,
    disconnect,
  } = useLogSocket({ teamCode: canConnect ? teamCode : undefined, sourceType });

  const isWsOpen = status === 'open';

  // ⏸ 일시정지를 구현하기 위해 "스냅샷"을 따로 유지
  const [snapshotRows, setSnapshotRows] = useState([]);
  useEffect(() => {
    if (isStreaming) {
      setSnapshotRows(rows);
    }
  }, [rows, isStreaming]);

  // 현재 렌더 대상: 스트리밍 중이면 rows, 일시정지면 snapshotRows
  const activeRows = isStreaming ? rows : snapshotRows;

  // 레벨 필터
  const filteredRows = useMemo(() => {
    if (filterLevel === "ALL") return activeRows;
    return activeRows.filter((r) => r.level === filterLevel);
  }, [activeRows, filterLevel]);

  // 문자열로 변환 (기존 렌더 구조 유지)
  const filteredLogs = useMemo(
    () => filteredRows.map(formatLine),
    [filteredRows]
  );

  // 자동 스크롤
  const logEndRef = useRef(null);
  useEffect(() => {
    if (logEndRef.current && isStreaming) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [filteredLogs, isStreaming]);

  // REST: 수집 시작 트리거
  const onStartCollect = async () => {
    try {
      await registerLog(sourceType, teamCode);  // 1) HTTP 등록
      reconnect();                              // 2) WS 연결
    } catch (e) {
      alert('수집 시작 실패: ' + (e?.response?.data?.message || e.message));
    }
  };

  // REST: 상태
  const onCheckStatus = async () => {
    try {
      const res = await queryStatus(sourceType, teamCode);
      alert("active: " + (res?.data?.active ? "true" : "false"));
    } catch {
      alert("상태 조회 실패");
    }
  };

  return (
    <div className="log-monitoring-container">
      <h1 className="log-title">CLI 로그 모니터링</h1>

      {/* 상단 컨트롤 */}
      <div className="log-controls" style={{ gap: 8, flexWrap: "wrap" }}>
        <select
          value={sourceType}
          onChange={(e) => setSourceType(e.target.value)}
          className="filter-select"
          title="소스타입"
        >
          <option>BACKEND</option>
          <option>FRONTEND</option>
          <option>RDS</option>
        </select>

        <span className="filter-select">
          팀: <b>{teamCode || "-"}</b>
        </span>

        <button className="toggle-button" onClick={onStartCollect}>
          수집 시작(REST)
        </button>
        <StatusBadge
          active={statusActive}
          loading={statusLoading}
          error={statusError}
        />

        <button
          onClick={reconnect}
          className="toggle-button"
          disabled={!teamCode}
        >
          WS 연결/재연결
        </button>
        <button
          onClick={disconnect}
          className="toggle-button"
          disabled={status !== "open"}
        >
          WS 끊기
        </button>

        <button
          onClick={() => setIsStreaming((prev) => !prev)}
          className="toggle-button"
          title="일시정지/재시작"
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
          title="레벨 필터"
        >
          {LEVELS.map((lv) => (
            <option key={lv} value={lv}>
              {lv}
            </option>
          ))}
        </select>
      </div>

      {/* 상태/에러 표시 */}
      <div className="text-sm" style={{ marginBottom: 8 }}>
        <b>WS 상태:</b> {status}
        {lastError ? ` | 에러: [${lastError.code}] ${lastError.message}` : ""}
      </div>

      {/* 로그 뷰어 */}
      <div className="log-viewer">
        {filteredRows.map((row, i) => (
          <div
            key={i}
            className={
              row.level === "ERROR"
                ? "log-entry error"
                : row.level === "WARN"
                ? "log-entry warn"
                : "log-entry info"
            }
            title={row.time} // hover 시 로컬시간 확인
          >
            {formatLine(row)}
          </div>
        ))}
        <div ref={logEndRef} />
      </div>

      {/* (선택) 하단 빠른 조회 버튼 - WS 쿼리 */}
      <div
        className="log-controls"
        style={{ marginTop: 8, gap: 8, flexWrap: "wrap" }}
      >
        <label className="date-range-label">
          <span style={{ margin: '0 8px' }}>시작 :</span>
          <input
            type="datetime-local"
            value={rangeStart}
            onChange={e => setRangeStart(e.target.value)}
          />
          <span style={{ margin: '0 8px' }}>종료 :</span>
          <input
            type="datetime-local"
            value={rangeEnd}
            onChange={e => setRangeEnd(e.target.value)}
          />
        </label>

        <button className="toggle-button" onClick={() => requestRange(rangeStart, rangeEnd)} disabled={!isWsOpen}>
          범위 조회(WS)
        </button>
        <button
          className="toggle-button"
          onClick={() => requestLevelContext("ERROR", 50)}
        >
          ERROR 컨텍스트(WS)
        </button>
      </div>
    </div>
  );
}
