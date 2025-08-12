import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as teamAPI from '../apis/team'; // API 함수들을 한번에 가져옵니다.

export const useTeamActions = () => {
    const queryClient = useQueryClient();

    // 쿼리 무효화 함수: 성공 시 재사용
    const invalidateTeamsQuery = () => {
        queryClient.invalidateQueries({ queryKey: ['teams'] });
    };

    // 1. 팀 생성 뮤테이션
    const { mutate: createTeam, isPending: isCreating } = useMutation({
        mutationFn: teamAPI.createTeam, // API 함수 연결
        onSuccess: () => {
            // 성공 시 'teams' 쿼리를 무효화시켜 팀 목록을 자동으로 새로고침
            invalidateTeamsQuery();
            alert('팀이 성공적으로 생성되었습니다!');
        },
    });

    // 2. 팀 삭제 뮤테이션
    const { mutate: deleteTeam, isPending: isDeleting } = useMutation({
        mutationFn: teamAPI.deleteTeam,
        onSuccess: () => {
            invalidateTeamsQuery();
            alert('팀이 삭제되었습니다.');
        },
    });

    // 3. 팀 참가 뮤테이션
    const { mutate: joinTeam, isPending: isJoining } = useMutation({
        mutationFn: teamAPI.joinTeam,
        onSuccess: () => {
            invalidateTeamsQuery(); // 내 팀 목록을 새로고침
            // 추가적으로 내 프로필 정보를 새로고침 할 수도 있습니다.
            // queryClient.invalidateQueries({ queryKey: ['me'] }); 
            alert('팀에 성공적으로 참가했습니다!');
        },
    });

    return {
        createTeam, isCreating,
        deleteTeam, isDeleting,
        joinTeam, isJoining,
    };
};