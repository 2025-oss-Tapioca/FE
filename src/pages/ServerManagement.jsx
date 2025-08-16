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

  // ✅ 서버 관련 훅
  const {
    servers,
    isLoadingServers,
    registerFront,
    registerBackend,
    registerDB,
    removeFrontServer,
    removeBackServer,
    removeDatabaseServer,
  } = useServerActions();

  // ✅ teamCode를 localStorage에 저장
  useEffect(() => {
    if (teamCode) {
      localStorage.setItem("teamCode", teamCode);
    }
  }, [teamCode]);

  // ✅ 서버 삭제 핸들러
  const handleDelete = (type) => {
    if (!window.confirm(`${type.toUpperCase()} 서버를 삭제하시겠습니까?`))
      return;

    const deleteMap = {
      front: removeFrontServer,
      back: removeBackServer,
      db: removeDatabaseServer,
    };

    const deleteFn = deleteMap[type];
    if (!deleteFn) {
      alert("지원하지 않는 서버 유형입니다.");
      return;
    }

    deleteFn(teamCode, {
      onSuccess: () => {
        alert(`${type.toUpperCase()} 서버가 삭제되었습니다.`);
      },
      onError: () => {
        alert("서버 삭제에 실패했습니다.");
      },
    });
  };

  // ✅ 서버 추가 핸들러
  const handleAddServer = async (newServer) => {
    try {
      const payload = { ...newServer, teamCode };

      const registerMap = {
        frontend: registerFront,
        backend: registerBackend,
        database: registerDB,
      };

      const registerFn = registerMap[newServer.type];
      if (!registerFn) throw new Error("지원하지 않는 서버 유형입니다.");

      await new Promise((resolve, reject) => {
        registerFn(payload, {
          onSuccess: resolve,
          onError: reject,
        });
      });

      const url =
        newServer.type === "database" ? newServer.dbAddress : newServer.ec2Host;

      await checkServerStatus(url); // 상태 확인은 optional
      alert("서버가 성공적으로 등록되었습니다.");
    } catch (error) {
      console.error("서버 등록 실패:", error);
      const errorCode = error?.code;
      const errorMessage =
        ERROR_MESSAGES[errorCode] || error?.message || ERROR_MESSAGES.default;

      alert(errorMessage);
    } finally {
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
          <>
            {servers?.front && (
              <ServerCard
                name="프론트 서버"
                url={servers.front.ec2Host}
                status="unknown"
                onDelete={() => handleDelete("front")}
              />
            )}

            {servers?.back && (
              <ServerCard
                name="백엔드 서버"
                url={servers.back.ec2Host}
                status="unknown"
                onDelete={() => handleDelete("back")}
              />
            )}

            {servers?.db && (
              <ServerCard
                name="DB 서버"
                url={servers.db.dbAddress}
                status="unknown"
                onDelete={() => handleDelete("db")}
              />
            )}
          </>
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
