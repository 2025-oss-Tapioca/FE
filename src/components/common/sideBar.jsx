import React, { useState } from 'react';
import NavButton from './navButton';

export default function Sidebar() {
  const [activeTab, setActiveTab] = useState("로그 모니터링");

  const buttons = [
    "대시보드",
    "서버관리",
    "개발도구",
    "성능 테스트",
    "로그 모니터링",
  ];

  return (
    <div>
      <div>
        {/* 로고 */}
        <div className="header">
          <img src="/logo.png" alt="logo" className="logo" />
          <h1> TAPIOCA </h1>
        </div>

        {/* 네비게이션 버튼 */}
        <div className="nav-buttons">
          {buttons.map((label) => (
            <NavButton
              key={label}
              label={label}
              active={activeTab === label}
              onClick={() => setActiveTab(label)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
