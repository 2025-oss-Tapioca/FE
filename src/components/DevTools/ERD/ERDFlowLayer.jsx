// src/components/DevTools/ERD/ERDFlowLayer.jsx
import React, { useMemo, useState, useCallback, useEffect } from "react";
import "reactflow/dist/style.css";
import { useTableStore } from "@/components/DevTools/ERD/store/useTableStore";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from "reactflow";
import { useReactFlow } from "reactflow";
import TableNode from "./node/TableNode";
import ErdEdge from "./edge/ERDEdge.jsx";
import EndpointPalette from "./edge/EndpointPalette.jsx";
import { decideLinkTypeByCard } from "./utils/erdUpdateHelpers"; 

const NODE_TYPE = "tableNode";
const EDGE_TYPE = "floating";

export default function ERDFlowLayer({
  tables,
  onEdit,
  onDelete,
  edges,
  setEdges,
}) {
  const nodeTypes = useMemo(() => ({ [NODE_TYPE]: TableNode }), []);
  const edgeTypes = useMemo(() => ({ floating: ErdEdge, erdEdge: ErdEdge }), []);

  const getTableLabel = useCallback(
    (nodeId) => {
      const t = (tables || []).find(
        x => x?.id === nodeId || x?.clientId === nodeId || x?.name === nodeId
      );
      return t?.name ?? nodeId; // 없으면 id 그대로
    },
    [tables]
  );

  const makeInitialNodes = useCallback(() => {
    const ensurePos = (t, i) => {
      // 1) position 객체가 이미 있으면 그대로
      if (t?.position && Number.isFinite(t.position.x) && Number.isFinite(t.position.y)) {
        return t.position;
      }
      // 2) x/y 필드가 있으면 변환
      if (Number.isFinite(t?.x) && Number.isFinite(t?.y)) {
        return { x: t.x, y: t.y };
      }
      // 3) 기본 배치
      return { x: 120 + i * 240, y: 80 + (i % 2) * 200 };
    };

    return (tables ?? []).map((t, i) => ({
      id: t.id || t.clientId || `table-${i}`,  // ← buildRequestPayload와 동일 기준
      type: NODE_TYPE,
      position: ensurePos(t, i),
      data: { table: t, onEdit, onDelete },
    }));
  }, [tables, onEdit, onDelete]);


  const [nodes, setNodes] = useState(makeInitialNodes());

  const rf = useReactFlow();
  const [pending, setPending] = useState(null); // { sourceId, sourceCard }
  const [selectedEdgeIds, setSelectedEdgeIds] = useState(new Set());

  // 테이블 변경 시 노드 갱신 + 사라진 노드에 걸린 엣지 제거
  useEffect(() => {
    const next = makeInitialNodes();
    setNodes((prev) => {
      const pos = new Map(prev.map((n) => [n.id, n.position]));
      return next.map((n) => (pos.has(n.id) ? { ...n, position: pos.get(n.id) } : n));
    });

    const alive = new Set(next.map((n) => n.id));
    // ⚠️ 실제로 제거될 엣지가 있을 때만 setEdges 호출 (없으면 그대로 반환)
    setEdges((eds) => {
      const filtered = eds.filter((e) => alive.has(e.source) && alive.has(e.target));
      if (filtered.length !== eds.length) return filtered;
      // 길이 같아도 요소가 모두 동일하면 그대로 반환해 참조 유지
      for (let i = 0; i < eds.length; i++) {
        if (eds[i] !== filtered[i]) return filtered;
      }
      return eds; // 변경 없음 → setEdges가 no-op
    });
  }, [makeInitialNodes, setEdges]);

  const onNodesChange = useCallback((changes) => {
    setNodes((nds) => applyNodeChanges(changes, nds));

    const { tables, setTables } = useTableStore.getState();
    const posPatch = new Map();
    changes.forEach((ch) => {
      if (ch.type === "position" && ch.position) {
        posPatch.set(ch.id, { x: ch.position.x, y: ch.position.y });
      }
    });
    if (posPatch.size === 0) return;

    const next = (tables || []).map((t) => {
      const key = t.id || t.clientId || t.name;
      const p = posPatch.get(key);
      return p ? { ...t, x: p.x, y: p.y, position: { x: p.x, y: p.y } } : t;
    });
    setTables(next);
  }, []);


  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const projectPoint = useCallback(
    (e) => rf.screenToFlowPosition({ x: e.clientX, y: e.clientY }),
    [rf]
  );

  const findNodeAt = useCallback(
    (pt) => {
      const ns = rf.getNodes();
      return ns.find((n) => {
        const r = n.positionAbsolute;
        const w = n.measured?.width ?? n.width ?? 0;
        const h = n.measured?.height ?? n.height ?? 0;
        return r && pt.x >= r.x && pt.x <= r.x + w && pt.y >= r.y && pt.y <= r.y + h;
      });
    },
    [rf]
  );

  // PK/FK 탐색 (from=PK, to=FK)
  // ERDFlowLayer.jsx

  // 기존: tableName으로 찾던 걸 nodeId로 찾도록 수정
  const findFirstPkId = useCallback(
    (nodeId) => {
      const t = (tables || []).find(
        (x) => x?.id === nodeId || x?.clientId === nodeId || x?.name === nodeId
      );
      //return t?.columns?.find((c) => c?.isPrimary)?.id ?? null;
      return t?.columns?.find((c) => c?.isPrimary)?.clientId
      ?? t?.columns?.find((c) => c?.isPrimary)?.id
      ?? null;
    },
    [tables]
  );

  const findFirstFkId = useCallback(
    (nodeId) => {
      const t = (tables || []).find(
        (x) => x?.id === nodeId || x?.clientId === nodeId || x?.name === nodeId
      );
      //return t?.columns?.find((c) => c?.isForeign)?.id ?? null;
      return t?.columns?.find((c) => c?.isForeign)?.clientId
      ?? t?.columns?.find((c) => c?.isForeign)?.id
      ?? null;
    },
    [tables]
  );


  const onSelectionChange = useCallback(({ nodes, edges }) => {
    setSelectedEdgeIds(new Set((edges ?? []).map((e) => e.id)));
  }, []);

  // Delete/Backspace로 선택 엣지 삭제
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Delete" && e.key !== "Backspace") return;
      if (selectedEdgeIds.size === 0) return;
      e.preventDefault();
      setEdges((eds) => eds.filter((e) => !selectedEdgeIds.has(e.id)));
      setSelectedEdgeIds(new Set());
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedEdgeIds, setEdges]);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    try {
      e.dataTransfer.dropEffect = "copy";
    } catch {}
  }, []);

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      const raw = e.dataTransfer.getData("application/erd-endpoint");
      if (!raw) return;

      const endpoint = JSON.parse(raw);
      const pt = projectPoint(e);
      const node = findNodeAt(pt);
      if (!node) return;

      if (!pending) {
        setPending({ sourceId: node.id, sourceCard: endpoint.card });
        return;
      }

      const targetId = node.id;
      const targetCard = endpoint.card;
      if (targetId === pending.sourceId) {
        setPending(null);
        return;
      }

      const fromClientId = findFirstPkId(pending.sourceId); // 1쪽
      const toClientId = findFirstFkId(targetId);           // N쪽
      if (!fromClientId || !toClientId) {
        window.alert(
          "링크를 만들 수 없습니다.\n- 시작 테이블에 PK가 있어야 하고\n- 도착 테이블에 FK가 있어야 합니다."
        );
        setPending(null);
        return;
      }

      const identifying = window.confirm(
        "식별 관계로 생성할까요?\n확인=식별(실선), 취소=비식별(점선)"
      );

      // ★ 카드 아이콘 조합으로 linkType 계산
      const linkType = decideLinkTypeByCard(
        String(pending.sourceId ? pending.sourceCard : ""), 
        String(targetCard)
      );

      const newEdge = {
        id: `e-${pending.sourceId}-${targetId}-${Date.now()}`,
        source: pending.sourceId,
        target: targetId,
        //type: EDGE_TYPE,
        type: 'floating',
        data: {
          identifying,
          sourceCard: pending.sourceCard,
          targetCard,
          fromClientId,
          toClientId,
          linkType,
        },
        style: { stroke: "#f472b6" },
      };

      setEdges((eds) => addEdge(newEdge, eds));
      setPending(null);
    },
    [pending, projectPoint, findNodeAt, findFirstPkId, findFirstFkId, setEdges]
  );

  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && setPending(null);
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  const displayEdges = useMemo(
    () => (edges ?? []).map(e => (e.type ? e : { ...e, type: 'floating' })),
    [edges]
  );

  return (
    <div className="erd-canvas rf-container relative">
      <EndpointPalette />
      {/* 변경은 부모 setEdges가 처리 */}
      <ReactFlow
        nodes={nodes}
        edges={displayEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        onDragOver={onDragOver}
        onDrop={onDrop}
        defaultEdgeOptions={{ type: 'floating', selectable: true, interactionWidth: 20 }}
        onSelectionChange={onSelectionChange}
      >
        <Background />
        <MiniMap />
        <Controls />
      </ReactFlow>

      {pending && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-4 px-3 py-1 rounded bg-black/60 text-white text-xs">
        시작 선택됨: <b>{getTableLabel(pending.sourceId)}</b> · 도착 테이블 위로 아이콘을 드롭하세요 (ESC 취소)
        </div>
      )}
    </div>
  );
}
