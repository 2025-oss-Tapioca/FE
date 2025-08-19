import React, { useState, useMemo, useEffect } from "react";
import InputField from "../components/common/InputField";
import { useNavigate } from "react-router-dom";
import CustomButton from "../components/common/CustomButton";
import { validatePassword } from "../utils/validator";
import { useSignup } from "../api/hooks/auth";
import "../styles/css/SignUp.css";

const SignupPage = () => {
  const nav = useNavigate();
  const { mutate: signupUser } = useSignup();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [pwError, setPwError] = useState(false);
  const [pwConfirmError, setPwConfirmError] = useState("");
  const [allChecked, setAllChecked] = useState(false);
  const [agreements, setAgreements] = useState([
    { id: 1, label: "[필수] 이용약관 동의", required: true, checked: false },
    {
      id: 2,
      label: "[필수] 개인정보 수집 및 이용 동의",
      required: true,
      checked: false,
    },
    {
      id: 3,
      label: "[선택] 개인정보 수집 및 이용 동의",
      required: false,
      checked: false,
    },
  ]);

  const isFormValid = useMemo(() => {
    const requiredChecked = agreements
      .filter((a) => a.required)
      .every((a) => a.checked);
    return (
      form.name &&
      form.email &&
      form.password &&
      form.passwordConfirm &&
      !emailError &&
      !pwError &&
      !pwConfirmError &&
      requiredChecked
    );
  }, [form, emailError, pwError, pwConfirmError, agreements]);

  useEffect(() => {
    if (form.passwordConfirm) {
      setPwConfirmError(
        form.password !== form.passwordConfirm
          ? "비밀번호가 일치하지 않습니다."
          : ""
      );
    }
  }, [form.password, form.passwordConfirm]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "email") {
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      setEmailError(valid ? "" : "올바른 이메일 형식을 입력해주세요.");
    }

    if (name === "password") {
      setPwError(value && !validatePassword(value));
    }
  };

  const toggle = (setter) => setter((prev) => !prev);

  const handleAllChange = (e) => {
    const checked = e.target.checked;
    setAllChecked(checked);
    setAgreements((prev) => prev.map((a) => ({ ...a, checked })));
  };

  const handleSingleChange = (id) => (e) => {
    const checked = e.target.checked;
    setAgreements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, checked } : a))
    );
  };

  useEffect(() => {
    const all = agreements.every((a) => a.checked);
    setAllChecked(all);
  }, [agreements]);

  const handleSubmit = (e) => {
    e.preventDefault();
    signupUser({
      loginId: form.loginId,
      password: form.password,
      name: form.name,
      email: form.email,
    });
  };
  return (
    <div className="signup-page">
      <div className="signup-card">
        <button className="back-button" onClick={() => nav(-1)}>
          <img src="/assets/icons/arrow-left.svg" alt="뒤로가기" />
        </button>

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">이름</label>
            <InputField
              type="text"
              name="name"
              placeholder="이름"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="name">아이디</label>
            <InputField
              type="text"
              name="loginId"
              placeholder="아이디"
              value={form.loginId}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <InputField
              type="email"
              name="email"
              placeholder="이메일"
              value={form.email}
              onChange={handleChange}
            />
            {emailError && <p className="error-text">{emailError}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <InputField
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="영문, 숫자, 특수문자 포함 8~16자"
              value={form.password}
              onChange={handleChange}
              hasError={pwError}
              toggleVisibility={() => toggle(setShowPassword)}
              showPassword={showPassword}
            />
            {pwError && (
              <p className="error-text">
                영문, 숫자, 특수문자 포함 8~16자 입력해주세요.
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="passwordConfirm">비밀번호 확인</label>
            <InputField
              type={showPasswordConfirm ? "text" : "password"}
              name="passwordConfirm"
              placeholder="비밀번호 확인"
              value={form.passwordConfirm}
              onChange={handleChange}
              hasError={!!pwConfirmError}
              toggleVisibility={() => toggle(setShowPasswordConfirm)}
              showPassword={showPasswordConfirm}
            />
            {pwConfirmError && <p className="error-text">{pwConfirmError}</p>}
          </div>

          <div className="terms-box">
            <div className="checkbox-all">
              <input
                type="checkbox"
                id="agree-all"
                checked={allChecked}
                onChange={handleAllChange}
              />
              <label htmlFor="agree-all">
                <strong>모두 동의합니다.</strong>
                <span className="subtext">선택 동의 항목 포함</span>
              </label>
            </div>

            {agreements.map((a) => (
              <div className="checkbox-item" key={a.id}>
                <input
                  type="checkbox"
                  id={`agree-${a.id}`}
                  checked={a.checked}
                  onChange={handleSingleChange(a.id)}
                />
                <label htmlFor={`agree-${a.id}`}>{a.label}</label>
              </div>
            ))}
          </div>

          <CustomButton
            type="submit"
            className="btn-next"
            text="다음"
            isValid={isFormValid}
          />
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
