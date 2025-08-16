// hooks/server.js
import { useMutation } from "@tanstack/react-query";
import {
  registerFrontServer,
  registerBackendServer,
  registerDatabaseServer,
} from "../apis/server";

export const useServerActions = () => {
  const { mutate: registerFront, isPending: isRegisteringFront } = useMutation({
    mutationFn: registerFrontServer,
    onSuccess: () => alert("프론트 서버 등록 성공!"),
    onError: (err) => {
      console.error("프론트 등록 실패:", err);
      alert("프론트 등록 중 오류 발생");
    },
  });

  const { mutate: registerBackend, isPending: isRegisteringBack } = useMutation(
    {
      mutationFn: registerBackendServer,
      onSuccess: () => alert("백엔드 서버 등록 성공!"),
      onError: (err) => {
        console.error("백엔드 등록 실패:", err);
        alert("백엔드 등록 중 오류 발생");
      },
    }
  );

  const { mutate: registerDB, isPending: isRegisteringDB } = useMutation({
    mutationFn: registerDatabaseServer,
    onSuccess: () => alert("DB 서버 등록 성공!"),
    onError: (err) => {
      console.error("DB 등록 실패:", err);
      alert("DB 등록 중 오류 발생");
    },
  });

  return {
    registerFront,
    registerBackend,
    registerDB,
    isRegisteringFront,
    isRegisteringBack,
    isRegisteringDB,
  };
};
