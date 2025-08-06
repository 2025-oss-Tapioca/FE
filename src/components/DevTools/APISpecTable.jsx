import React from "react";
import APISpecCard from "./APISpecCard";
import "../../styles/css/APISpecTable.css";

const dummyData = [
  {
    method: "GET",
    name: "상품 목록 조회",
    endpoint: "/api/products",
    tag: "상품",
    status: "활성",
    date: "2025-07-11",
  },
  {
    method: "POST",
    name: "상품 생성",
    endpoint: "/api/products",
    tag: "상품",
    status: "활성",
    date: "2025-07-11",
  },
  {
    method: "PUT",
    name: "상품 수정",
    endpoint: "/api/products/:id",
    tag: "상품",
    status: "비활성",
    date: "2025-07-11",
  },
  {
    method: "DELETE",
    name: "상품 삭제",
    endpoint: "/api/products/:id",
    tag: "상품",
    status: "활성",
    date: "2025-07-11",
  },
];

const APISpecTable = () => {
  return (
    <div className="api-spec-container">
      <div className="table-section">
        <div className="api-table-header">
          <h2>API 명세</h2>
          <div className="table-actions">
            <button className="sort-btn">
              <img
                src="/assets/icons/sort-vertical-02.svg"
                alt="sort"
                className="icon"
              />
              이름순
            </button>
            <button className="notion-btn">
              <img
                src="/assets/icons/image-notion.svg"
                alt="Notion"
                className="icon"
              />
              Notion에 업로드
            </button>
            <button className="add-btn">+ API 추가</button>
          </div>
        </div>

        <table className="api-table">
          <thead>
            <tr>
              <th>메소드</th>
              <th>API 이름</th>
              <th>엔드포인트</th>
              <th>태그</th>
              <th>상태</th>
              <th>최종 수정일</th>
              <th>수정/삭제</th>
            </tr>
          </thead>
        </table>
      </div>

      <div className="card-section">
        {dummyData.map((item, index) => (
          <APISpecCard key={index} {...item} />
        ))}
      </div>
    </div>
  );
};

export default APISpecTable;
