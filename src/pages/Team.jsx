import React from "react";
import "../styles/css/Team.css";
import TeamCard from "../components/common/teamCard";
import { Plus } from "lucide-react";

const TeamPage = () => {
  return (
    <div className="team-page">
      {/* ✅ 새 디자인의 헤더 */}
      <div className="team-top-header">
        <div className="team-header-text">
          <h1 className="team-title">팀 관리</h1>
          <p className="team-subtitle">참여 중인 팀을 확인하고, 새로운 팀을 시작해보세요.</p>
        </div>
        <div className="team-header-buttons">
          <button className="team-button create">
            <Plus size={16} />
            팀 생성
          </button>
          <button className="team-button join">팀 참가</button>
        </div>
      </div>

      {/* ✅ 기존 카드 컨테이너 유지 */}
      <div className="team-card-container">
        <TeamCard />
        <TeamCard />
        <TeamCard />
      </div>
    </div>
  );
};

export default TeamPage;
