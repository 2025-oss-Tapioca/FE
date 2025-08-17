import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as githubAPI from '../apis/github';

export function useRegisterGithub() {
  return useMutation({
    mutationFn: (payload) => githubAPI.registerGithub(payload),
  });
}

const ghKey = (teamCode) => ['github', teamCode];

// 응답 평탄화 + 원문 보존
const wrap = (res) => {
  // res는 { success, data, error } 이거나 그 자체 데이터일 수 있음
  const hasDataField = res && typeof res === 'object' && 'data' in res;
  return {
    raw: res,
    data: hasDataField ? res.data : res, // success=false면 null일 수 있음
  };
};

export const useGetGithub = (teamCode) =>
  useQuery({
    queryKey: ghKey(teamCode),
    queryFn: () => githubAPI.getGithub(teamCode), // client가 data 반환
    enabled: !!teamCode,
    select: wrap,
    staleTime: 60_000,
  });

  // ✅ 추가: 업데이트 훅
export const useUpdateGithub = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => githubAPI.updateGithub(payload),
    onSuccess: (res, payload) => {
      // teamCode 기준으로 캐시 무효화
      if (payload?.teamCode) qc.invalidateQueries({ queryKey: ghKey(payload.teamCode) });
    },
  });
};

  export const useDeleteGithub = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (teamCode) => githubAPI.deleteGithub(teamCode),
    onSuccess: (_res, teamCode) => {
      // 조회 캐시 무효화(있으면)
      if (teamCode) qc.invalidateQueries({ queryKey: ghKey(teamCode) });
    },
  });
};
