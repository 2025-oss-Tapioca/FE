import React from "react";
import MethodBadge from "../common/MethodBadge";
import { Upload, Download, Network } from "lucide-react";

import "../../styles/css/PerformanceTest.css";

export default function TrafficCard({ method, url, requests, bytes }) {
  console.log("trafficData:", method, url, requests, bytes); // ✅ 여기!

  return (
    <div className="performance-card">
      <div className="card-header">
        <div className="badges-left">
          <MethodBadge type="method" value={method} />
        </div>
        <div className="badges-right">
          <span className="badge type-badge-traffic">
            {/* 예: "SPEC" or "TRAFFIC" */}Traffic
          </span>
        </div>
      </div>
      <span className="request-header">
        API URL : <span className="request-url">{url}</span>
      </span>
      <div className="response-meta">
        <div className="response-meta-row">
          총 요청 수: <strong>{requests}</strong>
        </div>
        <div className="response-meta-row">
          <div>
            평균 수신 바이트 : <strong>{bytes?.in?.mean ?? 0}B</strong>
          </div>
          <div>
            총 수신 바이트 : <strong>{bytes?.in?.total ?? 0}B</strong>
          </div>
        </div>

        <div className="response-meta-row">
          <div>
            평균 송신 바이트 : <strong>{bytes?.out?.mean ?? 0}B</strong>
          </div>
          <div>
            총 송신 바이트 : <strong>{bytes?.out?.total ?? 0}B</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
