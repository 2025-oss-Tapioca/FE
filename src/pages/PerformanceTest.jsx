import React, { useState } from "react";
import "../styles/css/PerformanceTest.css";
import PerformanceCard from "../components/PerformaceTest/PerformanceCard";

import { Play } from "lucide-react";

const PerformanceTest = () => {
  const [results, setResults] = useState([
    {
      id: 1,
      method: "GET",
      url: "https://api.example.com/users",
      responseTime: 245,
      statusCode: 200,
    },
    {
      id: 2,
      method: "POST",
      url: "https://api.example.com/users",
      responseTime: 245,
      statusCode: 200,
    },
    {
      id: 3,
      method: "POST",
      url: "https://api.example.com/users",
      responseTime: 5000,
      statusCode: 500,
    },
    {
      id: 4,
      method: "PUT",
      url: "https://api.example.com/users",
      responseTime: 5000,
      statusCode: 500,
    },
  ]);

  return (
    <div className="performance-test-container">
      <div className="performance-header">
        <h2 className="performance-title">성능 테스트</h2>
        <button className="test-button">
          <Play size={16} /> 테스트 시작
        </button>
      </div>

      <div className="performance-result-list">
        {results.map((result) => (
          <PerformanceCard key={result.id} {...result} />
        ))}
      </div>
    </div>
  );
};

export default PerformanceTest;
