// src/components/DevTools/ERD/ERDEditor.jsx
import React, { useMemo, useState, useEffect } from "react";
import "@/styles/css/ERDEditor.css";
import { useTableModalStore } from "@/components/DevTools/ERD/store/useTableModalStore";
import { useTableStore } from "@/components/DevTools/ERD/store/useTableStore";
import CreateTableModal from "./CreateTableModal";
import ERDFlowLayer from "./ERDFlowLayer";
import { ReactFlowProvider } from "reactflow";
import { useGetERD, useSaveERD } from "@/api/hooks/erd";
import { buildUpdatePayload, getCardsByLinkType, applyServerIdsToState, unwrapErdResponse, ensureValidUpdateRequest } from './utils/erdUpdateHelpers';


// === 0) clientId 보정 헬퍼 ===
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const toClientId = (maybeId, fallback) => {
  if (maybeId && !UUID_RE.test(maybeId)) return maybeId;
  const base =
    maybeId ||
    fallback ||
    `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `cli-${base}`;
};

const ensureClientIds = (tables) =>
  (tables || []).map(t => {
    const clientId = toClientId(t.clientId, t.serverId || t.id);
    const columns = (t.columns || []).map(c => ({
      ...c,
      clientId: toClientId(c.clientId, c.serverId || c.id),
    }));
    return { ...t, clientId, columns };
  });

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
    // 훅이 {success, data}를 줄 수도, 생데이터를 줄 수도 있으니 모두 안전 처리
    const payload = erd?.diagrams ? erd : erd?.data;
    if (!payload?.diagrams) return { tablesFromServer: [], initialEdges: [] };

    const tablesFromServer = payload.diagrams.map((d, i) => ({
      // 화면/노드 식별은 id(=서버 UUID)로 유지
      id: d.diagramId ?? d.clientId ?? `table-${i}`,
      // 서버 UUID는 따로 보관
      serverId: d.diagramId ?? null,
      // clientId는 반드시 임시값이 되도록 보정
      clientId: toClientId(d.clientId ?? d.diagramId ?? `table-${i}`),

      name: d.diagramName,
      x: d.diagramPosX ?? d.diagram_pos_x ?? 120 + i * 240,
      y: d.diagramPosY ?? d.diagram_pos_y ?? 80 + (i % 2) * 200,
      position: {
        x: d.diagramPosX ?? d.diagram_pos_x ?? 120 + i * 240,
        y: d.diagramPosY ?? d.diagram_pos_y ?? 80 + (i % 2) * 200,
      },
      columns: (d.attributes ?? []).map((a, j) => {
        // "VARCHAR(100)" → type="VARCHAR", attributeLength=100
        const m = /^(.+?)\s*\((\d+)\)$/.exec(a.attributeType || '');
        const type = m ? m[1] : a.attributeType;
        const attributeLength = m ? Number(m[2]) : (a.attributeLength ?? a.varcharLength ?? null);

        return {
          id: a.attributeId ?? a.clientId ?? `${d.diagramId}-col-${j}`,
          serverId: a.attributeId ?? null,
          clientId: toClientId(a.clientId ?? a.attributeId ?? `${d.diagramId}-col-${j}`),

          name: a.attributeName,
          type,                    // ← 괄호 제거된 순수 타입
          attributeLength,         // ← 숫자 길이 (없으면 null)
          varcharLength: attributeLength, // (호환용, 점진 제거 가능)

          isPrimary: !!a.primaryKey,
          isForeign: !!a.foreignKey,
        };
      }),
    }));

    // attributeId -> diagramId 매핑
    const attrToDiagram = new Map();
    payload.diagrams.forEach((d) => {
      (d.attributes ?? []).forEach((a) => {
        if (a?.attributeId) attrToDiagram.set(a.attributeId, d.diagramId);
      });
    });

    // 테이블/컬럼 적재 후 바로 추가
    // server attributeId -> clientId 매핑
    const srvAttrIdToClientId = new Map();
    tablesFromServer.forEach(t =>
      (t.columns ?? []).forEach(c => {
        if (c.id && c.clientId) srvAttrIdToClientId.set(c.id, c.clientId);
      })
    );

    let edges = (payload.attributeLinks ?? [])
   .map((link, idx) => {
     const source = attrToDiagram.get(link.fromAttributeId);
     const target = attrToDiagram.get(link.toAttributeId);
     if (!source || !target) return null;
     const { sourceCard, targetCard } = getCardsByLinkType(link.linkType);

     // ✅ 서버 attributeId → clientId 매핑이 반드시 성공해야 함
     const fromCli = srvAttrIdToClientId.get(link.fromAttributeId);
     const toCli   = srvAttrIdToClientId.get(link.toAttributeId);
     if (!fromCli || !toCli) return null; // 매핑 안 되면 해당 엣지는 스킵

     return {
       id: link.linkId ?? link.id ?? `edge-${idx}`,
       source,
       target,
       type: "erdEdge",
       data: {
         identifying: !!link.identifying,
         sourceCard,
         targetCard,
         fromClientId: fromCli,  // ✅ clientId 사용
         toClientId: toCli,      // ✅ clientId 사용
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

  const [editingTable, setEditingTable] = useState(null);

  const handleAddTable = () => {
    setEditingTable(null);
    openModal();
  };

  const handleEdit = (table) => {
    setEditingTable(table);
    openModal();
  };

  const handleDelete = (table) => {
    if (window.confirm(`[${table.name}] 테이블을 삭제할까요?`)) {
      removeTable(table.id ?? table.name);
    }
  };

  const handleSave = () => {
    if (!teamCode) {
      alert('teamCode가 없습니다. 팀을 먼저 선택하세요.');
      return;
    }

    const safeTables = ensureClientIds(tables);
    const req = buildUpdatePayload(safeTables, edges);
    // 빠른 확인용 로그
    const ids = req.diagrams.flatMap(d => d.attributes.map(a => a.attributeId));
    const linkIds = req.attributeLinks.flatMap(l => [l.fromClientId, l.toClientId]);
    console.log('[ATTR_IDS]', ids);
    console.log('[LINK_IDS]', linkIds);
    ensureValidUpdateRequest(req);

    // ✅ 여기서 점검 로그 추가
  console.table(
    tables.flatMap(t => (t.columns ?? []).map(c => ({
      table: t.name,
      col: c.name,
      col_id: c.id,
      col_clientId: c.clientId,
      col_serverId: c.serverId,
    })))
  );

  console.log(
    'edges(from/to should be clientId)',
    edges.map(e => ({
      id: e.id,
      from: e.data.fromClientId,
      to: e.data.toClientId,
    }))
  );

    console.log('[ERD UPDATE REQUEST]', JSON.stringify(req, null, 2));

    saveERD.mutate(req, {
      onSuccess: (res) => {
        const env = unwrapErdResponse(res);
        console.log('[ERD UPDATE RESPONSE]', env);

        if (!env.success || !env.data) {
          alert(env?.error?.message || '저장 실패');  // ← 실패 알림은 여기 딱 한 군데
          return;
        }

        const { nextTables, nextEdges } = applyServerIdsToState({
          req,
          resData: env.data,
          tables,
          edges,
        });

        setTables(nextTables);
        setEdges(nextEdges);
        alert('저장되었습니다.');
      },
      onError: (err) => {
        console.error('[ERD UPDATE ERROR]', err?.response?.data || err);
        alert('저장 중 오류가 발생했습니다.');
      },
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

      {isOpen && (
        <CreateTableModal
          initialTable={editingTable}
          onClose={() => setEditingTable(null)}
        />
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