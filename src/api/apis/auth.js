// apis/auth.js
import client from "../utils/axios";

/**
 * 로그인 요청
 * @param {{ email: string, password: string }} payload
 */

export const login = (payload) => {
  return client.post("/api/login", payload);
};

/**
 * 회원가입 요청
 * @param {{ name: string, email: string, password: string }} payload
 */
export const signup = (payload) => {
  return client.post("/api/signup", payload);
};
