import React, { useState } from "react";
import { checkServerStatus } from "../api/apis/server";
import { useServerActions } from "../api/hooks/server";
import "../styles/css/ServerManagement.css";
import ServerCard from "../components/ServerManagement/ServerCard";
import { Plus } from "lucide-react";
import AddServerModal from "../components/ServerManagement/AddServerModal";

// 무작위 팀 코드 생성 함수
const generateRandomTeamCode = () => {
  return "TEAM-" + Math.random().toString(36).substring(2, 8).toUpperCase();
};

const ServerManagement = () => {
  const { registerFront, registerBackend, registerDB } = useServerActions();
  const [servers, setServers] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // ✅ 서버 추가 핸들러
  const handleAddServer = async (newServer) => {
    try {
      const teamCode = generateRandomTeamCode();

      const payload = { ...newServer, teamCode };

      // 1. 서버 유형에 따라 등록
      if (newServer.type === "frontend") {
        await registerFront(payload);
      } else if (newServer.type === "backend") {
        await registerBackend(payload);
      } else if (newServer.type === "database") {
        await registerDB(payload);
      } else {
        throw new Error("지원하지 않는 서버 유형입니다.");
      }

      // 2. 상태 확인 (url은 EC2 or DB 주소)
      const url =
        newServer.type === "database" ? newServer.dbAddress : newServer.ec2Host;
      const isOnline = await checkServerStatus(url);

      // 3. 카드용 데이터 구성
      const newServerCard = {
        id: Date.now(),
        name: `${newServer.name}`,
        url,
        status: isOnline ? "connected" : "disconnected",
      };

      setServers((prev) => [...prev, newServerCard]);
      setShowModal(false);
    } catch (error) {
      console.error("서버 등록 실패:", error);
      alert("서버 등록 또는 상태 확인에 실패했습니다.");
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
        {servers.map((server) => (
          <ServerCard
            key={server.id}
            {...server}
            onDelete={(id) =>
              setServers((prev) => prev.filter((s) => s.id !== id))
            }
          />
        ))}
      </div>

      {showModal && (
        <AddServerModal
          onClose={() => setShowModal(false)}
          onSubmit={handleAddServer} // ✅ 중요
        />
      )}
    </div>
  );
};

export default ServerManagement;
