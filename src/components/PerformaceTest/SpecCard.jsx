import React from "react";
import MethodBadge from "../common/MethodBadge";
import { CheckCircle, AlertCircle } from "lucide-react";
import "../../styles/css/PerformanceTest.css";

// 1. 이제 props로 받는 specData는 API 응답의 results 배열에 있는 객체 하나입니다.
export default function SpecCard({ specData }) {
  // 2. 데이터가 없거나, 필요한 summary, raw, inputs 객체가 없는 경우를 위한 방어 코드
  if (!specData || !specData.summary || !specData.raw || !specData.inputs) {
    return <div>스펙 데이터를 표시할 수 없습니다.</div>;
  }

  // 3. API 응답 구조에 맞게 필요한 값들을 올바른 위치에서 추출합니다.
  const { inputs, summary } = specData;
  const { method, url } = inputs;
  const { successRatioPct, latencyMs, rpsMean, byStatus } = summary;

  // 성공률(successRatioPct)을 기반으로 성공/실패 여부를 판단합니다.
  const isSuccess = successRatioPct === 100.0;

  // 이미 밀리초(ms)인 값을 포맷하는 헬퍼 함수
  const formatLatencyMs = (value) =>
    typeof value === "number" ? `${value.toFixed(2)} ms` : "N/A";

  return (
    <div className={`performance-card ${isSuccess ? "success" : "failure"}`}>
      <div className="card-header">
        <div className="badges-left">
          <span className={`badge status ${isSuccess ? "success" : "failure"}`}>
            {isSuccess ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
            <span className="status-text">{isSuccess ? "완료" : "실패"}</span>
          </span>
          {/* inputs 객체에서 method 값을 가져옵니다. */}
          <MethodBadge type="method" value={method} />
        </div>
        <div className="badges-right">
          <span className="badge type-badge-spec">SPEC</span>
        </div>
      </div>

      <span className="request-header">
        {/* inputs 객체에서 url 값을 가져옵니다. */}
        API URL : <span className="request-url">{url}</span>
      </span>

      <div className="response-meta">
        <div className="response-meta-row">
          {/* summary 객체에서 successRatioPct 값을 가져옵니다. */}
          성공률: <strong>{successRatioPct.toFixed(2)}%</strong>
        </div>
        <div className="response-meta-row">
          {/* summary.latencyMs 객체에서 값을 가져와 표시합니다. */}
          <div>
            평균 응답 시간: <strong>{formatLatencyMs(latencyMs.mean)}</strong>
          </div>
          <div>
            지연 시간 P50: <strong>{formatLatencyMs(latencyMs.p50)}</strong>
          </div>
          <div>
            지연 시간 P95: <strong>{formatLatencyMs(latencyMs.p95)}</strong>
          </div>
          <div>
            지연 시간 Max: <strong>{formatLatencyMs(latencyMs.max)}</strong>
          </div>
        </div>
        <div className="response-meta-row">
          <div>
            {/* summary 객체에서 rpsMean 값을 가져옵니다. */}
            처리량(RPS):{" "}
            <strong>
              {typeof rpsMean === "number" ? rpsMean.toFixed(2) : "N/A"}
            </strong>
          </div>
          <div>
            상태코드: {/* summary.byStatus 객체를 사용합니다. */}
            {Object.keys(byStatus).length > 0 ? (
              Object.entries(byStatus).map(([code, count]) => (
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
    </div>
  );
}
