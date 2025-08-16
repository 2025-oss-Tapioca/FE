import client from "../utils/axios"; // baseURL 설정된 axios 인스턴스

/** 서버 조회 */
export const getServers = (teamCode) => {
  // ✅ teamCode 인자를 받도록 수정
  console.log("API 호출: getServers");
  console.log("넘겨받은 teamCode:", teamCode); // teamCode 확인
  // ✅ teamCode를 params에 담아 쿼리 스트링으로 전달합니다.
  return client.get(`/api/server/${teamCode}`);
};

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

export const deleteFrontServer = (teamCode) => {
  return client.delete("/api/server/front", {
    data: { teamCode },
  });
};

export const deleteBackServer = (teamCode) => {
  return client.delete("/api/server/back", {
    data: { teamCode },
  });
};

export const deleteDatabaseServer = (teamCode) => {
  return client.delete("/api/server/db", {
    data: { teamCode },
  });
};

/** 프론트 서버 수정 */
export const updateFrontServer = (payload) => {
  return client.patch("/api/server/front", payload);
};

/** 백엔드 서버 수정 */
export const updateBackServer = (payload) => {
  return client.patch("/api/server/back", payload);
};

/** DB 서버 수정 */
export const updateDatabaseServer = (payload) => {
  return client.patch("/api/server/db", payload);
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
