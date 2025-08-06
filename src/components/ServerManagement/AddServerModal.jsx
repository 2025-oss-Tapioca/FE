import React, { useState } from "react";
import "../../styles/css/AddServerModal.css";

const SERVER_TYPES = ["frontend", "backend", "database"];

const AddServerModal = ({ onClose, onSubmit }) => {
  const [serverType, setServerType] = useState("");

  const [formData, setFormData] = useState({
    // 공통
    teamCode: "",
    ec2Host: "",
    auth_token: "",

    // 프론트, 백엔드
    entryPoint: "/",
    os: "ubuntu",
    env: "prod",
    protocol: "http",

    // 백엔드 전용
    login_path: "",

    // DB
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

  const handleSubmit = () => {
    if (!serverType) return alert("서버 유형을 선택해주세요.");

    let payload = { type: serverType };

    if (serverType === "frontend") {
      payload = {
        teamCode: formData.teamCode,
        ec2Host: formData.ec2Host,
        auth_token: formData.auth_token,
        entryPoint: formData.entryPoint,
        os: formData.os,
        env: formData.env,
        protocol: formData.protocol,
        type: "frontend",
      };
    } else if (serverType === "backend") {
      payload = {
        login_path: formData.login_path,
        ec2_url: formData.ec2Host,
        auth_token: formData.auth_token,
        os: formData.os,
        env: formData.env,
        type: "backend",
      };
    } else if (serverType === "database") {
      payload = {
        teamCode: formData.teamCode,
        dbAddress: formData.dbAddress,
        dbUser: formData.dbUser,
        password: formData.password,
        dbName: formData.dbName,
        dbPort: formData.dbPort,
        rdsInstanceId: formData.rdsInstanceId,
        awsRegion: formData.awsRegion,
        roleArn: formData.roleArn,
        type: "database",
      };
    }

    onSubmit(payload);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>새 서버 추가</h2>

        {/* 서버 유형 선택 */}
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

        {/* 서버 유형에 따른 입력 필드 */}
        {serverType === "frontend" && (
          <>
            <label>Team Code</label>
            <input
              name="teamCode"
              value={formData.teamCode}
              onChange={handleInputChange}
            />

            <label>EC2 Host</label>
            <input
              name="ec2Host"
              value={formData.ec2Host}
              onChange={handleInputChange}
            />

            <label>Auth Token</label>
            <input
              name="auth_token"
              value={formData.auth_token}
              onChange={handleInputChange}
            />

            <div className="modal-input-row">
              <div className="modal-group">
                <label>Entry Point</label>
                <input
                  name="entryPoint"
                  value={formData.entryPoint}
                  onChange={handleInputChange}
                />
              </div>
              <div className="modal-group">
                <label>OS</label>
                <input
                  name="os"
                  value={formData.os}
                  onChange={handleInputChange}
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
                />
              </div>
              <div className="modal-group">
                <label>Protocol</label>
                <input
                  name="protocol"
                  value={formData.protocol}
                  onChange={handleInputChange}
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
            />

            <label>EC2 URL</label>
            <input
              name="ec2Host"
              value={formData.ec2Host}
              onChange={handleInputChange}
            />

            <label>Auth Token</label>
            <input
              name="auth_token"
              value={formData.auth_token}
              onChange={handleInputChange}
            />
            <div className="modal-input-row">
              <div className="modal-group">
                <label>OS</label>
                <input
                  name="os"
                  value={formData.os}
                  onChange={handleInputChange}
                />
              </div>
              <div className="modal-group">
                <label>ENV</label>
                <input
                  name="env"
                  value={formData.env}
                  onChange={handleInputChange}
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
            />

            <label>DB Address</label>
            <input
              name="dbAddress"
              value={formData.dbAddress}
              onChange={handleInputChange}
            />

            <div className="modal-input-row">
              <div className="modal-group">
                <label>DB User</label>
                <input
                  name="dbuser"
                  value={formData.dbUser}
                  onChange={handleInputChange}
                />
              </div>
              <div className="modal-group">
                <label>Password</label>
                <input
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
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
                />
              </div>
              <div className="modal-group">
                <label>DB Port</label>
                <input
                  name="dbPort"
                  value={formData.passwdbPortord}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <label>RDS Instance ID</label>
            <input
              name="rdsInstanceId"
              value={formData.rdsInstanceId}
              onChange={handleInputChange}
            />

            <label>AWS Region</label>
            <input
              name="awsRegion"
              value={formData.awsRegion}
              onChange={handleInputChange}
            />

            <label>Role ARN</label>
            <input
              name="roleArn"
              value={formData.roleArn}
              onChange={handleInputChange}
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
