import React from "react";
import { Power, Pencil, Trash2 } from "lucide-react";
import PropTypes from "prop-types";

const ServerCard = ({ name, url, status, type, onDelete, onModify }) => {
  const isConnected = status === "connected";

  const handleModify = () => {
    onModify({
      type: type,
      data: { name, url, status },
    });
    console.log(type, "서버 수정 요청");
  };

  return (
    <div className="server-card">
      <div className="server-info">
        <div className="server-info-header">
          <h3 className="server-name">{name}</h3>
          <span
            className={`server-status ${
              isConnected ? "status-connected" : "status-disconnected"
            }`}
          >
            {isConnected ? "연결됨" : "연결 해제됨"}
          </span>
        </div>
        <p className="server-url">{url}</p>
      </div>

      <div className="server-controls">
        <button className="server-icon-button" title="Power">
          <Power size={20} className="server-icon" />
        </button>
        <button
          className="server-icon-button"
          title="수정"
          onClick={handleModify}
        >
          <Pencil size={20} className="server-icon" />
        </button>
        <button className="server-icon-button" title="삭제" onClick={onDelete}>
          <Trash2 size={20} className="server-icon" />
        </button>
      </div>
    </div>
  );
};

ServerCard.propTypes = {
  name: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired, // "connected" | "disconnected"
  type: PropTypes.string.isRequired, // "FRONT" | "BACKEND" | "DB"
  onDelete: PropTypes.func.isRequired,
  onModify: PropTypes.func.isRequired,
};

export default ServerCard;
