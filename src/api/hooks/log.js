import { useEffect, useRef, useState, useCallback } from 'react';

const WS_URL =
  import.meta.env.VITE_WS_URL ||
  ((import.meta.env.VITE_API_URL || '')
    .replace(/^http(s?):\/\//, (_, s) => (s ? 'wss://' : 'ws://')) + '/ws/log');

const stateMap = { 0: 'connecting', 1: 'open', 2: 'closing', 3: 'closed' };

// ✅ WS 쿼리스트링은 서버 계약 그대로 "대문자" 유지
const toWsParam = (t) =>
  ({ backend: "BACKEND", frontend: "FRONTEND", rds: "RDS" }[String(t || "").toLowerCase()] ||
   String(t || "").toUpperCase());

// ✅ 훅 함수명은 반드시 use로 시작
export default function useLogSocket({ teamCode, sourceType }) {
  const wsRef = useRef(null);
  const [status, setStatus] = useState('closed');
  const [rows, setRows] = useState([]);
  const [lastError, setLastError] = useState(null);

  const backoffRef = useRef(1000);
  const manualCloseRef = useRef(false);
  const reconnectTimerRef = useRef(null);

  const clearReconnectTimer = () => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  };

  const scheduleReconnect = useCallback(() => {
    if (manualCloseRef.current) return;
    if (reconnectTimerRef.current) return;
    const wait = backoffRef.current;
    reconnectTimerRef.current = setTimeout(() => {
      reconnectTimerRef.current = null;
      connect();
      backoffRef.current = Math.min(backoffRef.current * 1.8, 30000);
    }, wait);
  }, []);

  const connect = useCallback(() => {
    clearReconnectTimer();
    if (!teamCode || !sourceType) return;

    try { wsRef.current?.close(); } catch {}
    wsRef.current = null;

    // ★ 계약: 쿼리스트링 방식으로만 연결
    const url = `${WS_URL}?teamCode=${encodeURIComponent(teamCode)}&sourceType=${encodeURIComponent(toWsParam(sourceType))}`;
    console.log('[WS URL]', url);
    const ws = new WebSocket(url);
    
    wsRef.current = ws;
    setStatus(stateMap[ws.readyState] || 'connecting');

    ws.onopen = () => {
      backoffRef.current = 1000;
      setStatus('open');
      // ★ 더 이상 별도 register 메시지 보내지 않음 (쿼리스트링으로 라우팅)
    };

    ws.onmessage = (e) => {
      let msg; try { msg = JSON.parse(e.data); } catch { msg = e.data; }
      if (!msg || typeof msg !== 'object') return;

      if (msg.type === 'ok' || (msg.type === 'ack' && msg.action === 'register')) return;

      if (msg.type === 'log' && msg.data) {
        const r = msg.data;
        const local = new Date((r.timestamp || '') + 'Z');
        setRows(prev => [
          { time: isNaN(local) ? r.timestamp : local.toLocaleString(), level: r.level, service: r.service || '-', message: r.message },
          ...prev,
        ]);
        return;
      }

      if (msg.type === 'filter_between_result' && Array.isArray(msg.data)) {
        const list = msg.data.map(r => {
          const local = new Date((r.timestamp || '') + 'Z');
          return { time: isNaN(local) ? r.timestamp : local.toLocaleString(), level: r.level, service: r.service || '-', message: r.message };
        });
        setRows(prev => [...list.reverse(), ...prev]);
        return;
      }

      if (msg.type === 'error') {
        setLastError({ code: msg.code, message: msg.message });
      }
    };

    ws.onclose = (e) => {
      setStatus("closed");
      console.warn("[WS CLOSE]", { code: e.code, reason: e.reason, wasClean: e.wasClean });
      if (!manualCloseRef.current) scheduleReconnect();
    };

    ws.onerror = (err) => {
      setLastError({ code: "WS", message: String(err?.message || "WebSocket error") });
      console.error("[WS ERROR]", err);
    };
  }, [teamCode, sourceType, scheduleReconnect]);

  const disconnect = useCallback(() => {
    manualCloseRef.current = true;
    clearReconnectTimer();
    try { wsRef.current?.close(1000, 'client close'); } catch {}
    wsRef.current = null;
    setStatus('closed');
  }, []);

  useEffect(() => {
    manualCloseRef.current = false;
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  const requestRange = useCallback((from, to) => {
    if (!wsRef.current || wsRef.current.readyState !== 1) return;
    wsRef.current.send(JSON.stringify({ type: 'filter_between', from, to }));
  }, []);

  const requestLevelContext = useCallback((level, context = 50) => {
    if (!wsRef.current || wsRef.current.readyState !== 1) return;
    wsRef.current.send(JSON.stringify({ type: 'level_context', level, context }));
  }, []);

  return { status, rows, lastError, requestRange, requestLevelContext, reconnect: connect, disconnect };
}
