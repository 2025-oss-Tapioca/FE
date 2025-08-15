import {
  useQuery,
  useQueries,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import * as teamAPI from "../apis/team"; // api/index.js 배럴 패턴을 사용한다고 가정

// --- 쿼리 훅 ---

/**
 * 팀 목록을 조회하는 쿼리 훅
 */
export const useGetTeam = () => {
  const { data: teamList = [], isSuccess: isListSuccess } = useQuery({
    queryKey: ["teams"],
    queryFn: teamAPI.getTeam,
    select: (response) => response.data,
  });

  const detailQueries = useQueries({
    queries: teamList.map((team) => {
      return {
        queryKey: ["team", team.teamCode],
        queryFn: () => teamAPI.getTeamByCode(team.teamCode),
        enabled: isListSuccess,
        select: (response) => response.data,
      };
    }),
  });

  const isDetailsLoading = detailQueries.some((query) => query.isLoading);
  const teamDetails = detailQueries
    .filter((query) => query.isSuccess)
    .map((query) => query.data);

  return {
    isLoading: isListSuccess ? isDetailsLoading : true,
    data: teamDetails,
  };
};

// --- 뮤테이션 훅 (수정 완료) ---

/**
 * 새로운 팀을 생성하는 뮤테이션 훅
 */
export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: teamAPI.createTeam,
    onSuccess: async (createResponse) => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      const newTeamCode = createResponse.data.teamCode;

      try {
        const detailResponse = await queryClient.fetchQuery({
          queryKey: ["team", newTeamCode],
          queryFn: () => teamAPI.getTeamByCode(newTeamCode),
        });
        console.log("팀 상세 정보 조회 성공:", detailResponse.data);

        // ✅ 조회한 상세 정보를 return 합니다.
        return detailResponse.data;
      } catch (error) {
        console.error("팀 상세 정보 조회 실패:", error);
        // 실패 시 에러를 다시 던져서 컴포넌트의 onError에서 잡을 수 있게 합니다.
        throw error;
      }
    },
    onError: (error) => {
      // 이 onError는 훅 레벨의 공통 에러 처리
      console.error("Mutation Error:", error);
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
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      alert(`팀이 성공적으로 삭제되었습니다.`);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "팀 삭제에 실패했습니다.";
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
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      // 참가 성공 시, 참가한 팀의 정보를 응답으로 받아 활용할 수 있습니다.
      alert(`'${response.data.teamName}' 팀에 성공적으로 참가했습니다!`);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "팀 참가에 실패했습니다.";
      alert(errorMessage);
    },
  });
};
