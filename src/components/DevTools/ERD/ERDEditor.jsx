// src/components/DevTools/ERD/ERDEditor.jsx
import React, { useMemo, useState, useEffect } from "react";
import "@/styles/css/ERDEditor.css";
import { useTableModalStore } from "@/components/DevTools/ERD/store/useTableModalStore";
import { useTableStore } from "@/components/DevTools/ERD/store/useTableStore";
import CreateTableModal from "./CreateTableModal";
import ERDFlowLayer from "./ERDFlowLayer";
import { ReactFlowProvider } from "reactflow";
import { useGetERD, useSaveERD } from "@/api/hooks/erd";

/* -------------------- 링크 타입 ↔ 카드 매핑 (파일 내에 포함) -------------------- */
// 카드 번호 의미: 1=O_Bar_Crow, 2=O_Crow, 3=O_Bar, 4=Bar_Crow, 5=CrowOnly, 6=BarOnly
function decideLinkTypeByCard(sourceCard, targetCard) {
  const CARD_MAX = { 1: "N", 2: "N", 3: 1, 4: "N", 5: "N", 6: 1 };
  const s = CARD_MAX[String(sourceCard)];
  const t = CARD_MAX[String(targetCard)];
  if (s === 1 && t === 1) return "ONE_TO_ONE";
  if (s === 1 && t === "N") return "ONE_TO_MANY";
  if (s === "N" && t === 1) return "MANY_TO_ONE";
  return "MANY_TO_MANY";
}

function getCardsByLinkType(linkType) {
  switch (linkType) {
    case "ONE_TO_ONE":
      return { sourceCard: 3, targetCard: 3 }; // O_Bar, O_Bar
    case "ONE_TO_MANY":
      return { sourceCard: 3, targetCard: 1 }; // O_Bar, O_Bar_Crow
    case "MANY_TO_ONE":
      return { sourceCard: 1, targetCard: 3 }; // O_Bar_Crow, O_Bar
    case "MANY_TO_MANY":
    default:
      return { sourceCard: 1, targetCard: 1 }; // O_Bar_Crow, O_Bar_Crow
  }
}
/* ------------------------------------------------------------------------------ */

