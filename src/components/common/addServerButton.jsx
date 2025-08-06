import React from "react";
import "../../styles/css/addServerButton.css";

export default function AddServerButton({ setActiveTab }) {
  const handleClick = () => {
    setActiveTab("서버관리");
  };

  return (
    <button className="add-server-button" onClick={handleClick}>
      <span>+ 서버 추가</span>
    </button>
  );
}
