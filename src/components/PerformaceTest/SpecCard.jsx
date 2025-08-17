import React from "react";
import MethodBadge from "../common/MethodBadge";
import { CheckCircle, AlertCircle } from "lucide-react";
import "../../styles/css/performanceTest.css";

export default function SpecCard({ method, url, specData }) {
  console.log("specData:", method, url, specData); // ✅ 여기!

  if (!specData) return <div>데이터가 없습니다.</div>;

  const {
    latencies = {},
    throughput = 0,
    successRatio = "0%",
    statusCodes = {},
  } = specData;

  const isSuccess =
    successRatio !== "0%" && successRatio !== "0.00%" && successRatio !== 0;

  // 안전하게 접근
  const formatLatency = (value) =>
    typeof value === "number" ? `${(value / 1e6).toFixed(2)}ms` : "N/A";

  return (
    <div className={`performance-card ${isSuccess ? "success" : "failure"}`}>
      <div className="card-header">
        <div className="badges">
          <span className={`badge status ${isSuccess ? "success" : "failure"}`}>
            {isSuccess ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
            <span className="status-text">{isSuccess ? "완료" : "실패"}</span>
          </span>
          <MethodBadge type="method" value={method} />
        </div>
      </div>

      <span className="request-header">
        API URL : <span className="request-url">{url}</span>
      </span>

      <div className="response-meta">
        <div>
          성공률: <strong>{successRatio}</strong>
        </div>
        <div>
          평균 응답 시간: <strong>{formatLatency(latencies.mean)}</strong>
        </div>
        <div>
          지연 시간 P50: <strong>{formatLatency(latencies["50th"])}</strong>
        </div>
        <div>
          지연 시간 P95: <strong>{formatLatency(latencies["95th"])}</strong>
        </div>
        <div>
          지연 시간 Max: <strong>{formatLatency(latencies.max)}</strong>
        </div>
        <div>
          처리량(RPS):{" "}
          <strong>
            {typeof throughput === "number" ? throughput.toFixed(2) : "N/A"}
          </strong>
        </div>
        <div>
          상태코드:{" "}
          {Object.keys(statusCodes).length > 0 ? (
            Object.entries(statusCodes).map(([code, count]) => (
              <span key={code}>
                {code}({count}){" "}
              </span>
            ))
          ) : (
            <span>N/A</span>
          )}
        </div>
      </div>
    </div>
  );
}
