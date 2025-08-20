import React from "react";
import "../../styles/css/InputField.css";

const InputField = ({
  type,
  placeholder,
  name,
  value,
  onChange,
  hasError = false,
  toggleVisibility,
  showPassword,
}) => {
  const isPassword = name === "password" || name === "passwordConfirm";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="input-wrapper">
      <input
        type={inputType}
        placeholder={placeholder}
        name={name}
        value={value}
        onChange={onChange}
        className={`input-field ${hasError ? "input-error" : ""}`}
        autoComplete={type === "password" ? "new-password" : "off"}
      />
      {isPassword && (
        <button
          type="button"
          className="toggle-visibility"
          onClick={toggleVisibility}
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
