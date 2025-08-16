import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  registerFrontServer,
  registerBackendServer,
  registerDatabaseServer,
  getServers,
  deleteFrontServer,
  deleteBackServer,
  deleteDatabaseServer,
} from "../apis/server";

export const useServerActions = () => {
  const queryClient = useQueryClient();
  const teamCode = localStorage.getItem("teamCode");

  const { data: servers, isLoading: isLoadingServers } = useQuery({
    queryKey: ["servers", teamCode],
    queryFn: () => getServers(teamCode),
    enabled: !!teamCode,
    select: (res) => res?.data,
  });

  // 공통 onSuccess
  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["servers", teamCode] });
  };

  // 프론트 서버 등록
  const { mutate: registerFront, isPending: isRegisteringFront } = useMutation({
    mutationFn: registerFrontServer,
    onSuccess: handleSuccess,
    onError: (err) => {
      console.error("프론트 등록 실패:", err);
      alert("프론트 등록에 실패했습니다.");
    },
  });

  // 백엔드 서버 등록
  const { mutate: registerBackend, isPending: isRegisteringBack } = useMutation(
    {
      mutationFn: registerBackendServer,
      onSuccess: handleSuccess,
      onError: (err) => {
        console.error("백엔드 등록 실패:", err);
        alert("백엔드 등록에 실패했습니다.");
      },
    }
  );

  // DB 서버 등록
  const { mutate: registerDB, isPending: isRegisteringDB } = useMutation({
    mutationFn: registerDatabaseServer,
    onSuccess: handleSuccess,
    onError: (err) => {
      console.error("DB 등록 실패:", err);
      alert("DB 등록에 실패했습니다.");
    },
  });

  // 프론트 서버 삭제
  const { mutate: removeFrontServer, isPending: isRemovingFrontServer } =
    useMutation({
      mutationFn: deleteFrontServer,
      onSuccess: handleSuccess,
      onError: (err) => {
        console.error("프론트 서버 삭제 실패:", err);
        alert("프론트 서버 삭제에 실패했습니다.");
      },
    });

  // 백엔드 서버 삭제
  const { mutate: removeBackServer, isPending: isRemovingBackServer } =
    useMutation({
      mutationFn: deleteBackServer,
      onSuccess: handleSuccess,
      onError: (err) => {
        console.error("백엔드 서버 삭제 실패:", err);
        alert("백엔드 서버 삭제에 실패했습니다.");
      },
    });

  // DB 서버 삭제
  const { mutate: removeDatabaseServer, isPending: isRemovingDatabaseServer } =
    useMutation({
      mutationFn: deleteDatabaseServer,
      onSuccess: handleSuccess,
      onError: (err) => {
        console.error("DB 서버 삭제 실패:", err);
        alert("DB 서버 삭제에 실패했습니다.");
      },
    });

  return {
    servers,
    isLoadingServers,

    registerFront,
    registerBackend,
    registerDB,

    removeFrontServer,
    removeBackServer,
    removeDatabaseServer,

    isRegisteringFront,
    isRegisteringBack,
    isRegisteringDB,

    isRemovingFrontServer,
    isRemovingBackServer,
    isRemovingDatabaseServer,
  };
};
