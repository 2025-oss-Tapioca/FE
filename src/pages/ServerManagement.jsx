import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { checkServerStatus } from "../api/apis/server";
import { useServerActions } from "../api/hooks/server";
import "../styles/css/ServerManagement.css";
import ServerCard from "../components/ServerManagement/ServerCard";
import { Plus } from "lucide-react";
import AddServerModal from "../components/ServerManagement/AddServerModal";

// 에러 코드 → 메시지 매핑
const ERROR_MESSAGES = {
  40904: "프론트 서버 등록은 팀 당 1번만 가능합니다.",
  40905: "백엔드 서버 등록은 팀 당 1번만 가능합니다.",
  40906: "디비 서버 등록은 팀 당 1번만 가능합니다.",
  default: "서버 등록 중 알 수 없는 오류가 발생했습니다.",
};

const ServerManagement = () => {
  const { teamCode } = useParams();
  const [showModal, setShowModal] = useState(false);
  const {
    servers,
    isLoadingServers,
    registerFront,
    registerBackend,
    registerDB,
  } = useServerActions();

  // 💾 URL에서 받은 teamCode를 localStorage에 저장
  useEffect(() => {
    if (teamCode) {
      localStorage.setItem("teamCode", teamCode);
    }
  }, [teamCode]);

  const handleAddServer = async (newServer) => {
    try {
      const payload = { ...newServer, teamCode };
      let registerFn;

      if (newServer.type === "frontend") registerFn = registerFront;
      else if (newServer.type === "backend") registerFn = registerBackend;
      else if (newServer.type === "database") registerFn = registerDB;
      else throw new Error("지원하지 않는 서버 유형입니다.");

      // 🟢 등록 실행 (mutateAsync 사용 안 했을 경우, 반환값 없음)
      await new Promise((resolve, reject) => {
        registerFn(payload, {
          onSuccess: resolve,
          onError: reject,
        });
      });

      const url =
        newServer.type === "database" ? newServer.dbAddress : newServer.ec2Host;

      const isOnline = await checkServerStatus(url);

      alert(
        `서버가 성공적으로 등록되었습니다. 상태: ${
          isOnline ? "연결됨" : "연결되지 않음"
        }`
      );
      setShowModal(false);
    } catch (error) {
      console.error("서버 등록 실패:", error);
      const errorCode = error?.code;
      const errorMessage =
        ERROR_MESSAGES[errorCode] || error?.message || ERROR_MESSAGES.default;

      alert(errorMessage);
      setShowModal(false);
    }
  };

  return (
    <div className="server-management-container">
      <div className="server-management-header">
        <h2 className="server-management-title">서버 관리</h2>
        <div className="server-management-buttons">
          <button
            onClick={() => setShowModal(true)}
            className="add-server-management-button"
          >
            <Plus size={16} /> 새 서버 추가
          </button>
        </div>
      </div>

      <div className="server-list">
        {isLoadingServers ? (
          <p>서버 목록을 불러오는 중...</p>
        ) : (
          servers &&
          Object.entries(servers)
            .filter(([key]) => key !== "teamCode") // teamCode는 제외
            .map(([type, serverData]) => {
              if (!serverData) return null;

              const url =
                type === "database" ? serverData.dbAddress : serverData.ec2Host;

              return (
                <ServerCard
                  key={type}
                  name={`${type} 서버`}
                  url={url}
                  status="unknown" // 이후 checkServerStatus(url)로 연결 여부 판단 가능
                />
              );
            })
        )}
      </div>
      {showModal && (
        <AddServerModal
          onClose={() => setShowModal(false)}
          onSubmit={handleAddServer}
          teamCode={teamCode}
        />
      )}
    </div>
  );
};

export default ServerManagement;
