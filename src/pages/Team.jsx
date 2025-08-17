import React from 'react';
import '../styles/css/Team.css';

import TeamCard from '../components/common/teamCard';
import AddTeamDialog from '../components/Team/addTeamButton';
import JoinTeamDialog from '../components/Team/joinTeamButton';

import * as team from '../api/hooks/team';


export default function TeamPage() {
  // 각 훅을 호출하여 필요한 데이터, 함수, 상태를 가져옵니다.
  const { data: teams = [], isLoading, error } = team.useGetTeam();

  const { mutate: postCreateTeam, isPending: isCreating } = team.usePostCreateTeam();
  const { mutate: deleteTeam, isPending: isDeleting } = team.useDeleteTeam();
  const { mutate: postJoinTeam, isPending: isJoining } = team.usePostJoinTeam();


  console.log('React Query Result:', teams);


  // 로딩 및 에러 상태는 이전과 동일하게 처리합니다.
  if (isLoading) return <div>팀 목록을 불러오는 중입니다...</div>;
  if (error) return <div>에러가 발생했습니다: {error.message}</div>;

  return (
    <div>
      <div className="team-top-header">
        <div className="team-header-text">
          <div className="team-title">팀 관리</div>
          <div className="team-subtitle">내가 속한 팀을 확인하고 새로 만들어보세요.</div>
        </div>
        <div className="team-header-buttons">
          {/* 각 액션에 맞는 함수와 로딩 상태를 전달합니다. */}
          <AddTeamDialog onCreate={postCreateTeam} isCreating={isCreating} />
          <JoinTeamDialog onJoin={postJoinTeam} isJoining={isJoining} />
        </div>
      </div>

      <div className="team-card-container">
        {/* 배열에 팀이 있을 때만 이 부분이 렌더링됩니다. */}
        {teams.length > 0 && teams.map((team) => (
          <div key={team.id} className="team-card-wrapper">
            <TeamCard
              teamCode={team.teamCode}
              name={team.teamName}
              description={team.teamDescription}
              memberCount={team.member.length}
              onDelete={deleteTeam}
              isDeleting={isDeleting}
            />
          </div>
        ))}

        {/* 배열이 비어있을 때만 이 부분이 렌더링됩니다. */}
        {teams.length === 0 && (
          <div className="no-teams-message">
            <p>소속된 팀이 없습니다.</p>
            <p>새로운 팀을 만들거나 기존 팀에 참여해 보세요!</p>
          </div>
        )}
      </div>
    </div>
  );
}