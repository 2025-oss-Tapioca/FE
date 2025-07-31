import React from 'react';
import NavButton from './navButton';
import "../../styles/css/sideBar.css";

import { ReactComponent as DashboardIcon } from "/assets/icons/dashboard.svg";
import { ReactComponent as ServerIcon } from "/assets/icons/server.svg";
import { ReactComponent as ToolsIcon } from "/assets/icons/tool.svg";
import { ReactComponent as PerformanceIcon } from "/assets/icons/test.svg";
import { ReactComponent as LogsIcon } from "/assets/icons/test.svg";

export default function Sidebar({ activeTab, setActiveTab }) {
  const buttons = [
    "대시보드",
    "서버관리",
    "개발도구",
    "성능 테스트",
    "로그 모니터링",
  ];

  const iconMap = {
    "대시보드": DashboardIcon,
    "서버관리": ServerIcon,
    "개발도구": ToolsIcon,
    "성능 테스트": PerformanceIcon,
    "로그 모니터링": LogsIcon,
  };

  return (
    <div className="side-bar">
      {/* 로고 */}
      <div className="header">
        <img src="../assets/logo.svg" alt="logo" className="logo" />
        <div>TAPIOCA</div>
      </div>

      {/* 네비게이션 버튼 */}
      <div className="nav-buttons">
        {buttons.map((label) => {
          const IconComponent = iconMap[label];
          return (
            <NavButton
              key={label}
              label={label}
              icon={<IconComponent className={`nav-icon ${activeTab === label ? "active" : ""}`} />}
              active={activeTab === label}
              onClick={() => setActiveTab(label)}
            />
          );
        })}
      </div>
    </div>
  );
}
