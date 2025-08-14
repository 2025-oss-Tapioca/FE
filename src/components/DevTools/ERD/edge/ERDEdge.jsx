// src/components/DevTools/ERD/edge/ERDEdge.jsx
import React from 'react';
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
const PAD = 6;        // 0~1px 미세조정 (경계 겹침/틈 방지)

export default function ErdEdge(props) {
  const {
    id,
    sourceX, sourceY,
    targetX, targetY,
    selected,
    style,
    data = {},
  } = props;

  // 방향/단위벡터
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;

  // 아이콘이 수평이므로, 선의 시작/끝을 아이콘 바깥 가장자리에 '직접' 맞춘다.
  // ux>=0이면 좌→우로 진행(소스 아이콘은 왼쪽에, 타깃 아이콘은 오른쪽에 위치)
  const goingRight = ux >= 0;

  // 아이콘 중심 좌표
  const targetIconDeg = goingRight ? 0 : 180;
  const targetIconX = goingRight ? (targetX - ICON_HALF + PAD) : (targetX + ICON_HALF - PAD);
  const targetIconY = targetY;

  const sourceIconDeg = goingRight ? 180 : 0;
  const sourceIconX = goingRight ? (sourceX + ICON_HALF - PAD) : (sourceX - ICON_HALF + PAD);
  const sourceIconY = sourceY;

  // 선의 시작/끝 = 아이콘 '바깥쪽' 엣지
  const sx = goingRight ? (sourceIconX + ICON_HALF - 3) : (sourceIconX - ICON_HALF);
  const sy = sourceIconY;
  const tx = goingRight ? (targetIconX - ICON_HALF + 1) : (targetIconX + ICON_HALF);
  const ty = targetIconY;

  // (기존)
  const edgePath = `M ${sx} ${sy} L ${tx} ${ty}`;


  const isIdentifying = !!data.identifying;
  const strokeDasharray = isIdentifying ? '0' : '6 6';
  const strokeColor = style?.stroke || '#f472b6';

  // 아이콘은 항상 수평(→ 또는 ←)
  const angleDeg = ux >= 0 ? 0 : 180;

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
