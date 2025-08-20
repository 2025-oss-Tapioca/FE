import React, { useState } from "react";
import { useParams } from "react-router-dom";
import ERDEditor from "../components/DevTools/ERD/ERDEditor.jsx";
import APISpecTable from "../components/DevTools/APISpecTable.jsx";
import "../styles/css/DevTools.css";

export default function DevTools() {
  const [activeTab, setActiveTab] = useState("ERD 작성");
  const { teamCode } = useParams(); // ✅ URL에서 teamCode 가져오기

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
            disabled={true} // ✅ API 명세 탭은 현재 비활성화 상태
          >
            API 명세
          </button>
        </div>
      </div>

      {/* ✅ 탭에 따른 컴포넌트 렌더링 */}
      <div className="devtools-content">
        {activeTab === "ERD 작성" && <ERDEditor teamCode={teamCode} />}
        {activeTab === "API 명세" && <APISpecTable />}
      </div>
    </div>
  );
}
