import { client } from "../utils/axios.jsx";

// 조회 (백엔드 스펙에 맞춰 경로 조정: 읽기 전용이면 보통 /api/erd/{teamCode})
export const getERD = (teamCode) =>
  client.get(`/api/erd/${encodeURIComponent(teamCode)}`);

// 수정/저장
export const updateERD = (teamCode, payload) =>
  client.post(`/api/erd/update/${encodeURIComponent(teamCode)}`, payload);
