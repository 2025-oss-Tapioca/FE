// hooks/auth.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as authAPI from "../apis/auth";
import { useNavigate } from "react-router-dom";

/**
 * 로그인 요청 훅
 */
export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate(); // 👉 이동을 위해 필요

  return useMutation({
    mutationFn: authAPI.login,
    onSuccess: async (loginResponse) => {
      const res = loginResponse;

      if (res.success) {
        localStorage.setItem("accessToken", res.data.accessToken); // 토큰 저장
        alert("로그인 성공!");

        await queryClient.invalidateQueries({ queryKey: ["user"] }); // 캐시 갱신
        navigate("/team"); // 👉 원하는 페이지로 이동
      } else {
        alert("로그인 실패: 아이디 또는 비밀번호를 확인해주세요.");
      }
    },
    onError: (err) => {
      console.error("로그인 실패:", err);
      alert("서버 오류가 발생했습니다.");
    },
  });
};

/**
 * 회원가입 요청 훅
 */
export const useSignup = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authAPI.signup,
    onSuccess: (res) => {
      if (res.success) {
        alert("회원가입이 완료되었습니다!");
        navigate("/auth/login"); // ✅ 로그인 페이지로 이동
      } else {
        alert("회원가입 실패: 입력 정보를 확인해주세요.");
      }
    },
    onError: (err) => {
      console.error("회원가입 실패:", err);
      alert("회원가입 중 서버 오류가 발생했습니다.");
    },
  });
};
