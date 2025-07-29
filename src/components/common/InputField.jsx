import React, { useState } from "react";
import "../../styles/css/InputField.css";

const InputField = ({ type, placeholder, name }) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  const handleToggle = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="input-wrapper">
      <input
        type={inputType}
        placeholder={placeholder}
        name={name}
        className="input-field"
        autoComplete={type === "password" ? "current-password" : "off"}
      />
      {isPassword && (
        <button
          type="button"
          className="toggle-visibility"
          onClick={handleToggle}
          aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
        >
          <img
            src={
              showPassword
                ? "/assets/icons/eye-closed.svg"
                : "/assets/icons/eye-open.svg"
            }
            alt={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
          />
        </button>
      )}
    </div>
  );
};

export default InputField;
