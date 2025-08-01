import React, { useState } from "react";
import "../../styles/css/AddServerModal.css";

const AddServerModal = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({
    name: "",
    url: "",
    admin: "",
    password: "",
  });

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = () => {
    if (!form.name || !form.url) {
      alert("서버 이름과 도메인 주소는 필수입니다.");
      return;
    }
    onAdd(form);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <h2 className="modal-title">새 서버 추가</h2>

        {/* 서버 이름 */}
        <div className="modal-group">
          <label>서버 이름</label>
          <input
            placeholder="ex) 메인 데이터베이스"
            value={form.name}
            onChange={handleChange("name")}
          />
        </div>

        {/* 도메인 주소 */}
        <div className="modal-group">
          <label>도메인 주소</label>
          <input
            placeholder="ex) http://localhost:3000"
            value={form.url}
            onChange={handleChange("url")}
          />
        </div>

        {/* Admin 이름 + 비밀번호 */}
        <div className="modal-input-row">
          <div className="modal-group">
            <label>Admin 이름</label>
            <input
              placeholder="ex) admin"
              value={form.admin}
              onChange={handleChange("admin")}
            />
          </div>
          <div className="modal-group">
            <label>비밀번호</label>
            <input
              type="password"
              placeholder="비밀번호"
              value={form.password}
              onChange={handleChange("password")}
            />
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="modal-actions">
          <button onClick={onClose} className="cancel-btn">
            취소
          </button>
          <button onClick={handleSubmit} className="submit-btn">
            서버 추가
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddServerModal;
