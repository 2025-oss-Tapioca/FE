import client from "../utils/axios"; // baseURL 설정된 axios 인스턴스

/**
 * 프론트 서버 등록
 * POST /server/front
 */
export const registerFrontServer = (payload) => {
  return client.post("/api/server/front", payload);
};

/**
 * 백엔드 서버 등록
 * POST /server/back
 */
export const registerBackendServer = (payload) => {
  return client.post("/api/server/back", payload);
};

/**
 * DB 서버 등록
 * POST /server/db
 */
export const registerDatabaseServer = (payload) => {
  return client.post("/api/server/db", payload);
};

/**
 * 서버 상태 확인 (GET /health)
 * - URL: http://example.com/health
 */
export const checkServerStatus = async (serverUrl) => {
  try {
    const response = await fetch(`${serverUrl}/health`, {
      method: "GET",
    });

    if (!response.ok) throw new Error("서버 응답 실패");

    const data = await response.json();
    return data?.status === "ok";
  } catch (error) {
    console.error(`[checkServerStatus] ${serverUrl} 상태 확인 실패`, error);
    return false;
  }
};
