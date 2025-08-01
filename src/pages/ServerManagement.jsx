import React, { useState } from "react";
import ServerCard from "../components/ServerManagement/ServerCard";
import "../styles/css/ServerManagement.css";
import { Plus } from "lucide-react";

const ServerManagement = () => {
  const [servers, setServers] = useState([
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
  ]);

  const handleAddServer = () => {
    const newId = servers.length + 1;
    const newServer = {
      id: newId,
      name: `Server ${newId}`,
      url: `http://localhost:${3000 + newId * 100}`,
      status: "disconnected",
    };
    setServers([...servers, newServer]);
  };

  return (
    <div className="server-management-container">
      <div className="server-management-header">
        <h2 className="server-management-title">서버 관리</h2>
        <button onClick={handleAddServer} className="add-server-button">
          <Plus size={16} style={{ marginRight: "6px" }} />새 서버 추가
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
