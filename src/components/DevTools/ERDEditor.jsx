import React from 'react';
import "../../styles/css/ERDEditor.css";

const ERDEditor = () => {
  const handleAddTable = () => {
    console.log('+ 테이블 추가 클릭됨');
    // 테이블 추가 로직을 여기에 작성하세요
  };

  return (
    <div>
      {/* 제목 + 버튼 정렬 */}
      <div className="erd-header">
        <h2>ERD 작성</h2>
        <button className="table-button" onClick={handleAddTable}>
          + 테이블 추가
        </button>
      </div>

      {/* 나중에 ERD 캔버스 영역이 이 아래 들어감 */}
      <div className="erd-canvas">

      </div>

      <div className="erd-legend">
        <img
          src="/assets/icons/primary_key.svg"
          alt="Primary"
          className="icon"
        />
        <span>Primary Key</span>
        <img
          src="/assets/icons/foreign_key.svg"
          alt="Foreign"
          className="icon"
        />
        <span>Foreign Key</span>
      </div>
    </div>
  );
};

export default ERDEditor;
