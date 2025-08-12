import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as teamAPI from '../apis/team'; // api/index.js 배럴 패턴을 사용한다고 가정

// --- 쿼리 훅 ---

/**
 * 팀 목록을 조회하는 쿼리 훅
 */
export const useGetTeam = () => {
    return useQuery({
    queryKey: ['teams'],
    queryFn: teamAPI.getTeam,
    select: (response) => response.data,
  });
};


// --- 뮤테이션 훅 (수정 완료) ---

/**
 * 새로운 팀을 생성하는 뮤테이션 훅
 */
export const useCreateTeam = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: teamAPI.createTeam,
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            alert(`'${response.data.teamName}' 팀이 성공적으로 생성되었습니다!`);
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.message || '팀 생성에 실패했습니다.';
            alert(errorMessage);
        },
    });
};

/**
 * 팀을 삭제하는 뮤테이션 훅
 */
export const useDeleteTeam = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: teamAPI.deleteTeam,
        // DELETE 요청의 응답 본문(response.data)은 보통 비어있거나 간단한 메시지만 올 수 있습니다.
        // 두 번째 인자로 mutate 함수에 전달했던 변수(teamId)를 받을 수도 있습니다.
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            alert(`팀이 성공적으로 삭제되었습니다.`);
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.message || '팀 삭제에 실패했습니다.';
            alert(errorMessage);
        },
    });
};

/**
 * 팀에 참가하는 뮤테이션 훅
 */
export const useJoinTeam = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: teamAPI.joinTeam,
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            // 참가 성공 시, 참가한 팀의 정보를 응답으로 받아 활용할 수 있습니다.
            alert(`'${response.data.teamName}' 팀에 성공적으로 참가했습니다!`);
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.message || '팀 참가에 실패했습니다.';
            alert(errorMessage);
        },
    });
};