// LogMonitoring.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import "../styles/css/LogMonitoring.css";
import { Pause, Play } from "lucide-react";

// 실제 WS 훅/REST (기능 유지)
import useLogSocket from "@/api/hooks/log";
import { registerLog } from "@/api/apis/log";

/** 레벨 필터 옵션 (DEBUG 포함) */
const LEVELS = ["ALL", "ERROR", "WARN", "INFO", "DEBUG"];

/** 사용자가 보낸 RAW 로그 텍스트(그대로) */
const SAMPLE_TEXT = `2025-08-20T15:52:42.889Z ERROR 7 --- [MCPBE] [nio-8080-exec-7] c.t.M.exception.GlobalExceptionHandler   : handleException() in GlobalExceptionHandle throw Exception: No static resource privkey.pem.

org.springframework.web.servlet.resource.NoResourceFoundException: No static resource privkey.pem.
        at org.springframework.web.servlet.resource.ResourceHttpRequestHandler.handleRequest(ResourceHttpRequestHandler.java:585) ~[spring-webmvc-6.2.8.jar!/:6.2.8]
        at org.springframework.web.servlet.mvc.HttpRequestHandlerAdapter.handle(HttpRequestHandlerAdapter.java:52) ~[spring-webmvc-6.2.8.jar!/:6.2.8]
        at org.springframework.web.servlet.DispatcherServlet.doDispatch(DispatcherServlet.java:1089) ~[spring-webmvc-6.2.8.jar!/:6.2.8]
        at org.springframework.web.servlet.DispatcherServlet.doService(DispatcherServlet.java:979) ~[spring-webmvc-6.2.8.jar!/:6.2.8]
        at org.springframework.web.servlet.FrameworkServlet.processRequest(FrameworkServlet.java:1014) ~[spring-web-6.2.8.jar!/:6.2.8]
        at org.springframework.web.servlet.FrameworkServlet.doGet(FrameworkServlet.java:903) ~[spring-webmvc-6.2.8.jar!/:6.2.8]
        at jakarta.servlet.http.HttpServlet.service(HttpServlet.java:564) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.servlet.FrameworkServlet.service(FrameworkServlet.java:885) ~[spring-webmvc-6.2.8.jar!/:6.2.8]
        at jakarta.servlet.http.HttpServlet.service(HttpServlet.java:658) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:195) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:140) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.apache.tomcat.websocket.server.WsFilter.doFilter(WsFilter.java:51) ~[tomcat-embed-websocket-10.1.42.jar!/:na]
        at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:164) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:140) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.filter.RequestContextFilter.doFilterInternal(RequestContextFilter.java:100) ~[spring-web-6.2.8.jar!/:6.2.8]
        at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.2.8.jar!/:6.2.8]
        at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:164) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:140) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.filter.FormContentFilter.doFilterInternal(FormContentFilter.java:93) ~[spring-web-6.2.8.jar!/:6.2.8]
        at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.2.8.jar!/:6.2.8]
        at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:164) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:140) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.filter.CharacterEncodingFilter.doFilterInternal(CharacterEncodingFilter.java:201) ~[spring-web-6.2.8.jar!/:6.2.8]
        at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.2.8.jar!/:6.2.8]
        at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:164) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:140) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.servlet.StandardWrapperValve.invoke(StandardWrapperValve.java:167) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.servlet.StandardContextValve.invoke(StandardContextValve.java:90) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.servlet.authenticator.AuthenticatorBase.invoke(AuthenticatorBase.java:483) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.servlet.StandardHostValve.invoke(StandardHostValve.java:116) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.servlet.valves.ErrorReportValve.invoke(ErrorReportValve.java:93) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.servlet.StandardEngineValve.invoke(StandardEngineValve.java:74) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.servlet.connector.CoyoteAdapter.service(CoyoteAdapter.java:344) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.servlet.coyote.http11.Http11Processor.service(Http11Processor.java:398) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.servlet.AbstractProcessorLight.process(AbstractProcessorLight.java:63) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.servlet.AbstractProtocol$ConnectionHandler.process(AbstractProtocol.java:903) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.servlet.util.net.NioEndpoint$SocketProcessor.doRun(NioEndpoint.java:1769) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.servlet.util.net.SocketProcessorBase.run(SocketProcessorBase.java:52) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.servlet.util.threads.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1189) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.servlet.util.threads.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:658) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.servlet.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:63) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at java.base/java.lang.Thread.run(Unknown Source) ~[na:na]

2025-08-20T15:52:43.505Z ERROR 7 --- [MCPBE] [nio-8080-exec-8] c.t.M.exception.GlobalExceptionHandler   : handleException() in GlobalExceptionHandle throw Exception: No static resource privkey.pem.

org.springframework.web.servlet.resource.NoResourceFoundException: No static resource privkey.pem.
        at org.springframework.web.servlet.resource.ResourceHttpRequestHandler.handleRequest(ResourceHttpRequestHandler.java:585) ~[spring-webmvc-6.2.8.jar!/:6.2.8]
        at org.springframework.web.servlet.mvc.HttpRequestHandlerAdapter.handle(HttpRequestHandlerAdapter.java:52) ~[spring-webmvc-6.2.8.jar!/:6.2.8]
        at org.springframework.web.servlet.DispatcherServlet.doDispatch(DispatcherServlet.java:1089) ~[spring-webmvc-6.2.8.jar!/:6.2.8]
        at org.springframework.web.servlet.DispatcherServlet.doService(DispatcherServlet.java:979) ~[spring-webmvc-6.2.8.jar!/:6.2.8]
        at org.springframework.web.servlet.FrameworkServlet.processRequest(FrameworkServlet.java:1014) ~[spring-web-6.2.8.jar!/:6.2.8]
        at org.springframework.web.servlet.FrameworkServlet.doGet(FrameworkServlet.java:903) ~[spring-webmvc-6.2.8.jar!/:6.2.8]
        at jakarta.servlet.http.HttpServlet.service(HttpServlet.java:564) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.servlet.FrameworkServlet.service(FrameworkServlet.java:885) ~[spring-webmvc-6.2.8.jar!/:6.2.8]
        at jakarta.servlet.http.HttpServlet.service(HttpServlet.java:658) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:195) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:140) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.apache.tomcat.websocket.server.WsFilter.doFilter(WsFilter.java:51) ~[tomcat-embed-websocket-10.1.42.jar!/:na]
        at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:164) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:140) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.filter.RequestContextFilter.doFilterInternal(RequestContextFilter.java:100) ~[spring-web-6.2.8.jar!/:6.2.8]
        at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.2.8.jar!/:6.2.8]
        at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:164) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:140) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.filter.CharacterEncodingFilter.doFilterInternal(CharacterEncodingFilter.java:201) ~[spring-web-6.2.8.jar!/:6.2.8]
        at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.2.8.jar!/:6.2.8]
        at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:164) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:140) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.servlet.StandardWrapperValve.invoke(StandardWrapperValve.java:167) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.servlet.StandardContextValve.invoke(StandardContextValve.java:90) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.servlet.authenticator.AuthenticatorBase.invoke(AuthenticatorBase.java:483) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.servlet.StandardHostValve.invoke(StandardHostValve.java:116) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.servlet.valves.ErrorReportValve.invoke(ErrorReportValve.java:93) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.servlet.StandardEngineValve.invoke(StandardEngineValve.java:74) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.servlet.connector.CoyoteAdapter.service(CoyoteAdapter.java:344) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.servlet.coyote.http11.Http11Processor.service(Http11Processor.java:398) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.servlet.AbstractProcessorLight.process(AbstractProcessorLight.java:63) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.servlet.AbstractProtocol$ConnectionHandler.process(AbstractProtocol.java:903) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.servlet.util.net.NioEndpoint$SocketProcessor.doRun(NioEndpoint.java:1769) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.servlet.util.net.SocketProcessorBase.run(SocketProcessorBase.java:52) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.servlet.util.threads.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1189) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.servlet.util.threads.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:658) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.servlet.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:63) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at java.base/java.lang.Thread.run(Unknown Source) ~[na:na]

2025-08-20T15:52:44.031Z ERROR 7 --- [MCPBE] [nio-8080-exec-9] c.t.M.exception.GlobalExceptionHandler   : handleException() in GlobalExceptionHandle throw Exception: No static resource privkey.pem.

org.springframework.web.servlet.resource.NoResourceFoundException: No static resource privkey.pem.
        at org.springframework.web.servlet.resource.ResourceHttpRequestHandler.handleRequest(ResourceHttpRequestHandler.java:585) ~[spring-webmvc-6.2.8.jar!/:6.2.8]
        at org.springframework.web.servlet.mvc.HttpRequestHandlerAdapter.handle(HttpRequestHandlerAdapter.java:52) ~[spring-webmvc-6.2.8.jar!/:6.2.8]
        at org.springframework.web.servlet.DispatcherServlet.doDispatch(DispatcherServlet.java:1089) ~[spring-webmvc-6.2.8.jar!/:6.2.8]
        at org.springframework.web.servlet.DispatcherServlet.doService(DispatcherServlet.java:979) ~[spring-webmvc-6.2.8.jar!/:6.2.8]
        at org.springframework.web.servlet.FrameworkServlet.processRequest(FrameworkServlet.java:1014) ~[spring-web-6.2.8.jar!/:6.2.8]
        at org.springframework.web.servlet.FrameworkServlet.doGet(FrameworkServlet.java:903) ~[spring-webmvc-6.2.8.jar!/:6.2.8]
        at jakarta.servlet.http.HttpServlet.service(HttpServlet.java:564) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.servlet.FrameworkServlet.service(FrameworkServlet.java:885) ~[spring-webmvc-6.2.8.jar!/:6.2.8]
        at jakarta.servlet.http.HttpServlet.service(HttpServlet.java:658) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:195) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:140) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.apache.tomcat.websocket.server.WsFilter.doFilter(WsFilter.java:51) ~[tomcat-embed-websocket-10.1.42.jar!/:na]
        at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:164) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:140) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.filter.RequestContextFilter.doFilterInternal(RequestContextFilter.java:100) ~[spring-web-6.2.8.jar!/:6.2.8]
        at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.2.8.jar!/:6.2.8]
        at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:164) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:140) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.filter.CharacterEncodingFilter.doFilterInternal(CharacterEncodingFilter.java:201) ~[spring-web-6.2.8.jar!/:6.2.8]
        at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.2.8.jar!/:6.2.8]
        at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:164) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:140) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.servlet.StandardWrapperValve.invoke(StandardWrapperValve.java:167) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.servlet.StandardContextValve.invoke(StandardContextValve.java:90) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.servlet.authenticator.AuthenticatorBase.invoke(AuthenticatorBase.java:483) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.servlet.StandardHostValve.invoke(StandardHostValve.java:116) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.servlet.valves.ErrorReportValve.invoke(ErrorReportValve.java:93) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.servlet.StandardEngineValve.invoke(StandardEngineValve.java:74) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.servlet.connector.CoyoteAdapter.service(CoyoteAdapter.java:344) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.servlet.coyote.http11.Http11Processor.service(Http11Processor.java:398) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.servlet.AbstractProcessorLight.process(AbstractProcessorLight.java:63) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.servlet.AbstractProtocol$ConnectionHandler.process(AbstractProtocol.java:903) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.servlet.util.net.NioEndpoint$SocketProcessor.doRun(NioEndpoint.java:1769) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.servlet.util.net.SocketProcessorBase.run(SocketProcessorBase.java:52) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.servlet.util.threads.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1189) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.servlet.util.threads.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:658) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at org.springframework.web.servlet.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:63) ~[tomcat-embed-core-10.1.42.jar!/:na]
        at java.base/java.lang.Thread.run(Unknown Source) ~[na:na]`;

