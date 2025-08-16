import React from "react";
import "../../styles/css/addServerButton.css";

export default function AddServerButton({ onClick }) {
  return (
    <button className="add-server-button" onClick={onClick}>
      <span>+ 서버 추가</span>
    </button>
  );
}
