// src/components/DevTools/CreateTableModal.jsx
import React, { useEffect, useState } from "react";
import { useTableModalStore } from "@/components/DevTools/ERD/store/useTableModalStore";
import { useTableStore } from "@/components/DevTools/ERD/store/useTableStore";
import { RotateCcw } from "lucide-react";
import "@/styles/css/CreateTableModal.css";

/* ---------- dnd-kit 추가 ---------- */
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/** 드래그 핸들만 드래그 시작되도록 하는 Row 래퍼 */
const SortableRow = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // 핸들에만 바인딩할 props
  const handleProps = { ...attributes, ...listeners };

  // children 은 render-prop 형태로 받아 핸들을 원하는 곳에 붙인다
  return children({ setNodeRef, style, handleProps });
};

const makeDefaultColumn = () => ({
  id: crypto.randomUUID(),
  name: "",
  type: "",
  isPrimary: false,
  isForeign: false,
  isUnique: false,
  isNotNull: false,
});

export default function CreateTableModal({ initialTable = null, onClose }) {
  const { isOpen, close } = useTableModalStore();
  const addTable = useTableStore((s) => s.addTable);
  const updateTable = useTableStore((s) => s.updateTable);

  const isEdit = !!initialTable;

  // ✅ 기존 값으로 상태 초기화
  const [tableId, setTableId] = useState(initialTable?.id ?? null);
  const [tableName, setTableName] = useState(initialTable?.name ?? "");
  const [columns, setColumns] = useState(
    initialTable?.columns?.length ? initialTable.columns : [makeDefaultColumn()]
  );

  // DnD sensors: 5px 이상 이동해야 드래그 시작 → 입력 타이핑 보호
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // 드래그 종료 시 순서 반영
  const handleDragEnd = (e) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setColumns((prev) => {
      const oldIndex = prev.findIndex((c) => c.id === active.id);
      const newIndex = prev.findIndex((c) => c.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  // 모달이 열릴 때/다른 테이블로 수정 진입할 때 값 갱신
  useEffect(() => {
    if (isEdit) {
      setTableId(initialTable.id ?? null);
      setTableName(initialTable.name ?? "");
      setColumns(initialTable.columns ?? [makeDefaultColumn()]);
    } else {
      setTableId(null);
      setTableName("");
      setColumns([makeDefaultColumn()]);
    }
  }, [isEdit, initialTable, isOpen]);

  const handleAddColumn = () => setColumns((p) => [...p, makeDefaultColumn()]);
  const handleRemoveColumn = (id) =>
    setColumns((p) => p.filter((c) => c.id !== id));
  const handleChangeColumn = (id, key, val) =>
    setColumns((p) => p.map((c) => (c.id === id ? { ...c, [key]: val } : c)));

  const handleReset = () => {
    if (isEdit) {
      setTableName(initialTable.name ?? "");
      setColumns(initialTable.columns ?? []);
    } else {
      setTableName("");
      setColumns([makeDefaultColumn()]);
    }
  };

  const validate = (name, cols) => {
    const errors = [];

    if (!name || !name.toString().trim()) errors.push("Table name");

    const colArray = Array.isArray(cols) ? cols : [];
    if (colArray.length === 0) {
      errors.push("At least 1 column");
    } else {
      colArray.forEach((c, i) => {
        if (!c.name || !c.name.toString().trim())
          errors.push(`Column #${i + 1} name`);
        if (!c.type || !c.type.toString().trim())
          errors.push(`Column #${i + 1} type`);
      });
    }

    const names = colArray
      .map((c) => (c.name ? c.name.toString().trim() : ""))
      .filter(Boolean);
    const dup = names.find((n, i) => names.indexOf(n) !== i);
    if (dup) errors.push(`Duplicated column name: ${dup}`);

    if (!colArray.some((c) => c.isPrimary)) {
      errors.push("At least 1 Primary Key");
    }

    if (errors.length) {
      alert(`필수 항목을 확인하세요:\n- ${errors.join("\n- ")}`);
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!validate(tableName, columns)) return; // ❗검증 실패 시 저장 중단
    const dto = { name: tableName, columns };
    if (isEdit) {
      updateTable(tableId ?? initialTable.name, dto); // id 우선
    } else {
      addTable(dto);
    }
    close();
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <h2 className="modal-title">
          {isEdit ? "Edit table" : "Create table"}
        </h2>

        <div className="mb-4">
          <label className="modal-label">
            Table name <span className="modal-required">*</span>
          </label>
          <input
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            placeholder="Table_name"
            className="modal-input"
          />
          <small className="modal-subtext">
            Table Name Can not be change after created
          </small>
        </div>

        <button onClick={handleReset} className="btn-reset flex items-center gap-1">
          <RotateCcw size={16} />
          Reset all
        </button>

        {/* ---------- 드래그 정렬 가능한 컬럼 리스트 ---------- */}
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext
            items={columns.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            {columns.map((col) => (
              <SortableRow key={col.id} id={col.id}>
                {({ setNodeRef, style, handleProps }) => (
                  <div ref={setNodeRef} style={style} className="column-row">
                    {/* 드래그 핸들: 여기에서만 드래그 시작 */}
                    <div
                      className="drag-handle"
                      {...handleProps}
                      style={{
                        cursor: "grab",
                        userSelect: "none",
                        width: 16,
                        marginRight: 8,
                      }}
                      title="드래그하여 순서 변경"
                    >
                      ⋮⋮
                    </div>

                    <div className="column-field">
                      <label className="modal-label">
                        Column name <span className="modal-required">*</span>
                      </label>
                      <input
                        className="column-input"
                        value={col.name}
                        onChange={(e) =>
                          handleChangeColumn(col.id, "name", e.target.value)
                        }
                        placeholder="Column name"
                      />
                    </div>

                    <div className="column-field">
                      <label className="modal-label">
                        Type <span className="modal-required">*</span>
                      </label>
                      <input
                        className="column-select"
                        value={col.type}
                        onChange={(e) =>
                          handleChangeColumn(col.id, "type", e.target.value)
                        }
                        placeholder="ex: varchar(255)"
                      />
                    </div>

                    <div className="column-options">
                      <label>
                        <input
                          type="radio"
                          name={`key-${col.id}`}
                          checked={col.isPrimary}
                          onChange={() => {
                            handleChangeColumn(col.id, "isPrimary", true);
                            handleChangeColumn(col.id, "isForeign", false);
                          }}
                        />{" "}
                        PK
                      </label>
                      <label>
                        <input
                          type="radio"
                          name={`key-${col.id}`}
                          checked={col.isForeign}
                          onChange={() => {
                            handleChangeColumn(col.id, "isForeign", true);
                            handleChangeColumn(col.id, "isPrimary", false);
                          }}
                        />{" "}
                        FK
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={col.isUnique}
                          onChange={(e) =>
                            handleChangeColumn(
                              col.id,
                              "isUnique",
                              e.target.checked
                            )
                          }
                        />{" "}
                        Unique
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={col.isNotNull}
                          onChange={(e) =>
                            handleChangeColumn(
                              col.id,
                              "isNotNull",
                              e.target.checked
                            )
                          }
                        />{" "}
                        Not Null
                      </label>
                    </div>

                    <button
                      className="btn-remove"
                      onClick={() => handleRemoveColumn(col.id)}
                    >
                      🗑
                    </button>
                  </div>
                )}
              </SortableRow>
            ))}
          </SortableContext>
        </DndContext>

        <div className="modal-footer">
          <button className="modal-btn-add" onClick={handleAddColumn}>
            + Add column
          </button>
          <div className="spacer" />
          <button
            className="modal-btn-cancel"
            onClick={() => (onClose?.(), useTableModalStore.getState().close())}
          >
            취소
          </button>
          <button className="modal-btn-save" onClick={handleSave}>
            {isEdit ? "Save Changes" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
