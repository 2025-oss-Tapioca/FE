import React, { useState } from "react";
import "../../styles/css/AddServerModal.css"; // 스타일 재사용

const EditServerModal = ({ onClose, onSubmit, initialData, serverType }) => {
  const [formData, setFormData] = useState({
    ...{
      teamCode: "",
      ec2Host: "",
      authToken: "",
      entryPoint: "/",
      os: "ubuntu",
      env: "prod",
      protocol: "http",
      loginPath: "",
      ec2Url: "",
      dbAddress: "",
      dbUser: "",
      password: "",
      dbName: "",
      dbPort: "3306",
      rdsInstanceId: "",
      awsRegion: "ap-northeast-2",
      roleArn: "",
    },
    ...initialData,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isFormValid = (() => {
    if (serverType === "frontend") {
      return (
        formData.teamCode &&
        formData.ec2Host &&
        formData.authToken &&
        formData.entryPoint &&
        formData.os &&
        formData.env &&
        formData.protocol
      );
    }

    if (serverType === "backend") {
      return (
        formData.teamCode &&
        formData.ec2Url &&
        formData.authToken &&
        formData.loginPath &&
        formData.os &&
        formData.env
      );
    }

    if (serverType === "database") {
      return (
        formData.teamCode &&
        formData.dbAddress &&
        formData.dbUser &&
        formData.password &&
        formData.dbName &&
        formData.dbPort &&
        formData.rdsInstanceId &&
        formData.awsRegion &&
        formData.roleArn
      );
    }

    return false;
  })();

  const handleSubmit = () => {
    onSubmit({ ...formData, type: serverType });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>서버 수정</h2>

        {serverType === "frontend" && (
          <>
            <label>Team Code</label>
            <input name="teamCode" value={formData.teamCode} readOnly />
            <label>EC2 Host</label>
            <input
              name="ec2Host"
              value={formData.ec2Host}
              onChange={handleInputChange}
              autoComplete="off"
            />
            <label>Auth Token</label>
            <input
              name="authToken"
              value={formData.authToken}
              onChange={handleInputChange}
              autoComplete="off"
              type="password"
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
            <label>Team Code</label>
            <input name="teamCode" value={formData.teamCode} readOnly />
            <label>Login Path</label>
            <input
              name="loginPath"
              value={formData.loginPath}
              onChange={handleInputChange}
              autoComplete="off"
            />
            <label>EC2 URL</label>
            <input
              name="ec2Url"
              value={formData.ec2Url}
              onChange={handleInputChange}
              autoComplete="off"
            />
            <label>Auth Token</label>
            <input
              name="authToken"
              value={formData.authToken}
              onChange={handleInputChange}
              type="password"
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
            <input name="teamCode" value={formData.teamCode} readOnly />
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
          <button onClick={handleSubmit} disabled={!isFormValid}>
            수정
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditServerModal;
