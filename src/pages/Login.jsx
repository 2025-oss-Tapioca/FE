import React, { useState } from "react";
import "../styles/css/Login.css";
import InputField from "../components/common/InputField";
import { Link } from "react-router-dom";

const LoginPage = () => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handlePasswordChange = (e) => setPassword(e.target.value);
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

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
        <form className="login-form">
          <InputField type="email" placeholder="이메일" name="email" />
          <InputField
            type="password"
            name="password"
            placeholder="비밀번호"
            value={password}
            onChange={handlePasswordChange}
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
          <button type="submit" className="btn-login">
            로그인
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
