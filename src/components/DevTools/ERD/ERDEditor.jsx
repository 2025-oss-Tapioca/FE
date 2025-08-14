import React, { useState } from "react";
import "@/styles/css/ERDEditor.css";
import { useTableModalStore } from "@/components/DevTools/ERD/store/useTableModalStore";
import { useTableStore } from "@/components/DevTools/ERD/store/useTableStore";
import CreateTableModal from "./CreateTableModal";
import ERDFlowLayer from "./ERDFlowLayer";
import { ReactFlowProvider } from "reactflow";
import { buildPayload } from "@/utils/linkTypeUtils"; 

const ERDEditor = () => {
  const openModal = useTableModalStore((s) => s.open);
  const isOpen = useTableModalStore((s) => s.isOpen);
  const tables = useTableStore((s) => s.tables);
  const removeTable = useTableStore((s) => s.removeTable);

  const handleAddTable = () => {
    console.log("+ 테이블 추가 클릭됨");
    setEditing(null);
    openModal();
  };

  const [editing, setEditing] = useState(null); // 현재 수정 중인 테이블
  const [edges, setEdges] = useState([]); // ✅ 추가: 부모가 edges를 가짐

  const handleEdit = (table) => {
    setEditing(table);
    openModal(); // 수정 모달 열기
  };

  const handleDelete = (table) => {
    if (window.confirm(`[${table.name}] 테이블을 삭제할까요?`)) {
      removeTable(table.id ?? table.name);
    }
  };

  const handleSave = () => {
    const payload = buildPayload(edges);   // ✅ 여기서 유틸 호출
    console.log("API 전송 데이터:", payload);
  };

  const handleSaveAtGit = (table) => {
    console.log("Github에 코드 생성 버튼 클릭됨");
  }

  const handleModalClose = () => setEditing(null);

  return (
    <div className="erd-wrapper">
      {/* 제목 + 버튼 정렬 */}
      <div className="erd-header">
        <h2>ERD 작성</h2>
        <div className="header-actions">
          <button className="table-button" onClick={handleSave}>
            저장
          </button>
          <button className="github-btn" onClick={handleSaveAtGit}>
            <img
              src="/assets/icons/image-github.svg"
              alt="Github"
              className="icon"
            />
            Github에 코드 생성
          </button>
          <button className="table-button" onClick={handleAddTable}>
            + 테이블 추가
          </button>
        </div>
      </div>

      {/* ✅ React Flow 레이어: 카드 모양 그대로 드래그/연결 가능 */}
      <ReactFlowProvider>
        <ERDFlowLayer
          tables={tables}
          onEdit={handleEdit}
          onDelete={handleDelete}
           /** ✅ 추가: 자식이 edge 바뀔 때마다 올려줌 */
          onEdgesUpdate={setEdges}
        />
      </ReactFlowProvider>

      {/* 모달: create 또는 edit 공유 */}
      {isOpen && (
        <CreateTableModal initialTable={editing} onClose={handleModalClose} />
      )}

      {/* PK/FK 설명 */}
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
