import React, { useState } from "react";
import SideBar from "../components/common/sideBar";
import "../styles/css/home.css";

const Home = () => {
  const [activeTab, setActiveTab] = useState("대시보드");

  return (
    <div className="container">
      <SideBar className="side-bar" activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        <h2 className="page-title">{activeTab}</h2>
        {/* 이곳에 콘텐츠 렌더링 */}
      </main>
    </div>
  );
};

export default Home;
