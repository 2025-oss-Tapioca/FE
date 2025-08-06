// components/DevelopmentTools/APISpecCard.jsx
import React from "react";
import MethodBadge from "../common/MethodBadge";
import { Pencil, Trash2 } from "lucide-react";
import "../../styles/css/APISpecCard.css";

const APISpecCard = ({ method, name, endpoint, tag, status, date }) => {
  return (
    <div className="api-spec-card">
      <MethodBadge type="method" value={method} />
      <span className="name">{name}</span>
      <span className="endpoint">{endpoint}</span>
      <span className="tag">{tag}</span>
      <span className="status">
        <span className={`dot ${status.toLowerCase()}`} /> {status}
      </span>
      <span className="date">{date}</span>
      <div className="actions">
        <Pencil size={16} />
        <Trash2 size={16} />
      </div>
    </div>
  );
};

export default APISpecCard;
