import React, { useState } from "react";
import ERDEditor from "../components/DevTools/ERD/ERDEditor";
import APISpecTable from "../components/DevTools/APISpecTable";
import "../styles/css/DevTools.css";

export default function DevTools() {
  const [activeTab, setActiveTab] = useState("API 명세");

  return (
    <div className="development-tools-container">
      {/* ✅ 상단 헤더 + 탭 버튼 */}
      <div className="devtools-header">
        <h2 className="devtools-title">개발도구</h2>
        <div className="devtools-tabs">
          <button
            className={`tab-button ${activeTab === "ERD 작성" ? "active" : ""}`}
            onClick={() => setActiveTab("ERD 작성")}
          >
            ERD 작성
          </button>
          <button
            className={`tab-button ${activeTab === "API 명세" ? "active" : ""}`}
            onClick={() => setActiveTab("API 명세")}
          >
            API 명세
          </button>
        </div>
      </div>

      {/* ✅ 탭에 따른 컴포넌트 렌더링 */}
      <div className="devtools-content">
        {activeTab === "ERD 작성" && <ERDEditor />}
        {activeTab === "API 명세" && <APISpecTable />}
      </div>
    </div>
  );
}
