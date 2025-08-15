import React, { useState } from "react";
import "@/styles/css/ERDEditor.css";
import { useTableModalStore } from "@/components/DevTools/ERD/store/useTableModalStore";
import { useTableStore } from "@/components/DevTools/ERD/store/useTableStore";
import CreateTableModal from "./CreateTableModal";
import ERDFlowLayer from "./ERDFlowLayer";
import { ReactFlowProvider } from "reactflow";
import { decideLinkTypeByCard } from "@/utils/linkTypeUtils";
import { useSaveERD } from "@/api/hooks/erd";

const ERDEditor = ({ teamCode }) => {
  const openModal = useTableModalStore((s) => s.open);
  const isOpen = useTableModalStore((s) => s.isOpen);

  const tables = useTableStore((s) => s.tables);
  const removeTable = useTableStore((s) => s.removeTable);
  const setTables = useTableStore((s) => s.setTables);

  const saveERD = useSaveERD(teamCode);

  const [editing, setEditing] = useState(null);
  const [edges, setEdges] = useState([]);

  const handleAddTable = () => {
    setEditing(null);
    openModal();
  };

  const handleEdit = (table) => {
    setEditing(table);
    openModal();
  };

  const handleDelete = (table) => {
    if (window.confirm(`[${table.name}] 테이블을 삭제할까요?`)) {
      removeTable(table.id ?? table.name);
    }
  };

  // 서버 발급 ID 여부: id !== clientId면 서버 ID
  const hasServerId = (id, clientId) => !!id && id !== clientId;

  function buildRequestPayload() {
    const safeTables = Array.isArray(tables) ? tables.filter(Boolean) : [];
    const safeEdges = Array.isArray(edges) ? edges.filter(Boolean) : [];

    const name = `ERD-${teamCode || "unknown"}`;

    const diagrams = safeTables.map((t) => {
      const diagramId = hasServerId(t?.id, t?.clientId) ? t.id : null;
      const clientDiagramId = t?.clientId || t?.id;

      const attributes = Array.isArray(t?.columns)
        ? t.columns.filter(Boolean).map((c) => {
            const attributeId = hasServerId(c?.id, c?.clientId) ? c.id : null;
            const clientAttrId = c?.clientId || c?.id;

            const type = String(c?.type || "").toUpperCase();
            const isChar = /^VARCHAR|^CHAR/.test(type);

            return {
              clientId: clientAttrId,
              attributeId,
              attributeName: c?.name ?? "",
              attributeType: type,
              varcharLength: isChar
                ? c?.varcharLength
                  ? Number(c.varcharLength)
                  : null
                : null,
              primaryKey: !!c?.isPrimary,
              foreignKey: !!c?.isForeign,
            };
          })
        : [];

      return {
        clientId: clientDiagramId,
        diagramId,
        diagramName: t?.name ?? "",
        diagramPosX: Number(t?.x ?? 0),
        diagramPosY: Number(t?.y ?? 0),
        attributes,
      };
    });

    const attributeLinks = safeEdges
      .filter((e) => e?.data?.fromClientId && e?.data?.toClientId)
      .map((e) => {
        const from = e.data.fromClientId;
        const to = e.data.toClientId;
        const bothServerLikely =
          typeof from === "string" &&
          typeof to === "string" &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            from
          ) &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            to
          );

        const link = {
          linkType: decideLinkTypeByCard(e.data.sourceCard, e.data.targetCard),
        };

        if (bothServerLikely) {
          link.fromAttributeId = from;
          link.toAttributeId = to;
        } else {
          link.fromClientId = from;
          link.toClientId = to;
        }
        return link;
      });

    return { name, diagrams, attributeLinks };
  }

  const handleSave = () => {
    if (!teamCode) {
      alert("teamCode가 없습니다. 팀을 먼저 선택하세요.");
      return;
    }

    const payload = buildRequestPayload();

    saveERD.mutate(payload, {
      onSuccess: (res) => {
        if (!res?.success) {
          alert(res?.error?.message || "저장 실패");
          return;
        }
        const server = res.data;
        if (!server?.diagrams) {
          alert("저장 성공했지만 응답 형식이 예상과 다릅니다.");
          return;
        }

        const diagByName = new Map(
          server.diagrams.map((d) => [d.diagramName, d])
        );

        const clientToServerAttrId = new Map();
        (tables || []).forEach((t) => {
          const sd = diagByName.get(t.name);
          if (!sd) return;
          const attrByName = new Map(
            sd.attributes.map((a) => [a.attributeName, a])
          );
          (t.columns || []).forEach((c) => {
            const sa = attrByName.get(c.name);
            if (sa) clientToServerAttrId.set(c.id, sa.attributeId);
          });
        });

        const nextTables = (tables || []).map((t) => {
          const sd = diagByName.get(t.name);
          if (!sd) return t;

          const attrByName = new Map(
            sd.attributes.map((a) => [a.attributeName, a])
          );
          const nextCols = (t.columns || []).map((c) => {
            const sa = attrByName.get(c.name);
            return sa
              ? {
                  ...c,
                  id: sa.attributeId,
                  clientId: c.clientId || c.id,
                }
              : c;
          });

          return {
            ...t,
            id: sd.diagramId,
            clientId: t.clientId || t.id,
            position: t.position,
            columns: nextCols,
          };
        });
        setTables(nextTables);

        setEdges((prev) =>
          prev.map((e) => ({
            ...e,
            data: {
              ...e.data,
              fromClientId:
                clientToServerAttrId.get(e.data.fromClientId) ||
                e.data.fromClientId,
              toClientId:
                clientToServerAttrId.get(e.data.toClientId) ||
                e.data.toClientId,
            },
          }))
        );

        alert("저장되었습니다.");
      },
      onError: () => {
        alert("저장 중 오류가 발생했습니다.");
      },
    });
  };

  const handleSaveAtGit = () => {
    // TODO: Github 코드 생성 연동
  };

  const handleModalClose = () => setEditing(null);

  return (
    <div className="erd-wrapper">
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

      <ReactFlowProvider>
        <ERDFlowLayer
          tables={tables}
          onEdit={handleEdit}
          onDelete={handleDelete}
          edges={edges}
          setEdges={setEdges}
        />
      </ReactFlowProvider>

      {isOpen && (
        <CreateTableModal initialTable={editing} onClose={handleModalClose} />
      )}

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
