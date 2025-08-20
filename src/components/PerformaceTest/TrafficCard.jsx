import React from "react";
import MethodBadge from "../common/MethodBadge";
import { CheckCircle, AlertCircle } from "lucide-react";
import "../../styles/css/PerformanceTest.css";

export default function TrafficCard({ trafficData }) {
  console.log("TrafficCard received trafficData:", trafficData);

  // 데이터 유효성 검사
  if (!trafficData || !trafficData.summary || !trafficData.inputs) {
    return <div>트래픽 데이터를 표시할 수 없습니다.</div>;
  }

  // 1. 전달받은 trafficData 객체에서 inputs와 summary를 꺼냅니다.
  const { inputs, summary } = trafficData;
  // 2. 각각의 객체에서 필요한 값을 최종적으로 추출합니다.
  const { method, url } = inputs;
  const { requests, bytes } = summary;

  const isSuccess = requests > 0;
  const formatBytes = (value) => {
    if (typeof value !== 'number' || value === 0) return "0 B";
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(value) / Math.log(k));
    return parseFloat((value / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`performance-card ${isSuccess ? "success" : "failure"}`}>
      <div className="card-header">
        <div className="badges-left">
          <span className={`badge status ${isSuccess ? "success" : "failure"}`}>
            {isSuccess ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
            <span className="status-text">{isSuccess ? "완료" : "실패"}</span>
          </span>
          {/* 3. 이제 method 값을 정상적으로 사용할 수 있습니다. */}
          <MethodBadge type="method" value={method} />
        </div>
        <div className="badges-right">
          <span className="badge type-badge-traffic">TRAFFIC</span>
        </div>
      </div>

      <span className="request-header">
        {/* 4. url 값도 정상적으로 사용할 수 있습니다. */}
        API URL : <span className="request-url">{url}</span>
      </span>

      <div className="response-meta">
        <div className="response-meta-row">
          <div>총 요청 수: <strong>{requests}</strong></div>
        </div>
        <div className="response-meta-row">
          <div>총 수신량: <strong>{formatBytes(bytes.in.total)}</strong></div>
          <div>평균 수신량: <strong>{formatBytes(bytes.in.mean)}</strong></div>
        </div>
        <div className="response-meta-row">
          <div>총 송신량: <strong>{formatBytes(bytes.out.total)}</strong></div>
          <div>평균 송신량: <strong>{formatBytes(bytes.out.mean)}</strong></div>
        </div>
      </div>
    </div>
  );
}