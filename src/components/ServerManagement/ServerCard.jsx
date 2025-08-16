import React from "react";
import { Power, RefreshCw, Trash2 } from "lucide-react";

const ServerCard = ({ name, url, status, onDelete }) => {
  const isConnected = status === "connected";

  return (
    <div className="server-card">
      <div className="server-info">
        <div className="server-info-header">
          <div className="server-name">{name}</div>
          <span
            className={`server-status ${
              isConnected ? "status-connected" : "status-disconnected"
            }`}
          >
            {isConnected ? "연결됨" : "연결 해제됨"}
          </span>
        </div>
        <div className="server-url">{url}</div>
      </div>

      <div className="server-controls">
        <Power size={20} className="server-icon" />
        <RefreshCw size={20} className="server-icon" />
        <Trash2 size={20} className="server-icon" onClick={onDelete} />{" "}
      </div>
    </div>
  );
};

export default ServerCard;
