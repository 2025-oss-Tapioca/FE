import React, { useState } from "react";
import SideBar from "../components/common/sideBar";
import ServerManagement from "./ServerManagement";
import DevTools from "./DevTools";
import PerformanceTest from "./PerformanceTest";

import "../styles/css/home.css";

const Home = () => {
  const [activeTab, setActiveTab] = useState("대시보드");

  return (
    <div className="container">
      <SideBar
        className="side-bar"
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <main className="main-content">
        {activeTab === "대시보드" && <h2 className="page-title">대시보드</h2>}
        {activeTab === "서버관리" && <ServerManagement />}
        {activeTab === "개발도구" && <DevTools />}
        {activeTab === "성능 테스트" && <PerformanceTest />}
        {activeTab === "로그 모니터링" && (
          <h2 className="page-title">로그 모니터링</h2>
        )}
      </main>
    </div>
  );
};

export default Home;
