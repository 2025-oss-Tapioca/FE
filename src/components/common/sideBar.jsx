import React from 'react';
import NavButton from './navButton';
import ServerButton from './serverButton';

import "../../styles/css/sideBar.css";

export default function Sidebar({ activeTab, setActiveTab }) {
  const buttons = [
    "대시보드",
    "서버관리",
    "개발도구",
    "성능 테스트",
    "로그 모니터링",
  ];

  const iconMap = {
    "대시보드": "dashboard",
    "서버관리": "server",
    "개발도구": "tool",
    "성능 테스트": "test",
    "로그 모니터링": "test",
  };

  return (
    <div className="side-bar">
      {/* 로고 */}
      <div className="header">
        <img src="/assets/logo.svg" alt="logo" className="logo" />
        <div>TAPIOCA</div>
      </div>

      {/* 네비게이션 버튼 */}
      <div className="nav-buttons">
        {buttons.map((label) => {
          const baseName = iconMap[label];
          const isActive = activeTab === label;
          const iconSrc = `/assets/icons/${baseName}${isActive ? "-selected" : ""}.svg`;

          return (
            <NavButton
              key={label}
              label={label}
              icon={<img src={iconSrc} alt={`${label} icon`} className="nav-icon" />}
              active={isActive}
              onClick={() => setActiveTab(label)}
            />
          );
        })}
      </div>
      <div>
        {/* 서버 연결 상태 버튼 */}
        <div className='connected-server-header'>연결된 서버</div>
        <div className="server-buttons">
            <ServerButton label="Server1" />
            <ServerButton label="Server2" />
        </div>

      </div>
    </div>
  );
}
