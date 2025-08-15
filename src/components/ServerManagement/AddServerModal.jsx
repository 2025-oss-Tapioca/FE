import React, { useState } from "react";
import "../../styles/css/AddServerModal.css";

const SERVER_TYPES = ["frontend", "backend", "database"];

const AddServerModal = ({ onClose, onSubmit, teamCode }) => {
  const [serverType, setServerType] = useState("");

  // ✅ teamCode prop을 초기값으로 설정합니다.
  const [formData, setFormData] = useState({
    teamCode: teamCode || "",
    ec2Host: "",
    auth_token: "",
    entryPoint: "/",
    os: "ubuntu",
    env: "prod",
    protocol: "http",
    login_path: "",
    dbAddress: "",
    dbUser: "",
    password: "",
    dbName: "",
    dbPort: "3306",
    rdsInstanceId: "",
    awsRegion: "ap-northeast-2",
    roleArn: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ handleSubmit 로직을 간소화합니다.
  const handleSubmit = () => {
    if (!serverType) return alert("서버 유형을 선택해주세요.");

    // formData에 type만 추가하여 onSubmit에 전달합니다.
    const payload = { ...formData, type: serverType };
    onSubmit(payload);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>새 서버 추가</h2>
        <label>서버 유형</label>
        <select
          value={serverType}
          onChange={(e) => setServerType(e.target.value)}
        >
          <option value="" disabled hidden>
            선택하세요
          </option>
          {SERVER_TYPES.map((type) => (
            <option key={type} value={type}>
              {type.toUpperCase()}
            </option>
          ))}
        </select>

        {serverType === "frontend" && (
          <>
            <label>Team Code</label>
            <input
              name="teamCode"
              value={formData.teamCode}
              onChange={handleInputChange}
              readOnly
              autoComplete="off"
            />
            <label>EC2 Host</label>
            <input
              name="ec2Host"
              value={formData.ec2Host}
              onChange={handleInputChange}
              autoComplete="off"
            />
            <label>Auth Token</label>
            <input
              name="auth_token"
              value={formData.auth_token}
              onChange={handleInputChange}
              autoComplete="off"
            />
            <div className="modal-input-row">
              <div className="modal-group">
                <label>Entry Point</label>
                <input
                  name="entryPoint"
                  value={formData.entryPoint}
                  onChange={handleInputChange}
                  autoComplete="off"
                />
              </div>
              <div className="modal-group">
                <label>OS</label>
                <input
                  name="os"
                  value={formData.os}
                  onChange={handleInputChange}
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="modal-input-row">
              <div className="modal-group">
                <label>ENV</label>
                <input
                  name="env"
                  value={formData.env}
                  onChange={handleInputChange}
                  autoComplete="off"
                />
              </div>
              <div className="modal-group">
                <label>Protocol</label>
                <input
                  name="protocol"
                  value={formData.protocol}
                  onChange={handleInputChange}
                  autoComplete="off"
                />
              </div>
            </div>
          </>
        )}

        {serverType === "backend" && (
          <>
            <label>Login Path</label>
            <input
              name="login_path"
              value={formData.login_path}
              onChange={handleInputChange}
              autoComplete="off"
            />
            <label>EC2 URL</label>
            <input
              name="ec2Host"
              value={formData.ec2Host}
              onChange={handleInputChange}
              autoComplete="off"
            />
            <label>Auth Token</label>
            <input
              name="auth_token"
              value={formData.auth_token}
              onChange={handleInputChange}
              autoComplete="off"
            />
            <div className="modal-input-row">
              <div className="modal-group">
                <label>OS</label>
                <input
                  name="os"
                  value={formData.os}
                  onChange={handleInputChange}
                  autoComplete="off"
                />
              </div>
              <div className="modal-group">
                <label>ENV</label>
                <input
                  name="env"
                  value={formData.env}
                  onChange={handleInputChange}
                  autoComplete="off"
                />
              </div>
            </div>
          </>
        )}

        {serverType === "database" && (
          <>
            <label>Team Code</label>
            <input
              name="teamCode"
              value={formData.teamCode}
              onChange={handleInputChange}
              readOnly
              autoComplete="off"
            />
            <label>DB Address</label>
            <input
              name="dbAddress"
              value={formData.dbAddress}
              onChange={handleInputChange}
              autoComplete="off"
            />
            <div className="modal-input-row">
              <div className="modal-group">
                <label>DB User</label>
                <input
                  name="dbUser"
                  value={formData.dbUser}
                  onChange={handleInputChange}
                  autoComplete="off"
                />
              </div>
              <div className="modal-group">
                <label>Password</label>
                <input
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="modal-input-row">
              <div className="modal-group">
                <label>DB Name</label>
                <input
                  name="dbName"
                  value={formData.dbName}
                  onChange={handleInputChange}
                  autoComplete="off"
                />
              </div>
              <div className="modal-group">
                <label>DB Port</label>
                <input
                  name="dbPort"
                  value={formData.dbPort}
                  onChange={handleInputChange}
                  autoComplete="off"
                />
              </div>
            </div>
            <label>RDS Instance ID</label>
            <input
              name="rdsInstanceId"
              value={formData.rdsInstanceId}
              onChange={handleInputChange}
              autoComplete="off"
            />
            <label>AWS Region</label>
            <input
              name="awsRegion"
              value={formData.awsRegion}
              onChange={handleInputChange}
              autoComplete="off"
            />
            <label>Role ARN</label>
            <input
              name="roleArn"
              value={formData.roleArn}
              onChange={handleInputChange}
              autoComplete="off"
            />
          </>
        )}

        <div className="modal-actions">
          <button onClick={onClose}>취소</button>
          <button onClick={handleSubmit} disabled={!serverType}>
            추가
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddServerModal;
