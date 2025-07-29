import "../../styles/css/navButton.css";

export default function NavButton({ icon, label, active, onClick }) {
  return (
    <button className={`button ${active ? "active" : ""}`} onClick={onClick}>
      {icon}
      <span>{label}</span>
    </button>
  );
}
