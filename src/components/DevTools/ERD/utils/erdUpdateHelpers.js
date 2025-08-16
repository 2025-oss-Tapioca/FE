// src/components/DevTools/ERD/utils/erdUpdateHelpers.js

/* ────────────────────────── 공통 유틸 ────────────────────────── */
const round2 = (n) =>
  typeof n === "number" && !Number.isNaN(n) ? Math.round(n * 100) / 100 : 0;

export const toUpper = (v) => (v ? String(v).toUpperCase() : v);

export const normalizeType = (t) => {
  const U = toUpper(t) || "";
  if (U === "SERIAL") return "INTEGER";
  if (U === "BIGSERIAL") return "BIGINT";
  if (U === "SMALLSERIAL") return "SMALLINT";
  return U; // 그 외는 그대로
};

export const varcharLenOf = (typeUpper, varcharLength) => {
  const isChar = /^VARCHAR|^CHAR/.test(typeUpper || "");
  return isChar ? (varcharLength ? Number(varcharLength) : null) : null;
};

/** 카드 번호 → linkType 계산(없을 때 대비) */
export function decideLinkTypeByCard(sourceCard, targetCard) {
  const CARD_MAX = { 1: "N", 2: "N", 3: 1, 4: "N", 5: "N", 6: 1 };
  const s = CARD_MAX[String(sourceCard)];
  const t = CARD_MAX[String(targetCard)];
  if (s === 1 && t === 1) return "ONE_TO_ONE";
  if (s === 1 && t === "N") return "ONE_TO_MANY";
  if (s === "N" && t === 1) return "MANY_TO_ONE";
  return "MANY_TO_MANY";
}

export function getCardsByLinkType(linkType) {
  switch (linkType) {
    case "ONE_TO_ONE":
      return { sourceCard: "3", targetCard: "3" };
    case "ONE_TO_MANY":
      return { sourceCard: "3", targetCard: "1" };
    case "MANY_TO_ONE":
      return { sourceCard: "1", targetCard: "3" };
    case "MANY_TO_MANY":
      return { sourceCard: "1", targetCard: "1" };
    default:
      return { sourceCard: null, targetCard: null };
  }
}

/* ─────────────────────── 요청 바디 빌더 ───────────────────────
 * ▶ diagrams[].diagramId / attributes[].attributeId 에 '임시 id'를 직접 넣는다
 * ▶ clientId 키는 아예 보내지 않는다
 * ▶ attributeLinks[].fromClientId / toClientId 는 '컬럼의 임시 id'를 넣는다
 * ---------------------------------------------------------------- */
export function buildUpdatePayload(tables = [], edges = []) {
  // 1) diagrams / attributes: 임시 id 직접 사용
  const diagrams = (tables || []).map((t) => {
    const diagramTempId = String(t.clientId || t.id || "");
    const attributes = (t.columns || []).map((col) => {
      const typeU = normalizeType(col.type);
      const len = varcharLenOf(typeU, col.varcharLength);

      return {
        attributeId: String(col.clientId || col.id || ""), // ← 임시 id
        attributeName: col.name,
        attributeType: typeU,
        varcharLength: len,
        primaryKey: !!col.isPrimary,
        foreignKey: !!col.isForeign,
        // 아래의 매핑용으로 serverId도 보존(요청에는 안보내지만 로컬에서 사용)
       __serverId: col.serverId || col.id || null,
      };
    });

    return {
      diagramId: diagramTempId, // ← 임시 id
      diagramName: t.name,
      diagramPosX: round2(t.x ?? t.position?.x ?? 0),
      diagramPosY: round2(t.y ?? t.position?.y ?? 0),
      attributes,
    };
  });

    // 1.5) 링크 정규화를 위한 보조 자료구조
    const clientIdSet = new Set();
    const serverToClient = new Map();
    diagrams.forEach(d => {
    (d.attributes || []).forEach(a => {
        const cli = String(a.attributeId || "");
        clientIdSet.add(cli);
        const srv = a.__serverId ? String(a.__serverId) : null;
        if (srv) serverToClient.set(srv, cli);
        delete a.__serverId; // 요청 바디엔 보내지 않음
    });
    });

  // 2) attributeLinks: from/to는 반드시 attributes[].attributeId(=임시 id) 중 하나
  const attributeLinks = (edges || []).map((e) => {
    const d = e?.data || {};
    // 들어올 수 있는 모든 후보 키에서 from/to 추출 (프로젝트 내 다양한 edge 데이터를 흡수)
    const fromCandidate =
      d.fromClientId ??
      d.sourceAttrClientId ??
      d.sourceAttributeId ??
      d.fromAttributeId ??
      e.fromAttributeId ??
      e.sourceAttributeId ??
      e.fromClientId;

    const toCandidate =
      d.toClientId ??
      d.targetAttrClientId ??
      d.targetAttributeId ??
      d.toAttributeId ??
      e.toAttributeId ??
      e.targetAttributeId ??
      e.toClientId;

    let fromClientId = String(fromCandidate || "");
    let toClientId   = String(toCandidate   || "");
    // ✅ 만약 서버 UUID로 들어왔다면 clientId로 치환
    if (fromClientId && !clientIdSet.has(fromClientId) && serverToClient.has(fromClientId)) {
        fromClientId = serverToClient.get(fromClientId);
    }
    if (toClientId && !clientIdSet.has(toClientId) && serverToClient.has(toClientId)) {
        toClientId = serverToClient.get(toClientId);
    }
    const linkType = d.linkType || decideLinkTypeByCard(d.sourceCard, d.targetCard);

    return {
      fromClientId, // 예: "a-1"
      toClientId,   // 예: "b-2"
      linkType,
      sourceCard: d.sourceCard,
      targetCard: d.targetCard,
      identifying: !!d.identifying,
    };
  });

  return {
    // 서버가 name 필수면 바깥에서 주입하거나 여기서 기본값을 공급
    // name: 'ERD',
    diagrams,
    attributeLinks,
  };
}

