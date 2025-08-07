import React, { useState } from "react";
import "../styles/css/Team.css";

import TeamCard from "../components/common/teamCard";
import AddTeamDialog from "../components/Team/addTeamButton";
import JoinTeamDialog from "../components/Team/joinTeamButton";

export default function TeamPage() {
  const [teams, setTeams] = useState([]);

  const handleAddTeam = (newTeam) => {
    setTeams((prev) => [...prev, newTeam]);
  };

  const handleJoinTeam = (joinedTeam) => {
    setTeams((prev) => [...prev, joinedTeam]);
  };

  return (
    <div>
      <div className="team-top-header">
        <div className="team-header-text">
          <div className="team-title">팀 관리</div>
          <div className="team-subtitle">내가 속한 팀을 확인하고 새로 만들어보세요.</div>
        </div>
        <div className="team-header-buttons">
          <AddTeamDialog onCreate={handleAddTeam} />
          <JoinTeamDialog onJoin={handleJoinTeam} />
        </div>
      </div>

      <div className="team-card-container">
        <TeamCard
          name="타피오카"
          description="타피오카 플랫폼 개발 및 유지보수"
          memberCount={5}
        />
        {teams.map((team) => (
          <TeamCard
            key={team.id}
            name={team.name}
            description={team.description}
            memberCount={team.memberCount}
          />
        ))}
      </div>
    </div>
  );
}
