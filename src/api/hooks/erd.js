import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as erdAPI from '../apis/erd';

const erdKey = (teamCode) => ['erd', teamCode];

export const useGetERD = (teamCode) =>
  useQuery({
    queryKey: erdKey(teamCode),
    queryFn: () => erdAPI.getERD(teamCode),
    enabled: !!teamCode,                       // teamCode 있을 때만 호출
    // 서버가 { success, data } 래핑이면 아래 select가 실제 데이터만 꺼내줌
    select: (res) => res?.data?.data ?? res?.data,
    staleTime: 60_000,
  });

export const useSaveERD = (teamCode) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => erdAPI.updateERD(teamCode, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: erdKey(teamCode) }),
  });
};
