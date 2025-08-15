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
  {
    group: "geometric",
    options: ["box", "circle", "line", "lseg", "path", "point", "polygon"],
  },
  { group: "binary", options: ["bytea"] },
  { group: "character", options: ["varchar", "char", "text"] },
  {
    group: "network address",
    options: ["cidr", "inet", "macaddr", "macaddr8"],
  },
  {
    group: "date/time",
    options: ["date", "interval", "time", "time with time zone", "timestamp"],
  },
  { group: "JSON", options: ["json", "jsonb"] },
  { group: "monetary", options: ["money"] },
  { group: "pg_lsn", options: ["pg_lsn"] },
  { group: "pg_snapshot", options: ["pg_snapshot"] },
  { group: "text search", options: ["tsquery", "tsvector"] },
  { group: "uuid", options: ["uuid"] },
];

/** 임의 ID 생성 */
const genId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

/** varchar(123) / char(12) → { base, len } */
const parseVarchar = (t = "") => {
  const s = String(t).trim();
  let m = /^varchar\((\d+)\)$/i.exec(s);
  if (m) return { base: "varchar", len: m[1] };
  m = /^char\((\d+)\)$/i.exec(s);
  if (m) return { base: "char", len: m[1] };
  return { base: s, len: "" };
};

/** { base:'varchar', len:'120' } → 'VARCHAR(120)' */
const buildTypeString = (base, len) => {
  if (base === "varchar" && len) return `varchar(${len})`;
  if (base === "char" && len) return `char(${len})`;
  return base;
};

/** 드래그 핸들만 드래그 시작되도록 하는 Row 래퍼 */
const SortableRow = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const handleProps = { ...attributes, ...listeners };
  return children({ setNodeRef, style, handleProps });
};

/** 기본 컬럼 생성 */
const makeDefaultColumn = () => {
  const cid = genId();
  return {
    id: cid,
    clientId: cid,
    name: "",
    type: "",
    varcharLength: "",
    isPrimary: false,
    isForeign: false,
  };
};

export default function CreateTableModal({ initialTable = null, onClose }) {
  const { isOpen, close } = useTableModalStore();
  const addTable = useTableStore((s) => s.addTable);
  const updateTable = useTableStore((s) => s.updateTable);

  const isEdit = !!initialTable;

  const [tableId, setTableId] = useState(initialTable?.id ?? null);
  const [tableName, setTableName] = useState(initialTable?.name ?? "");
  const [columns, setColumns] = useState(
    initialTable?.columns?.length
      ? initialTable.columns.map((c) => {
          const { base, len } = parseVarchar(c.type);
          return {
            ...makeDefaultColumn(),
            ...c,
            id: c.id || genId(),
            clientId: c.clientId || c.id,
            type: base ?? "",
            varcharLength: base === "varchar" || base === "char" ? len : "",
          };
        })
      : [makeDefaultColumn()]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (e) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setColumns((prev) => {
      const oldIndex = prev.findIndex((c) => c.id === active.id);
      const newIndex = prev.findIndex((c) => c.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

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
            id: c.id || genId(),
            clientId: c.clientId || c.id,
            type: base ?? "",
            varcharLength: base === "varchar" || base === "char" ? len : "",
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
  const handleRemoveColumn = (id) =>
    setColumns((p) => p.filter((c) => c.id !== id));
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
            id: c.id || genId(),
            clientId: c.clientId || c.id,
            type: base ?? "",
            varcharLength: base === "varchar" || base === "char" ? len : "",
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
        if (!c.name || !c.name.toString().trim())
          errors.push(`Column #${i + 1} name`);
        if (!c.type || !c.type.toString().trim())
          errors.push(`Column #${i + 1} type`);
        if ((c.type === "varchar" || c.type === "char") && !c.varcharLength) {
          errors.push(`Column #${i + 1} ${c.type} length`);
        }
      });
    }

    const names = colArray
      .map((c) => c.name?.toString().trim() || "")
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

    const normalizedColumns = columns.map((c) => {
      const typeString = buildTypeString(
        c.type,
        String(c.varcharLength || "").trim()
      );
      return {
        ...c,
        id: c.id || genId(),
        clientId: c.clientId || c.id,
        type: (typeString || "").toUpperCase(),
      };
    });

    const _tid = tableId || genId();
    const dto = {
      id: _tid,
      clientId: initialTable?.clientId || _tid,
      name: tableName,
      columns: normalizedColumns,
      x: initialTable?.x ?? 0,
      y: initialTable?.y ?? 0,
    };

    if (isEdit) {
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

        <button
          onClick={handleReset}
          className="btn-reset flex items-center gap-1"
        >
          <RotateCcw size={16} /> Reset all
        </button>

        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext
            items={columns.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            {columns.map((col) => (
              <SortableRow key={col.id} id={col.id}>
                {({ setNodeRef, style, handleProps }) => (
                  <div ref={setNodeRef} style={style} className="column-row">
                    <div className="drag-handle" {...handleProps}>
                      ⋮⋮
                    </div>
                    <div className="column-top-row">
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
                        <div className="type-line">
                          <select
                            className="column-select"
                            value={col.type}
                            onChange={(e) => {
                              const next = e.target.value;
                              handleChangeColumn(col.id, "type", next);
                              if (next !== "varchar" && next !== "char") {
                                handleChangeColumn(col.id, "varcharLength", "");
                              }
                            }}
                          >
                            <option value="" disabled>
                              -- Select Type --
                            </option>
                            {COLUMN_TYPES.map((g) => (
                              <optgroup key={g.group} label={g.group}>
                                {g.options.map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                          {(col.type === "varchar" || col.type === "char") && (
                            <input
                              type="number"
                              min={1}
                              placeholder="Length (e.g 100)"
                              className="column-input varchar-len"
                              value={col.varcharLength}
                              onChange={(e) =>
                                handleChangeColumn(
                                  col.id,
                                  "varcharLength",
                                  e.target.value.replace(/\D/g, "")
                                )
                              }
                            />
                          )}
                        </div>
                      </div>
                    </div>
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
                      <button
                        className="btn-remove"
                        onClick={() => handleRemoveColumn(col.id)}
                      >
                        🗑
                      </button>
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
