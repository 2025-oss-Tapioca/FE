import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  registerFrontServer,
  registerBackendServer,
  registerDatabaseServer,
  getServers,
} from "../apis/server";

export const useServerActions = () => {
  const queryClient = useQueryClient();

  // ✅ teamCode를 localStorage에서 가져옴
  const teamCode = localStorage.getItem("teamCode");

  // ✅ 서버 목록 조회
  const { data: servers, isLoading: isLoadingServers } = useQuery({
    queryKey: ["servers", teamCode],
    queryFn: () => getServers(teamCode),
    enabled: !!teamCode,
    select: (res) => res?.data,
  });

  // ✅ 프론트 서버 등록
  const { mutate: registerFront, isPending: isRegisteringFront } = useMutation({
    mutationFn: registerFrontServer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servers", teamCode] });
    },
    onError: (err) => {
      console.error("프론트 등록 실패:", err);
      throw err;
    },
  });

  // ✅ 백엔드 서버 등록
  const { mutate: registerBackend, isPending: isRegisteringBack } = useMutation(
    {
      mutationFn: registerBackendServer,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["servers", teamCode] });
      },
      onError: (err) => {
        console.error("백엔드 등록 실패:", err);
        throw err;
      },
    }
  );

  // ✅ DB 서버 등록
  const { mutate: registerDB, isPending: isRegisteringDB } = useMutation({
    mutationFn: registerDatabaseServer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servers", teamCode] });
    },
    onError: (err) => {
      console.error("DB 등록 실패:", err);
      throw err;
    },
  });

  return {
    servers,
    isLoadingServers,
    registerFront,
    registerBackend,
    registerDB,
    isRegisteringFront,
    isRegisteringBack,
    isRegisteringDB,
  };
};
