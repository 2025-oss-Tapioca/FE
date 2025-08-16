import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { checkServerStatus } from "../api/apis/server";
import { useServerActions } from "../api/hooks/server";
import "../styles/css/ServerManagement.css";
import ServerCard from "../components/ServerManagement/ServerCard";
import { Plus } from "lucide-react";
import AddServerModal from "../components/ServerManagement/AddServerModal";
import EditServerModal from "../components/ServerManagement/EditServerModal";

const ERROR_MESSAGES = {
  40904: "프론트 서버 등록은 팀 당 1번만 가능합니다.",
  40905: "백엔드 서버 등록은 팀 당 1번만 가능합니다.",
  40906: "디비 서버 등록은 팀 당 1번만 가능합니다.",
  default: "서버 등록 중 알 수 없는 오류가 발생했습니다.",
};

const ServerManagement = () => {
  const { teamCode } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const {
    servers,
    isLoadingServers,
    registerFront,
    registerBackend,
    registerDB,
    removeFrontServer,
    removeBackServer,
    removeDatabaseServer,
    updateFront,
    updateBack,
    updateDB,
  } = useServerActions();

  useEffect(() => {
    if (teamCode) localStorage.setItem("teamCode", teamCode);
  }, [teamCode]);

  const handleDelete = (type) => {
    if (!window.confirm(`${type.toUpperCase()} 서버를 삭제하시겠습니까?`))
      return;

    const deleteMap = {
      front: removeFrontServer,
      back: removeBackServer,
      db: removeDatabaseServer,
    };

    const deleteFn = deleteMap[type];
    if (!deleteFn) return alert("지원하지 않는 서버 유형입니다.");

    deleteFn(teamCode, {
      onSuccess: () => alert(`${type.toUpperCase()} 서버가 삭제되었습니다.`),
      onError: () => alert("서버 삭제에 실패했습니다."),
    });
  };

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

      // ✅ 1. Mutation 실행 + 응답 받기
      const res = await new Promise((resolve, reject) =>
        registerFn(payload, {
          onSuccess: (data) => resolve(data),
          onError: (err) => reject(err),
        })
      );

      // ✅ 2. 응답 내부에서 success 여부 분기
      if (!res?.success) {
        const errorCode = res?.error?.code || null;
        const errorMessage =
          res?.error.message ||
          ERROR_MESSAGES[errorCode] ||
          ERROR_MESSAGES.default;

        alert(errorMessage);
        return;
      }

      // ✅ 3. 상태 체크 후 성공 처리
      const url =
        newServer.type === "database" ? newServer.dbAddress : newServer.ec2Host;

      await checkServerStatus(url);

      alert("서버가 성공적으로 등록되었습니다.");
    } catch (error) {
      // ✅ 4. 네트워크/서버 에러 처리
      const errorCode = error?.response?.data?.code || error?.code || null;
      const errorMessage =
        ERROR_MESSAGES[errorCode] ||
        error?.response?.data?.message ||
        error?.message ||
        ERROR_MESSAGES.default;

      alert(errorMessage);
    } finally {
      setShowModal(false);
    }
  };

  const handleEditServer = async (editedData) => {
    try {
      const payload = { ...editedData, teamCode };
      const updateMap = {
        frontend: updateFront,
        backend: updateBack,
        database: updateDB,
      };

      const updateFn = updateMap[editedData.type];
      if (!updateFn) throw new Error("지원하지 않는 서버 유형입니다.");

      await new Promise((resolve, reject) =>
        updateFn(payload, { onSuccess: resolve, onError: reject })
      );

      const url =
        editedData.type === "database"
          ? editedData.dbAddress
          : editedData.ec2Host;
      await checkServerStatus(url);

      alert("서버 수정이 완료되었습니다.");
    } catch (error) {
      alert("서버 수정에 실패했습니다.");
    } finally {
      setShowEditModal(false);
    }
  };

  const handleModify = ({ type, data }) => {
    setEditTarget({ ...data, type, teamCode });
    setShowEditModal(true);
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
                type="frontend"
                onDelete={() => handleDelete("front")}
                onModify={() =>
                  handleModify({ type: "frontend", data: servers.front })
                }
              />
            )}
            {servers?.back && (
              <ServerCard
                name="백엔드 서버"
                url={servers.back.ec2Url}
                status="unknown"
                type="backend"
                onDelete={() => handleDelete("back")}
                onModify={() =>
                  handleModify({ type: "backend", data: servers.back })
                }
              />
            )}
            {servers?.db && (
              <ServerCard
                name="DB 서버"
                url={servers.db.dbAddress}
                status="unknown"
                type="database"
                onDelete={() => handleDelete("db")}
                onModify={() =>
                  handleModify({ type: "database", data: servers.db })
                }
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

      {showEditModal && editTarget && (
        <EditServerModal
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditServer}
          serverType={editTarget.type}
          initialData={editTarget}
        />
      )}
    </div>
  );
};

export default ServerManagement;
