// src/components/DevTools/ERDFlowLayer.jsx
import React, { useMemo, useState, useCallback, useEffect } from "react";
import "reactflow/dist/style.css";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from "reactflow";
import TableNode from "./node/TableNode";
import ErdEdge from "./edge/ErdEdge";
import { useReactFlow } from "reactflow";
import EndpointPalette from "./edge/EndpointPalette";

const NODE_TYPE = "tableNode";
const EDGE_TYPE = "erdEdge";

export default function ERDFlowLayer({ tables, onEdit, onDelete }) {
  const nodeTypes = useMemo(() => ({ [NODE_TYPE]: TableNode }), []);
  const edgeTypes = useMemo(() => ({ [EDGE_TYPE]: ErdEdge }), []);

  const makeInitialNodes = useCallback(
    () =>
      (tables ?? []).map((t, i) => ({
        id: t.name || `table-${i}`,
        type: NODE_TYPE,
        position: { x: 120 + i * 240, y: 80 + (i % 2) * 200 },
        data: { table: t, onEdit, onDelete },
      })),
    [tables, onEdit, onDelete]
  );

  const [nodes, setNodes] = useState(makeInitialNodes());
  const [edges, setEdges] = useState([]);

  const rf = useReactFlow();
  const [pending, setPending] = useState(null); // { sourceId, sourceCard }
  const [selectedEdgeIds, setSelectedEdgeIds] = useState(new Set());

  useEffect(() => {
    const next = makeInitialNodes();
    setNodes(prev => {
      const pos = new Map(prev.map(n => [n.id, n.position]));
      return next.map(n => (pos.has(n.id) ? { ...n, position: pos.get(n.id) } : n));
    });
    const alive = new Set(next.map(n => n.id));
    setEdges(eds => eds.filter(e => alive.has(e.source) && alive.has(e.target)));
  }, [makeInitialNodes]);

  const onNodesChange = useCallback(
    changes => setNodes(nds => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    changes => setEdges(eds => applyEdgeChanges(changes, eds)),
    []
  );

  // ✅ project() deprecated → screenToFlowPosition()
  const projectPoint = useCallback(
    e => rf.screenToFlowPosition({ x: e.clientX, y: e.clientY }),
    [rf]
  );

  const findNodeAt = useCallback(pt => {
    const ns = rf.getNodes();
    return ns.find(n => {
      const r = n.positionAbsolute;
      const w = n.measured?.width ?? n.width ?? 0;
      const h = n.measured?.height ?? n.height ?? 0;
      return r && pt.x >= r.x && pt.x <= r.x + w && pt.y >= r.y && pt.y <= r.y + h;
    });
  }, [rf]);

  const onSelectionChange = useCallback(({ nodes, edges }) => {
    setSelectedEdgeIds(new Set((edges ?? []).map(e => e.id)));
  }, []);

  // ✅ Delete/Backspace로 선택 엣지 삭제
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;
      if (selectedEdgeIds.size === 0) return;
      e.preventDefault();
      setEdges((eds) => eds.filter(e => !selectedEdgeIds.has(e.id)));
      setSelectedEdgeIds(new Set());
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedEdgeIds]);

  // ✅ drop이 항상 발생하도록 dragover에서 무조건 preventDefault()
  const onDragOver = useCallback(e => {
    e.preventDefault();
    try { e.dataTransfer.dropEffect = "copy"; } catch {}
  }, []);

  const onDrop = useCallback(e => {
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
    if (targetId === pending.sourceId) { setPending(null); return; }

    const identifying = window.confirm("식별 관계로 생성할까요?\n확인=식별(실선), 취소=비식별(점선)");

    const newEdge = {
      id: `e-${pending.sourceId}-${targetId}-${Date.now()}`,
      source: pending.sourceId,
      target: targetId,
      type: EDGE_TYPE,
      data: { identifying, sourceCard: pending.sourceCard, targetCard },
      style: { stroke: "#f472b6" },
    };
    setEdges(eds => addEdge(newEdge, eds));
    setPending(null);
  }, [pending, projectPoint, findNodeAt]);

  useEffect(() => {
    const onEsc = e => e.key === "Escape" && setPending(null);
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  return (
    <div className="erd-canvas rf-container relative">
      <EndpointPalette />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        onDragOver={onDragOver}
        onDrop={onDrop}
        defaultEdgeOptions={{ selectable: true, interactionWidth: 20 }}
        onSelectionChange={onSelectionChange} 
      >
        <Background />
        <MiniMap />
        <Controls />
      </ReactFlow>

      {pending && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-4 px-3 py-1 rounded bg-black/60 text-white text-xs">
          시작 선택됨: <b>{pending.sourceId}</b> · 도착 테이블 위로 아이콘을 드롭하세요 (ESC 취소)
        </div>
      )}
    </div>
  );
}
