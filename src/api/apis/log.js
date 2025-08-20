import api from "../utils/axios.jsx";

// log.js
// REST용
const toRestPath = (t) =>
  ({ BACKEND: "backend", FRONTEND: "frontend", RDS: "rds" }[t] ||
   String(t || "").toLowerCase());

export const registerLog = (sourceType, teamCode) =>
  api.post(`/api/log/register/${toRestPath(sourceType)}/${teamCode}`);

export const queryRange = (sourceType, teamCode, from, to) =>
  api.get('/api/log/query/range', { params: { sourceType, teamCode, from, to } });

export const queryContext = (sourceType, teamCode, level, context = 50) =>
  api.get('/api/log/query/context', { params: { sourceType, teamCode, level, context } });

export const queryStatus = (sourceType, teamCode) =>
  api.get('/api/log/query/status', { params: { sourceType, teamCode } });
