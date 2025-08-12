import React, { useState } from "react";
import SideBar from "../components/common/sideBar";
import Dashboard from "./Dashboard";
import ServerManagement from "./ServerManagement";
import DevTools from "./DevTools";
import PerformanceTest from "./PerformanceTest";
import LogMonitoring from "./LogMonitoring";

import "../styles/css/home.css";

const Home = () => {
  const [activeTab, setActiveTab] = useState("대시보드");

  return (
    <div className="container">
      <div className="layout-inner">
        <SideBar
          className="side-bar"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        <main className="main-content">
          {activeTab === "대시보드" && <Dashboard />}
          {activeTab === "서버관리" && <ServerManagement />}
          {activeTab === "개발도구" && <DevTools />}
          {activeTab === "성능 테스트" && <PerformanceTest />}
          {activeTab === "로그 모니터링" && <LogMonitoring />}
        </main>
      </div>
    </div>
  );
};

export default Home;
