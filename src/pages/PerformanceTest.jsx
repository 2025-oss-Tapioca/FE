import React, { useState } from "react";
import "../styles/css/performanceTest.css";
import PerformanceCard from "../components/PerformaceTest/PerformanceCard";
import SpecCard from "../components/PerformaceTest/SpecCard";
import TrafficCard from "../components/PerformaceTest/TrafficCard";

const PerformanceTest = () => {
  //  "type": "traffic_test_result" (raw 데이터 이용)
  const [specData] = useState({
    method: "GET",
    url: "https://api.example.com/users",
    specData: {
      latencies: {
        total: 556136200,
        mean: 37075746,
        "50th": 30709700,
        "95th": 99441250,
        max: 116905200,
      },
      duration: 4666624600,
      throughput: 3.188636956336336,
      successRatio: "100.00%",
      statusCodes: {
        200: 15,
      },
    },
  });

  //  "type": "traffic_test_result" (raw 데이터 이용)
  const [trafficData] = useState({
    method: "GET",
    url: "https://api.example.com/users",
    requests: 15,
    bytes: {
      in: {
        total: 585,
        mean: 39,
      },
      out: {
        total: 0,
        mean: 0,
      },
    },
  });

  return (
    <div className="performance-test-container">
      <div className="performance-header">
        <h2 className="performance-title">성능 테스트</h2>
      </div>

      <div className="performance-result-list">
        {/* <h3>요청 결과</h3>
        {results.map((result) => (
          <PerformanceCard key={result.id} {...result} />
        ))} */}

        {/* <h3>성능 지표 (Spec)</h3> */}
        <SpecCard {...specData} />

        {/* <h3>트래픽 지표 (Traffic)</h3> */}
        <TrafficCard {...trafficData} />
      </div>
    </div>
  );
};

export default PerformanceTest;
