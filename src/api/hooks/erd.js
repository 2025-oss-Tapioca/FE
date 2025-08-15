// src/api/hooks/erd.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as erdAPI from '../apis/erd';

const erdKey = (teamCode) => ['erd', teamCode];
const getData = (res) => (res && typeof res === 'object' && 'data' in res ? res.data : res);

// 조회
export const useGetERD = (teamCode) =>
  useQuery({
    queryKey: erdKey(teamCode),
    queryFn: () => erdAPI.getERD(teamCode), // client가 이미 data 반환
    enabled: !!teamCode,
    select: getData,                         // {success,data}든 원데이터든 커버
    staleTime: 60_000,
  });

// 저장
export const useSaveERD = (teamCode) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => erdAPI.updateERD(teamCode, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: erdKey(teamCode) }),
  });
};