const ERDEditor = ({ teamCode }) => {
  const openModal = useTableModalStore((s) => s.open);
  const isOpen = useTableModalStore((s) => s.isOpen);

  const tables = useTableStore((s) => s.tables);
  const removeTable = useTableStore((s) => s.removeTable);
  const setTables = useTableStore((s) => s.setTables);

  const saveERD = useSaveERD(teamCode);
  const { data: erd, isLoading, error } = useGetERD(teamCode);

  // 1) 서버 데이터 -> tables / edges 변환
  const { tablesFromServer, initialEdges } = useMemo(() => {
    if (!erd?.diagrams) return { tablesFromServer: [], initialEdges: [] };

    const tablesFromServer = erd.diagrams.map((d, i) => ({
      id: d.diagramId ?? d.clientId ?? `table-${i}`,
      name: d.diagramName,
      x: d.diagramPosX ?? d.diagram_pos_x ?? 120 + i * 240,
      y: d.diagramPosY ?? d.diagram_pos_y ?? 80 + (i % 2) * 200,
      position: {
        x: d.diagramPosX ?? d.diagram_pos_x ?? 120 + i * 240,
        y: d.diagramPosY ?? d.diagram_pos_y ?? 80 + (i % 2) * 200,
      },
      columns: (d.attributes ?? []).map((a, j) => ({
        id: a.attributeId ?? a.clientId ?? `${d.diagramId}-col-${j}`,
        name: a.attributeName,
        type: a.attributeType,
        varcharLength: a.varcharLength ?? null,
        isPrimary: !!a.primaryKey,
        isForeign: !!a.foreignKey,
      })),
    }));

    // attributeId -> diagramId 매핑
    const attrToDiagram = new Map();
    erd.diagrams.forEach((d) => {
      (d.attributes ?? []).forEach((a) => {
        if (a?.attributeId) attrToDiagram.set(a.attributeId, d.diagramId);
      });
    });

    // 우선: 서버가 준 attributeLinks 사용
    let edges = (erd.attributeLinks ?? [])
      .map((link, idx) => {
        const source = attrToDiagram.get(link.fromAttributeId);
        const target = attrToDiagram.get(link.toAttributeId);
        if (!source || !target) return null;
        const { sourceCard, targetCard } = getCardsByLinkType(link.linkType);
        return {
          id: link.linkId ?? link.id ?? `edge-${idx}`,
          source,
          target,
          type: "erdEdge",
          data: {
            identifying: !!link.identifying,
            sourceCard,
            targetCard,
            fromClientId: link.fromAttributeId,
            toClientId: link.toAttributeId,
            linkType: link.linkType,
          },
        };
      })
      .filter(Boolean);

    // fallback: GET 응답에 attributeLinks가 없을 때 FK/PK 이름 매칭으로 추론
    if (!edges.length) {
      // PK 인덱스 (이름 소문자 기준)
      const pkIndex = new Map(); // nameLower -> { attrId, diagramId }
      erd.diagrams.forEach((d) =>
        (d.attributes ?? []).forEach((a) => {
          if (a?.primaryKey) {
            pkIndex.set(String(a.attributeName || "").toLowerCase(), {
              attrId: a.attributeId,
              diagramId: d.diagramId,
            });
          }
        })
      );
      // FK를 돌며 같은 이름의 PK가 있으면 엣지 생성 (기본 ONE_TO_MANY)
      erd.diagrams.forEach((d) =>
        (d.attributes ?? []).forEach((a, idx) => {
          if (a?.foreignKey) {
            const key = String(a.attributeName || "").toLowerCase();
            const pk = pkIndex.get(key);
            if (
              pk &&
              pk.diagramId &&
              a.attributeId &&
              d.diagramId !== pk.diagramId
            ) {
              const { sourceCard, targetCard } =
                getCardsByLinkType("ONE_TO_MANY");
              edges.push({
                id: `edge-infer-${pk.attrId}-${a.attributeId}-${idx}`,
                source: pk.diagramId, // PK 쪽 테이블
                target: d.diagramId, // FK 쪽 테이블
                type: "erdEdge",
                data: {
                  identifying: false,
                  sourceCard,
                  targetCard,
                  fromClientId: pk.attrId, // PK attrId
                  toClientId: a.attributeId, // FK attrId
                  linkType: "ONE_TO_MANY",
                },
              });
            }
          }
        })
      );
    }

    return { tablesFromServer, initialEdges: edges };
  }, [erd]);

  // 2) edges 상태 제어
  const [edges, setEdges] = useState([]);
  useEffect(() => {
    if (!tablesFromServer.length) return;
      setTables(tablesFromServer);
      // 노드가 캔버스에 반영된 "다음 프레임"에 edges 주입 (레이스 컨디션 회피)
      const raf = requestAnimationFrame(() => setEdges(initialEdges));
      return () => cancelAnimationFrame(raf);
  }, [tablesFromServer, initialEdges, setTables]);

  const handleAddTable = () => openModal();
  const handleEdit = (table) => openModal(table);
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

    // 저장 시: edge.data.linkType이 있으면 그대로, 없으면 카드로 계산
    const attributeLinks = safeEdges
      .filter((e) => e?.data?.fromClientId && e?.data?.toClientId)
      .map((e) => ({
        fromClientId: e.data.fromClientId,
        toClientId: e.data.toClientId,
        linkType:
          e.data.linkType ||
          decideLinkTypeByCard(e.data.sourceCard, e.data.targetCard),
        // identifying: !!e.data.identifying,  // 필요하면 포함
      }));

    return { name, diagrams, attributeLinks };
  }

  const handleSave = () => {
    if (!teamCode) {
      alert("teamCode가 없습니다. 팀을 먼저 선택하세요.");
      return;
    }
    const payload = buildRequestPayload();
    saveERD.mutate(payload, {
      onSuccess: () => alert("저장되었습니다."),
      onError: () => alert("저장 중 오류가 발생했습니다."),
    });
  };

  if (isLoading) return <div>불러오는 중…</div>;
  if (error) return <div>로드 실패: {String(error?.message || error)}</div>;

  return (
    <div className="erd-wrapper">
      <div className="erd-header">
        <h2>ERD 작성</h2>
        <div className="header-actions">
          <button className="table-button" onClick={handleSave}>
            저장
          </button>
          <button className="github-btn">
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

      {isOpen && <CreateTableModal initialTable={null} onClose={() => {}} />}
    </div>
  );
};

export default ERDEditor;
