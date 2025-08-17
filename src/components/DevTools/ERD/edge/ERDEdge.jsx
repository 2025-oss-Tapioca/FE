// src/components/DevTools/ERD/edge/ERDEdge.jsx
import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, useStore } from 'reactflow';
import {
  O_Crow,
  O_Bar,
  CrowOnly,
  BarOnly,
  O_Bar_Crow,
  Bar_Crow,
} from '../icons/ERDicons';

// 카드 → 아이콘 매핑
const pickIcon = (card) => {
  switch (String(card)) {
    case '1': return O_Bar_Crow;    // 없거나 한개 또는 여러개
    case '2': return O_Crow;        // 없거나 여러개
    case '3': return O_Bar;         // 없거나 한개
    case '4': return Bar_Crow;      // 한개 또는 여러개
    case '5': return CrowOnly;      // 여러개
    case '6': return BarOnly;       // 한개
    default:  return null;
  }
};

const ICON_HALF = 12;
const PAD = -14;        // 0~1px 미세조정 (경계 겹침/틈 방지)
const STUB_INSET = 0;   // 왼쪽 짧은 막대가 아이콘 왼쪽 가장자리에서 안쪽으로 들어온 거리(px)

// 각도(deg)만큼 회전한 아이콘 로컬 좌표를 월드 좌표로 변환
function rotateLocalToWorld(cx, cy, deg, lx, ly) {
  const r = (deg * Math.PI) / 180;
  const cos = Math.cos(r), sin = Math.sin(r);
  return {
    x: cx + (lx * cos - ly * sin),
    y: cy + (lx * sin + ly * cos),
  };
}

// '왼쪽 Stub'의 월드 좌표 반환 (아이콘 중심 cx,cy / 각도 deg)
function leftStubAnchor(cx, cy, deg) {
  // 아이콘 로컬 좌표: (0,0) = 중심, 왼쪽 가장자리 = x = -ICON_HALF
  const lx = -ICON_HALF + STUB_INSET;
  const ly = 0;
  return rotateLocalToWorld(cx, cy, deg, lx, ly);
}

// 노드 중심/사각형 계산
const getNodeAbsPos = (node) => ({
  x: (node.positionAbsolute?.x ?? node.position.x),
  y: (node.positionAbsolute?.y ?? node.position.y),
});
const getRect = (node) => {
  const p = getNodeAbsPos(node);
  return { x: p.x, y: p.y, w: node.width, h: node.height };
};
const getCenter = (node) => {
  const p = getNodeAbsPos(node);
  return { x: p.x + node.width / 2, y: p.y + node.height / 2 };
};

// 사각형과 p0→p1 선의 '가장 가까운' 교차점
function getIntersectionOnRect(rect, p0, p1) {
  const x0 = rect.x, y0 = rect.y, x1 = rect.x + rect.w, y1 = rect.y + rect.h;
  const dx = p1.x - p0.x;
  const dy = p1.y - p0.y;
  const tVals = [];

  if (dx !== 0) {
    const tL = (x0 - p0.x) / dx, yL = p0.y + tL * dy;
    if (tL >= 0 && yL >= y0 && yL <= y1) tVals.push(tL);
    const tR = (x1 - p0.x) / dx, yR = p0.y + tR * dy;
    if (tR >= 0 && yR >= y0 && yR <= y1) tVals.push(tR);
  }
  if (dy !== 0) {
    const tT = (y0 - p0.y) / dy, xT = p0.x + tT * dx;
    if (tT >= 0 && xT >= x0 && xT <= x1) tVals.push(tT);
    const tB = (y1 - p0.y) / dy, xB = p0.x + tB * dx;
    if (tB >= 0 && xB >= x0 && xB <= x1) tVals.push(tB);
  }

  if (!tVals.length) return { x: p0.x, y: p0.y };
  const t = Math.min(...tVals);
  return { x: p0.x + t * dx, y: p0.y + t * dy };
}


