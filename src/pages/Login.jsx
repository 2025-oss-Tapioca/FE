import React, { useState } from "react";
import "../styles/css/login.css";
import InputField from "../components/common/InputField";
import { Link } from "react-router-dom";
import { useLogin } from "../api/hooks/auth";

const LoginPage = () => {
  const { mutate: loginUser, isPending } = useLogin(); // ✅ 하나만 사용
  const [form, setForm] = useState({
    loginId: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  // ✅ input 값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ 비밀번호 보이기/숨기기
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // ✅ 로그인 폼 제출
  const handleSubmit = (e) => {
    e.preventDefault();
    loginUser(form); // { loginId, password }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* 헤더 */}
        <div className="login-header">
          <p className="signin-text">Sign in to</p>
          <div className="logo-title">
            <img
              src="/assets/logo.svg"
              alt="Tapioca logo"
              className="login-logo"
            />
            <span className="highlight">TAPIOCA</span>
          </div>
        </div>

        {/* 폼 */}
        <form className="login-form" onSubmit={handleSubmit}>
          <InputField
            type="login"
            placeholder="이메일"
            name="loginId"
            autoComplete="off"
            value={form.loginId} // ✅ 수정
            onChange={handleChange}
          />
          <InputField
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="비밀번호"
            value={form.password}
            autoComplete="off"
            onChange={handleChange}
            showPassword={showPassword}
            toggleVisibility={togglePasswordVisibility}
          />

          <div className="login-remember">
            <input type="checkbox" id="remember" />
            <label htmlFor="remember">로그인 상태 유지</label>
          </div>

          {/* 하단 링크 */}
          <div className="login-links">
            <a href="#">이메일 찾기</a>
            <span>|</span>
            <a href="#">비밀번호 찾기</a>
          </div>

          <button type="submit" className="btn-login" disabled={isPending}>
            {isPending ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <div className="login-register">
          아직 계정이 없으신가요?{" "}
          <Link to="/auth/signup" className="link-signup">
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