/* ───────────────────── 요청 사전 검증/보정 ────────────────────
 * - 형식 오류를 사전에 잡아서 40001 방지
 * ---------------------------------------------------------------- */
export function ensureValidUpdateRequest(req) {
  if (!req || typeof req !== "object") throw new Error("invalid req");

  if (!Array.isArray(req.diagrams) || req.diagrams.length === 0) {
    throw new Error("diagrams is empty");
  }

  // diagrams/attributes 검사
  req.diagrams.forEach((d, i) => {
    if (!d.diagramId)
      throw new Error(`diagram[${i}].diagramId missing (temp id)`);
    if (!d.diagramName) throw new Error(`diagram[${i}].diagramName missing`);
    d.diagramPosX = round2(d.diagramPosX ?? 0);
    d.diagramPosY = round2(d.diagramPosY ?? 0);

    if (!Array.isArray(d.attributes) || d.attributes.length === 0) {
      throw new Error(`diagram[${i}].attributes empty`);
    }

    d.attributes.forEach((a, j) => {
      if (!a.attributeId)
        throw new Error(`attr[${i}.${j}].attributeId missing (temp id)`);
      if (!a.attributeName)
        throw new Error(`attr[${i}.${j}].attributeName missing`);

      const typeU = normalizeType(a.attributeType);
      const isChar = /^VARCHAR|^CHAR/.test(typeU);
      if (isChar) {
        if (a.varcharLength == null || Number.isNaN(Number(a.varcharLength))) {
          throw new Error(
            `attr[${i}.${j}].varcharLength must be number for ${typeU}`
          );
        }
        a.varcharLength = Number(a.varcharLength);
      } else {
        a.varcharLength = null;
      }

      a.attributeType = typeU;
      a.primaryKey = !!a.primaryKey;
      a.foreignKey = !!a.foreignKey;
    });
  });

  // 링크 검사 (from/to가 실제 attributes[].attributeId와 매칭되는지)
  const attrTempIds = new Set(
    req.diagrams.flatMap((d) => (d.attributes || []).map((a) => String(a.attributeId)))
  );

  req.attributeLinks = (req.attributeLinks || []).map((l, k) => {
    if (!l.fromClientId) throw new Error(`link[${k}].fromClientId missing`);
    if (!l.toClientId) throw new Error(`link[${k}].toClientId missing`);
    if (!attrTempIds.has(String(l.fromClientId)))
      throw new Error(`link[${k}].fromClientId not found in attributes`);
    if (!attrTempIds.has(String(l.toClientId)))
      throw new Error(`link[${k}].toClientId not found in attributes`);

    const type = l.linkType || decideLinkTypeByCard(l.sourceCard, l.targetCard);
    return {
      fromClientId: String(l.fromClientId),
      toClientId: String(l.toClientId),
      linkType: type,
      sourceCard: l.sourceCard,
      targetCard: l.targetCard,
      identifying: !!l.identifying,
    };
  });

  // 서버가 top-level name을 필수로 요구한다면 여기서 기본값 지정 가능
  // if (!req.name) req.name = 'ERD';

  return req;
}

/* ───────────────────── 응답 언래퍼(선택) ───────────────────── */
export function unwrapErdResponse(res) {
  const body = res?.data ?? res;
  if (body && typeof body === "object" && "success" in body) return body;
  return { success: true, data: body, error: null };
}

/* ─────────────── 응답 UUID를 상태에 반영(선택/참고) ───────────────
 * 요청은 temp id로 보냈고, 응답엔 { temp id ↔ 실제 UUID } 매핑이 올 것.
 * 이 함수는 상태의 columns[].serverId / tables[].serverId 같은 필드를 채워준다.
 * (응답 형태에 맞춰 필요시 조정)
 * ---------------------------------------------------------------- */
export function applyServerIdsToState({ req, resData, tables, edges }) {
  // 예시: 서버가 { diagramId: <UUID>, tempId: <임시id> } 형태로 내려준다고 가정
  const mapDiagram = new Map();
  const mapAttr = new Map();

  (resData?.diagrams || []).forEach((d) => {
    const tempDiagramId = d.tempId || d.clientId || d.diagramTempId;
    if (tempDiagramId && d.diagramId) {
      mapDiagram.set(String(tempDiagramId), String(d.diagramId));
    }
    (d.attributes || []).forEach((a) => {
      const tempAttrId = a.tempId || a.clientId || a.attributeTempId;
      if (tempAttrId && a.attributeId) {
        mapAttr.set(String(tempAttrId), String(a.attributeId));
      }
    });
  });

  const nextTables = (tables || []).map((t) => {
    const tempTid = String(t.clientId || t.id || "");
    const serverId = mapDiagram.get(tempTid) || t.serverId || t.id;
    const columns = (t.columns || []).map((c) => {
      const tempCid = String(c.clientId || c.id || "");
      return {
        ...c,
        serverId: mapAttr.get(tempCid) || c.serverId || c.id,
      };
    });
    return { ...t, serverId, columns };
  });

  return { nextTables, nextEdges: edges || [] };
}