export default function ErdEdge(props) {
  const {
    id,
    selected,
    style,
    data = {},
  } = props;

  // ✅ 노드 정보에서 '가장 가까운 변'의 접점 좌표 계산
  const { nodeInternals } = useStore((s) => ({ nodeInternals: s.nodeInternals }));
  const sNode = nodeInternals.get(props.source);
  const tNode = nodeInternals.get(props.target);
  if (!sNode || !tNode) return null;

  const sRect = getRect(sNode);
  const tRect = getRect(tNode);
  const sc = getCenter(sNode);
  const tc = getCenter(tNode);

  // 각 노드의 접점(소스는 소스 중심→타깃 중심, 타깃은 타깃 중심→소스 중심)
  const sPt = getIntersectionOnRect(sRect, sc, tc);
  const tPt = getIntersectionOnRect(tRect, tc, sc);

  const dx = tPt.x - sPt.x;
  const dy = tPt.y - sPt.y;
  const horizontalDominant = Math.abs(dx) >= Math.abs(dy);

  let sourceIconDeg, targetIconDeg;
  if (horizontalDominant) {
    // 좌↔우 배치: 서로 마주보게 (←  →)
    sourceIconDeg = dx >= 0 ? 180 : 0;
    targetIconDeg = dx >= 0 ?   0 : 180;
  } else {
    // 위↕아래 배치: 서로 마주보게 (↑  ↓)
    // dy>0: 타깃이 아래 => 소스는 ↓(90°), 타깃은 ↑(-90°)
    sourceIconDeg = dy >= 0 ?  -90 : 90;
    targetIconDeg = dy >= 0 ? 90 :  -90;
  }

  function whichSide(rect, p) {
  const left   = Math.abs(p.x - rect.x);
  const right  = Math.abs(rect.x + rect.w - p.x);
  const top    = Math.abs(p.y - rect.y);
  const bottom = Math.abs(rect.y + rect.h - p.y);
  const m = Math.min(left, right, top, bottom);
  if (m === left) return 'L';
  if (m === right) return 'R';
  if (m === top) return 'T';
  return 'B';
}
const sideInfo = {
  L: { nx: -1, ny:  0, deg: 180 },
  R: { nx:  1, ny:  0, deg:   0 },
  T: { nx:  0, ny: -1, deg: -90 },
  B: { nx:  0, ny:  1, deg:  90 },
};

  // 접점이 위치한 변 구하기
  const sSide = whichSide(sRect, sPt);
  const tSide = whichSide(tRect, tPt);
  const sN = sideInfo[sSide];
  const tN = sideInfo[tSide];

  // 아이콘 중심 = 접점에서 바깥쪽(법선)으로 ICON_HALF + PAD 만큼
  const sourceIconX = sPt.x + sN.nx * (ICON_HALF + PAD);
  const sourceIconY = sPt.y + sN.ny * (ICON_HALF + PAD);

  const targetIconX = tPt.x + tN.nx * (ICON_HALF + PAD);
  const targetIconY = tPt.y + tN.ny * (ICON_HALF + PAD);

  // 기존 sx,sy,tx,ty 계산 지우고 아래로 교체
  const EDGE_GAP = 0; // 필요시 0~2로 미세조정

  // 아이콘의 '왼쪽 Stub' 위치(월드 좌표)
  const sStub = leftStubAnchor(sourceIconX, sourceIconY, sourceIconDeg);
  const tStub = leftStubAnchor(targetIconX, targetIconY, targetIconDeg);

  // 선은 Stub 바로 지점(또는 살짝 바깥)에서 시작/끝
  const sx = sStub.x - EDGE_GAP;
  const sy = sStub.y;
  const tx = tStub.x - EDGE_GAP;
  const ty = tStub.y;


  // ✅ 직선 경로
  const edgePath = `M ${sx} ${sy} L ${tx} ${ty}`;

  const isIdentifying = !!data.identifying;
  const strokeDasharray = isIdentifying ? '0' : '6 6';
  const strokeColor = style?.stroke || '#f472b6';

  // 아이콘 공통 렌더러 (24x24, 중심 기준 회전/정렬)
  const renderIconAt = (Icon, cx, cy, deg) => {
    if (!Icon) return null;
    return (
      <g
        transform={`translate(${cx}, ${cy}) rotate(${deg}) translate(-12, -12)`}
        style={{ pointerEvents: 'none' }}
      >
        <Icon width={24} height={24} />
      </g>
    );
  };

  // 카드에 따른 아이콘 결정
  const SourceIcon = pickIcon(
  data.sourceCard != null ? String(data.sourceCard) : null
  );
  const TargetIcon = pickIcon(
    data.targetCard != null ? String(data.targetCard) : null
  );

  return (
    <g style={{ color: strokeColor }}>
      {/* 연결선 */}
      <path
        className="react-flow__edge-path"
        id={id}
        d={edgePath}
        fill="none"
        stroke="currentColor"
        strokeWidth={isIdentifying ? 2.5 : 2}
        strokeDasharray={strokeDasharray}
        opacity={selected ? 1 : 0.9}
      />

      {/* 클릭/선택 판정용 히트박스 */}
      <path
        className="react-flow__edge-interaction"
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        pointerEvents="stroke"
      />

      {/* 아이콘: 항상 수평, 테이블에 밀착 */}
      {renderIconAt(TargetIcon, targetIconX, targetIconY, targetIconDeg)}
      {renderIconAt(SourceIcon, sourceIconX, sourceIconY, sourceIconDeg)}

      {/* 라벨(옵션) */}
      {data?.label && (
        <text>
          <textPath
            href={`#${id}`}
            startOffset="50%"
            textAnchor="middle"
            fontSize="11"
            fill="currentColor"
          >
            {data.label}
          </textPath>
        </text>
      )}
    </g>
  );
}
