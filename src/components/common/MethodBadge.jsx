import React from "react";
import "../../styles/css/MethodBadge.css";

export default function MethodBadge({ type = "default", value, icon }) {
  return (
    <span className={`badge ${type} ${value.toLowerCase()}`}>
      {icon && <span className="badge-icon">{icon}</span>}
      <span>{value}</span>
    </span>
  );
}
