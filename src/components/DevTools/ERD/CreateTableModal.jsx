// src/components/DevTools/createTableModal.jsx
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

/* ---------- 타입 옵션 ---------- */
const COLUMN_TYPES = [
  {
    group: "numeric",
    options: [
      "bigint",
      "bigserial",
      "double precision",
      "integer",
      "numeric",
      "real",
      "smallint",
      "smallserial",
      "serial",
    ],
  },
  { group: "bit", options: ["bit", "bit varying"] },
  { group: "boolean", options: ["boolean"] },
  { group: "geometric", options: ["box", "circle", "line", "lseg", "path", "point", "polygon"] },
  { group: "binary", options: ["bytea"] },
  { group: "character", options: ["varchar", "char", "text"] },
  { group: "network address", options: ["cidr", "inet", "macaddr", "macaddr8"] },
  { group: "date/time", options: ["date", "interval", "time", "time with time zone", "timestamp"] },
  { group: "JSON", options: ["json", "jsonb"] },
  { group: "monetary", options: ["money"] },
  { group: "pg_lsn", options: ["pg_lsn"] },
  { group: "pg_snapshot", options: ["pg_snapshot"] },
  { group: "text search", options: ["tsquery", "tsvector"] },
  { group: "uuid", options: ["uuid"] },
];

/** varchar(123) → { base: 'varchar', len: '123' } */
const parseVarchar = (t = "") => {
  const m = /^varchar\((\d+)\)$/i.exec(String(t).trim());
  return m ? { base: "varchar", len: m[1] } : { base: t, len: "" };
};

/** { base:'varchar', len:'120' } → 'varchar(120)' */
const buildTypeString = (base, len) =>
  base === "varchar" && len ? `varchar(${len})` : base;

/** 드래그 핸들만 드래그 시작되도록 하는 Row 래퍼 */
const SortableRow = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const handleProps = { ...attributes, ...listeners };
  return children({ setNodeRef, style, handleProps });
};

const makeDefaultColumn = () => ({
  id: crypto.randomUUID(),
  name: "",
  type: "",              // UI에는 base type (ex. 'varchar')
  varcharLength: "",     // 'varchar'일 때만 사용
  isPrimary: false,
  isForeign: false,
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
    initialTable?.columns?.length
      ? initialTable.columns.map((c) => {
          const { base, len } = parseVarchar(c.type);
          return {
            ...makeDefaultColumn(),
            ...c,
            type: base ?? "",
            varcharLength: base === "varchar" ? len : "",
          };
        })
      : [makeDefaultColumn()]
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
      setColumns(
        (initialTable.columns ?? [makeDefaultColumn()]).map((c) => {
          const { base, len } = parseVarchar(c.type);
          return {
            ...makeDefaultColumn(),
            ...c,
            type: base ?? "",
            varcharLength: base === "varchar" ? len : "",
          };
        })
      );
    } else {
      setTableId(null);
      setTableName("");
      setColumns([makeDefaultColumn()]);
    }
  }, [isEdit, initialTable, isOpen]);

  const handleAddColumn = () => setColumns((p) => [...p, makeDefaultColumn()]);
  const handleRemoveColumn = (id) => setColumns((p) => p.filter((c) => c.id !== id));
  const handleChangeColumn = (id, key, val) =>
    setColumns((p) => p.map((c) => (c.id === id ? { ...c, [key]: val } : c)));

  const handleReset = () => {
    if (isEdit) {
      setTableName(initialTable.name ?? "");
      setColumns(
        (initialTable.columns ?? []).map((c) => {
          const { base, len } = parseVarchar(c.type);
          return {
            ...makeDefaultColumn(),
            ...c,
            type: base ?? "",
            varcharLength: base === "varchar" ? len : "",
          };
        })
      );
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
        if (!c.name || !c.name.toString().trim()) errors.push(`Column #${i + 1} name`);
        if (!c.type || !c.type.toString().trim()) errors.push(`Column #${i + 1} type`);
        if (c.type === "varchar" && !c.varcharLength) errors.push(`Column #${i + 1} varchar length`);
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
      window.alert(`필수 항목을 확인하세요:\n- ${errors.join("\n- ")}`);
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!validate(tableName, columns)) return;

    // 저장 시 varchar는 'varchar(길이)'로 합쳐서 전송 + 타입 대문자 변환
    const normalizedColumns = columns.map((c) => {
      const typeString = buildTypeString(c.type, String(c.varcharLength || "").trim());
      return {
        ...c,
        type: (typeString || "").toUpperCase(),
      };
    });

    const dto = { name: tableName, columns: normalizedColumns };

    if (isEdit) {
      // id가 있으면 우선 사용, 없으면 이전 name fallback
      updateTable(tableId ?? initialTable.name, dto);
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
        <h2 className="modal-title">{isEdit ? "Edit table" : "Create table"}</h2>

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
          <small className="modal-subtext">Table Name Can not be change after created</small>
        </div>

        <button onClick={handleReset} className="btn-reset flex items-center gap-1">
          <RotateCcw size={16} /> Reset all
        </button>

        {/* ---------- 드래그 정렬 가능한 컬럼 리스트 ---------- */}
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext items={columns.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            {columns.map((col) => (
              <SortableRow key={col.id} id={col.id}>
  {({ setNodeRef, style, handleProps }) => (
    <div ref={setNodeRef} style={style} className="column-row">
      {/* 드래그 핸들 */}
      <div
        className="drag-handle"
        {...handleProps}
        style={{ cursor: "grab", userSelect: "none", width: 16, marginRight: 8 }}
        title="드래그하여 순서 변경"
      >
        ⋮⋮
      </div>

      {/* ── 윗줄: 컬럼명 + 타입(+길이) */}
      <div className="column-top-row">
        <div className="column-field">
          <label className="modal-label">
            Column name <span className="modal-required">*</span>
          </label>
          <input
            className="column-input"
            value={col.name}
            onChange={(e) => handleChangeColumn(col.id, "name", e.target.value)}
            placeholder="Column name"
          />
        </div>

        <div className="column-field">
          <label className="modal-label">
            Type <span className="modal-required">*</span>
          </label>

          <div className="type-line">
            <select
              className="column-select"
              value={col.type}
              onChange={(e) => {
                const next = e.target.value;
                handleChangeColumn(col.id, "type", next);
                if (next !== "varchar") {
                  handleChangeColumn(col.id, "varcharLength", "");
                }
              }}
              required
            >
              <option value="" disabled>-- Select Type --</option>
              {COLUMN_TYPES.map((g) => (
                <optgroup key={g.group} label={g.group}>
                  {g.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </optgroup>
              ))}
            </select>

            {col.type === "varchar" && (
              <input
                type="number"
                min={1}
                placeholder="Length (e.g 100)"
                className="column-input varchar-len"
                value={col.varcharLength}
                onChange={(e) =>
                  handleChangeColumn(col.id, "varcharLength", e.target.value.replace(/\D/g, ""))
                }
              />
            )}
          </div>
        </div>
      </div>

      {/* ── 아랫줄: PK/FK + 삭제 (항상 아래 고정) */}
      <div className="column-bottom-row">
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
        </div>

        <div className="spacer" />
        <button className="btn-remove" onClick={() => handleRemoveColumn(col.id)}>🗑</button>
      </div>
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
            onClick={() => {
              close();
              onClose?.();
            }}
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
