import React, { useState } from "react";
import "../styles/css/ServerManagement.css";
import ServerCard from "../components/ServerManagement/ServerCard";
import { Plus } from "lucide-react";
import AddServerModal from "../components/ServerManagement/AddServerModal";

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
  const [showModal, setShowModal] = useState(false);

  const handleAddServer = (newServer) => {
    const nextId = servers.length + 1;
    const newServerData = {
      ...newServer,
      id: nextId,
      status: "disconnected",
      url: newServer.url || `http://localhost:${3000 + nextId * 100}`,
    };
    setServers([...servers, newServerData]);
    setShowModal(false);
  };

  return (
    <div className="server-management-container">
      <div className="server-management-header">
        <h2 className="server-management-title">서버 관리</h2>
        <button
          className="add-server-button"
          onClick={() => setShowModal(true)}
        >
          <Plus size={16} /> 새 서버 추가
        </button>
      </div>

      <div className="server-list">
        {servers.map((server) => (
          <ServerCard
            key={server.id}
            {...server}
            onDelete={(id) => {
              setServers(servers.filter((s) => s.id !== id));
            }}
          />
        ))}
      </div>

      {showModal && (
        <AddServerModal
          onClose={() => setShowModal(false)}
          onAdd={handleAddServer}
        />
      )}
    </div>
  );
};

export default ServerManagement;
