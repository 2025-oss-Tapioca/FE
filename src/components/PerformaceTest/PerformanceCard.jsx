import React from "react";
import MethodBadge from "../common/MethodBadge";
import { CheckCircle, AlertCircle } from "lucide-react";
import "../../styles/css/PerformanceTest.css";

const PerformanceCard = ({ method, url, responseTime, statusCode }) => {
  const isSuccess = statusCode >= 200 && statusCode < 400;

  return (
    <div className={`performance-card ${isSuccess ? "success" : "failure"}`}>
      <div className="card-header">
        <div className="badges">
          <span className={`badge status ${isSuccess ? "success" : "failure"}`}>
            {isSuccess ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
            <span className="status-text">{isSuccess ? "완료" : "실패"}</span>
          </span>
          {/* badge */}
          <MethodBadge type="method" value={method} />
        </div>
      </div>

      <div className="request-url">{url}</div>

      <div className="response-meta">
        <span className={`response-time ${!isSuccess ? "error" : ""}`}>
          응답시간 : <strong>{responseTime}ms</strong>
        </span>
        <span className={`status-code ${!isSuccess ? "error" : ""}`}>
          상태코드 : <strong className="code">{statusCode}</strong>
        </span>
      </div>
    </div>
  );
};

export default PerformanceCard;
