import "../../styles/css/CustomButton.css";

const CustomButton = ({ text, className = "", isValid = false, onClick }) => {
  return (
    <button
      className={`custom-button ${className}  ${isValid ? "isValid" : ""}`}
      isValid={isValid}
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export default CustomButton;
