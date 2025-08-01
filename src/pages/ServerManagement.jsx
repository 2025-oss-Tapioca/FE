import React from "react";
import ServerCard from "../components/ServerManagement/ServerCard";
import "../styles/css/ServerManagement.css";
import { Plus } from "lucide-react";

const servers = [
  {
    id: 1,
    name: "Server 1",
    url: "http://localhost:3000",
    status: "connected",
  },
  {
    id: 2,
    name: "Server 2",
    url: "http://localhost:5152",
    status: "disconnected",
  },
];

const ServerManagement = () => {
  const handleAddServer = () => {
    // 서버 추가 로직 (예: 모달 열기 등)
    alert("새 서버 추가");
  };

  return (
    <div className="server-management-container">
      <div className="server-management-header">
        <h2 className="server-management-title">서버 관리</h2>
        <button onClick={handleAddServer} className="add-server-button">
          <Plus size={16} className="mr-1" />새 서버 추가
        </button>
      </div>

      <div className="server-list">
        {servers.map((server) => (
          <ServerCard key={server.id} {...server} />
        ))}
      </div>
    </div>
  );
};

export default ServerManagement;
