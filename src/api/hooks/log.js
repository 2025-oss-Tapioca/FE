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
    console.log('[WS URL]', WS_URL);
    const ws = new WebSocket(WS_URL);
    
    wsRef.current = ws;
    setStatus(stateMap[ws.readyState] || 'connecting');

    ws.onopen = () => {
      console.log('[WS OPENED]');
      backoffRef.current = 1000;
      setStatus('open');

      const frame = {
        type: 'register',
        sourceType: toWsParam(sourceType), // ex: "BACKEND"
        code: teamCode,                    // ex: "28a00517"
      };

      console.log('[WS SEND REGISTER]', frame);
      ws.send(JSON.stringify(frame));
    };


    ws.onmessage = (e) => {
      let msg; try { msg = JSON.parse(e.data); } catch { return; }
      if (!msg || typeof msg !== 'object') return;

      // 1) 등록 ACK 등 제어 프레임은 무시
      if (msg.type === 'ok' || (msg.type === 'ack' && msg.action === 'register')) return;
      if (msg.type === 'error') { setLastError({ code: msg.code, message: msg.message }); return; }

      // 2) 단일 DTO (ts/level/service/message) 수신
      if ('ts' in msg || 'timestamp' in msg || 'time' in msg) {
        const ts = msg.ts ?? msg.timestamp ?? msg.time ?? '';
        const local = new Date((ts || '') + 'Z');
        const row = {
          time: isNaN(local) ? ts : local.toLocaleString(),
          level: msg.level || 'INFO',
          service: msg.service || '-',
          message: msg.message || '',
        };
        setRows(prev => [row, ...prev]);
        return;
      }

      // 3) 배열 응답(과거 로그 묶음)도 지원
      if (Array.isArray(msg.data)) {
        const list = msg.data.map(r => {
          const ts = r.ts ?? r.timestamp ?? r.time ?? '';
          const local = new Date((ts || '') + 'Z');
          return {
            time: isNaN(local) ? ts : local.toLocaleString(),
            level: r.level || 'INFO',
            service: r.service || '-',
            message: r.message || '',
          };
        });
        setRows(prev => [...list.reverse(), ...prev]);
      }
    };;

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
    wsRef.current.send(JSON.stringify({ type: 'filter', from, to }));
  }, []);

  const requestLevelContext = useCallback((level, context = 50) => {
    if (!wsRef.current || wsRef.current.readyState !== 1) return;
    wsRef.current.send(JSON.stringify({ type: 'levelFilter', level, context }));
  }, []);

  return { status, rows, lastError, requestRange, requestLevelContext, reconnect: connect, disconnect };
}