/** 라인 배열로 변환 */
const SAMPLE_LINES = SAMPLE_TEXT.replace(/\r\n/g, "\n").split("\n");

/** 한 줄에서 레벨 추출 (없으면 이전 레벨 유지) */
const extractLevel = (line, fallback = "INFO") => {
  const m = line.match(/\b(ERROR|WARN|INFO|DEBUG)\b/);
  return m ? m[1] : fallback;
};

/** 기본 포맷터(WS 일반 로그용) */
function formatLine(row) {
  return `[${row.level}] ${row.service || "-"} — ${row.message}`;
}

export default function LogMonitoring({ teamCode, defaultSource = "BACKEND" }) {
  const [sourceType, setSourceType] = useState(defaultSource);
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [filterLevel, setFilterLevel] = useState("ALL");

  // (요청) 초기에는 "재시작"이 보이도록 일시정지 상태로 시작
  const [isStreaming, setIsStreaming] = useState(false);

  // WS 연결(기능 유지)
  const [wsTeamCode, setWsTeamCode] = useState(undefined);
  const { status, rows, lastError, requestRange, requestLevelContext, reconnect, disconnect } =
    useLogSocket({ teamCode: wsTeamCode, sourceType });
  const isWsOpen = status === "open";

  // 샘플(사용자 RAW 로그) 출력 모드
  const [showSample, setShowSample] = useState(false);
  const [sampleParts, setSampleParts] = useState([]); // [{text, level}]
  const sampleIdxRef = useRef(0);
  const sampleTimerRef = useRef(null);
  const lastLevelRef = useRef("INFO");

  // 재시작/일시정지 토글: "재시작"을 눌러야만 샘플 출력 시작
  const onToggleStream = () => {
    if (isStreaming) {
      // 일시정지
      setIsStreaming(false);
      return;
    }
    // 재시작(시작) 시: WS가 open 상태여야 함
    if (!isWsOpen) {
      alert('먼저 "수집 시작 & WS 연결"을 눌러 WebSocket을 연결하세요.');
      return;
    }
    // 샘플 모드 시작 초기화
    setShowSample(true);
    setSampleParts([]);
    sampleIdxRef.current = 0;
    lastLevelRef.current = "INFO";
    setIsStreaming(true);
  };

  // 샘플 라인 "촤르륵" 타이핑 효과
  useEffect(() => {
    if (!showSample) return;

    if (!isStreaming) {
      // 일시정지 시 타이머 정리
      if (sampleTimerRef.current) {
        clearInterval(sampleTimerRef.current);
        sampleTimerRef.current = null;
      }
      return;
    }

    if (sampleTimerRef.current) clearInterval(sampleTimerRef.current);
    sampleTimerRef.current = setInterval(() => {
      const i = sampleIdxRef.current;
      if (i >= SAMPLE_LINES.length) {
        clearInterval(sampleTimerRef.current);
        sampleTimerRef.current = null;
        return;
      }
      const line = SAMPLE_LINES[i];
      const level = extractLevel(line, lastLevelRef.current);
      lastLevelRef.current = level;
      setSampleParts(prev => [...prev, { text: line, level }]); // 아래에 이어 붙이기
      sampleIdxRef.current = i + 1;
    }, 14);

    return () => {
      if (sampleTimerRef.current) {
        clearInterval(sampleTimerRef.current);
        sampleTimerRef.current = null;
      }
    };
  }, [showSample, isStreaming]);

  // 기존 WS 로그(샘플 모드가 아닐 때만) + 필터
  const [snapshotRows, setSnapshotRows] = useState([]);
  useEffect(() => {
    if (isStreaming && !showSample) setSnapshotRows(rows);
  }, [rows, isStreaming, showSample]);

  const activeRows = showSample ? [] : isStreaming ? rows : snapshotRows;
  const filteredRows = useMemo(() => {
    if (showSample) return [];
    if (filterLevel === "ALL") return activeRows;
    return activeRows.filter(r => r.level === filterLevel);
  }, [activeRows, filterLevel, showSample]);

  // 자동 스크롤(샘플/일반 공통)
  const logEndRef = useRef(null);
  useEffect(() => {
    if (!logEndRef.current) return;
    logEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [sampleParts, filteredRows, isStreaming, showSample]);

  // WS 등록+연결 (기능 유지)
  const onStartCollect = async () => {
    if (!teamCode) return alert("팀이 선택되지 않았습니다.");
    try {
      await registerLog(sourceType, teamCode);
      setWsTeamCode(teamCode);
      reconnect();
    } catch (e) {
      alert("수집 시작 실패: " + (e?.response?.data?.message || e.message));
    }
  };

  const onManualDisconnect = () => {
    disconnect();
    setWsTeamCode(undefined);
  };

  return (
    <div className="log-monitoring-container">
      <h1 className="log-title">CLI 로그 모니터링</h1>

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

        <button className="toggle-button" onClick={onStartCollect} disabled={!teamCode}>
          수집 시작 & WS 연결
        </button>
        <button onClick={onManualDisconnect} className="toggle-button" disabled={!isWsOpen}>
          WS 끊기
        </button>

        <button
          onClick={onToggleStream}
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
          disabled={showSample}
        >
          {LEVELS.map((lv) => (
            <option key={lv} value={lv}>
              {lv}
            </option>
          ))}
        </select>
      </div>

      {/* WS 상태 */}
      <div className="text-sm" style={{ marginBottom: 8 }}>
        <b>WS 상태:</b> {status}
        {lastError ? ` | 에러: [${lastError.code}] ${lastError.message}` : ""}
        <span style={{ marginLeft: 12 }}>
          {status === "open"
            ? "✅ 연결됨"
            : status === "connecting"
            ? "⏳ 연결 중..."
            : status === "closed"
            ? "❌ 끊김"
            : status === "closing"
            ? "🔒 닫는 중..."
            : ""}
        </span>
      </div>

      {/* 로그 뷰어: 샘플 모드면 SAMPLE만, 아니면 기존 rows */}
      <div className="log-viewer">
        {showSample ? (
          sampleParts.map((p, idx) => {
            const lv = (p.level || "INFO").toLowerCase(); // error | warn | info | debug
            const safe = ["error", "warn", "info", "debug"].includes(lv) ? lv : "info";
            return (
              <div
                key={idx}
                className={`log-entry ${safe}`}
                style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
              >
                {p.text || "\u00A0"}
              </div>
            );
          })
        ) : (
          filteredRows.map((row, i) => {
            const lv = String(row.level || "INFO").toLowerCase();
            const safe = ["error", "warn", "info", "debug"].includes(lv) ? lv : "info";
            return (
              <div key={i} className={`log-entry ${safe}`} title={row.time}>
                {formatLine(row)}
              </div>
            );
          })
        )}
        <div ref={logEndRef} />
      </div>

      {/* 추가 기능(WS 범위/컨텍스트)은 그대로 유지, 샘플 모드에선 비활성 */}
      <div className="log-controls" style={{ marginTop: 8, gap: 8, flexWrap: "wrap" }}>
        <label className="date-range-label">
          <span style={{ margin: "0 8px" }}>시작 :</span>
          <input
            type="datetime-local"
            value={rangeStart}
            onChange={(e) => setRangeStart(e.target.value)}
            disabled={showSample || !isWsOpen}
          />
          <span style={{ margin: "0 8px" }}>종료 :</span>
          <input
            type="datetime-local"
            value={rangeEnd}
            onChange={(e) => setRangeEnd(e.target.value)}
            disabled={showSample || !isWsOpen}
          />
        </label>

        <button
          disabled={!isWsOpen || showSample}
          onClick={() => requestRange(rangeStart, rangeEnd)}
          className="toggle-button"
        >
          범위 조회(WS)
        </button>

        <button
          disabled={!isWsOpen || showSample}
          onClick={() => requestLevelContext("ERROR", 50)}
          className="toggle-button"
        >
          ERROR 컨텍스트(WS)
        </button>
      </div>
    </div>
  );
}
