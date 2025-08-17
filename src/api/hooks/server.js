import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import {
  registerFrontServer,
  registerBackendServer,
  registerDatabaseServer,
  getServers,
  deleteFrontServer,
  deleteBackServer,
  deleteDatabaseServer,
  updateFrontServer,
  updateBackServer,
  updateDatabaseServer,
} from "../apis/server";

export const useServerActions = () => {
  const queryClient = useQueryClient();
  const { teamCode } = useParams(); // 팀 코드 가져오기

  const { data: servers, isLoading: isLoadingServers } = useQuery({
    queryKey: ["servers", teamCode],
    queryFn: () => getServers(teamCode),
    enabled: !!teamCode,
    select: (res) => res?.data,
  });

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["servers", teamCode] });
  };

  const useServerMutation = (mutationFn, type, action) =>
    useMutation({
      mutationFn,
      onSuccess: handleSuccess,
      onError: (err) => {
        console.error(`${type} 서버 ${action} 실패:`, err);
        alert(`${type} 서버 ${action}에 실패했습니다.`);
      },
    });

  // 등록
  const { mutate: registerFront, isPending: isRegisteringFront } =
    useServerMutation(registerFrontServer, "프론트", "등록");
  const { mutate: registerBackend, isPending: isRegisteringBack } =
    useServerMutation(registerBackendServer, "백엔드", "등록");
  const { mutate: registerDB, isPending: isRegisteringDB } = useServerMutation(
    registerDatabaseServer,
    "DB",
    "등록"
  );

  // 삭제
  const { mutate: removeFrontServer, isPending: isRemovingFrontServer } =
    useServerMutation(deleteFrontServer, "프론트", "삭제");
  const { mutate: removeBackServer, isPending: isRemovingBackServer } =
    useServerMutation(deleteBackServer, "백엔드", "삭제");
  const { mutate: removeDatabaseServer, isPending: isRemovingDatabaseServer } =
    useServerMutation(deleteDatabaseServer, "DB", "삭제");

  // 수정
  const { mutate: updateFront, isPending: isUpdatingFront } = useServerMutation(
    updateFrontServer,
    "프론트",
    "수정"
  );
  const { mutate: updateBack, isPending: isUpdatingBack } = useServerMutation(
    updateBackServer,
    "백엔드",
    "수정"
  );
  const { mutate: updateDB, isPending: isUpdatingDB } = useServerMutation(
    updateDatabaseServer,
    "DB",
    "수정"
  );

  return {
    servers,
    isLoadingServers,

    // 등록
    registerFront,
    registerBackend,
    registerDB,

    // 삭제
    removeFrontServer,
    removeBackServer,
    removeDatabaseServer,

    // 수정
    updateFront,
    updateBack,
    updateDB,

    // 상태
    isRegisteringFront,
    isRegisteringBack,
    isRegisteringDB,

    isRemovingFrontServer,
    isRemovingBackServer,
    isRemovingDatabaseServer,

    isUpdatingFront,
    isUpdatingBack,
    isUpdatingDB,
  };
};
