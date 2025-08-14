// src/icons/ERDicons.jsx
import { createLucideIcon } from 'lucide-react';

/** 공통 스타일 */
const cap = { 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };

/** 기본 좌표(24×24 viewBox 기준) */
const MID_X1 = 3;                 // 왼쪽 짧은 막대 시작 X
const MID_X2 = 7;                 // 왼쪽 짧은 막대 끝 X
const OCX = 12;                   // 원 중심 X
const OCY = 12;                   // 원 중심 Y
const OR  = 4.5;                  // 원 반지름

// 세로 바(|)
const BARX = OCX + OR + 2;        // 원 오른쪽 끝 + 여백(≈18.5)

// 까마귀발(<) - 오른쪽 끝을 고정하고 시작점은 역산
const CROW_Y     = 12;
const CROW_END_X = 23;            // 새발의 가장 오른쪽
const CROW_SPAN  = 6;             // 가닥 길이(5~7 사이 취향대로)
const CROW_X0    = CROW_END_X - CROW_SPAN;  // 시작 X

const VIEW_CENTER_X = 12;

/** 중앙정렬: 아이콘 좌우(extents)를 받아 center(=12)로 쉬프트 */
const shiftXFor = (leftMost, rightMost) =>
  VIEW_CENTER_X - (leftMost + rightMost) / 2;

/** 공통 path helpers */
const sx = (x, s) => String(x + s);
const sy = (y, _s) => String(y);
const midPath = (sxv, syv) =>
  ['path', { d: `M${sxv(MID_X1)} ${syv(12)} H${sxv(MID_X2)}`, key: 'mid', ...cap }];

/* ---------------- 1) circle + bar + crow (O ─ | <) ---------------- */
export const O_Bar_Crow = createLucideIcon('O_Bar_Crow', (() => {
  const leftMost  = MID_X1;
  const rightMost = CROW_END_X;           // 항상 새발의 끝으로 고정
  const PAD_X = -1;                       
  const sxv = x => sx(x, shiftXFor(leftMost, rightMost) + PAD_X);
  const syv = y => sy(y, 0);

  return [
    midPath(sxv, syv),
    ['circle', { cx: sxv(OCX), cy: syv(OCY), r: String(OR), fill: 'none', key: 'o', ...cap }],
    ['path',   { d: `M${sxv(BARX)} ${syv(6)} L${sxv(BARX)} ${syv(18)}`, key: 'bar', ...cap }],
    ['path',   { d: `M${sxv(CROW_X0)} ${syv(CROW_Y)} L${sxv(CROW_END_X)} ${syv(8)}`,  key: 'c1', ...cap }],
    ['path',   { d: `M${sxv(CROW_X0)} ${syv(CROW_Y)} L${sxv(CROW_END_X)} ${syv(12)}`, key: 'c2', ...cap }],
    ['path',   { d: `M${sxv(CROW_X0)} ${syv(CROW_Y)} L${sxv(CROW_END_X)} ${syv(16)}`, key: 'c3', ...cap }],
  ];
})());

/* ---------------- 2) circle + crow (O ─ <) ---------------- */
export const O_Crow = createLucideIcon('O_Crow', (() => {
  const leftMost  = MID_X1;
  const rightMost = CROW_END_X;
  const PAD_X = -1;
  const sxv = x => sx(x, shiftXFor(leftMost, rightMost) + PAD_X);
  const syv = y => sy(y, 0);

  return [
    midPath(sxv, syv),
    ['circle', { cx: sxv(OCX), cy: syv(OCY), r: String(OR), fill: 'none', key: 'o', ...cap }],
    ['path',   { d: `M${sxv(CROW_X0)} ${syv(CROW_Y)} L${sxv(CROW_END_X)} ${syv(8)}`,  key: 'c1', ...cap }],
    ['path',   { d: `M${sxv(CROW_X0)} ${syv(CROW_Y)} L${sxv(CROW_END_X)} ${syv(12)}`, key: 'c2', ...cap }],
    ['path',   { d: `M${sxv(CROW_X0)} ${syv(CROW_Y)} L${sxv(CROW_END_X)} ${syv(16)}`, key: 'c3', ...cap }],
  ];
})());

/* ---------------- 3) circle + bar (O ─ |) ---------------- */
export const O_Bar = createLucideIcon('O_Bar', (() => {
  const barX = BARX;                 // 기존 세로바 위치
  const TICK_HALF = 3;                // 가로작대기 길이의 절반(=총 6px)
  const tickX1 = barX + 1;            // 가로작대기 시작 X (세로바 오른쪽 1px부터)
  const tickX2 = tickX1 + (TICK_HALF * 2); // 가로작대기 끝 X
  const tickY  = 12;                  // 중앙 높이

  const leftMost  = MID_X1;
  const rightMost = tickX2;           // 가장 오른쪽 요소를 가로작대기 끝으로
  const PAD_X = 0;
  const sxv = x => sx(x, shiftXFor(leftMost, rightMost) + PAD_X);
  const syv = y => sy(y, 0);

  return [
    midPath(sxv, syv),
    ['circle', { cx: sxv(OCX), cy: syv(OCY), r: String(OR), fill: 'none', key: 'o', ...cap }],
    // 기존 세로바
    ['path', { d: `M${sxv(barX)} ${syv(6)} L${sxv(barX)} ${syv(18)}`, key: 'bar', ...cap }],
    // 추가되는 가로작대기
    ['path', { d: `M${sxv(tickX1)} ${syv(tickY)} H${sxv(tickX2)}`, key: 'hbar', ...cap }],
  ];
})());


/* ---------------- 4) bar + crow (─ | <) ---------------- */
export const Bar_Crow = createLucideIcon('Bar_Crow', (() => {
  // 튜닝 포인트
  const GAP_LEFT_TO_BAR = 3;   // 왼쪽 짧은 막대 끝(MID_X2)에서 세로바까지 간격
  const GAP_AFTER_BAR   = 1.0; // 세로바와 새발 사이 간격(0~1 추천)
  const SPAN            = CROW_SPAN; // 새발 가닥 길이 (전역과 동일하게)

  // 1) 원 없이 쓰는 세로바 X좌표(왼쪽으로 당김)
  const barX = MID_X2 + GAP_LEFT_TO_BAR;   // 예: 7 + 3 = 10

  // 2) 새발을 세로바 기준으로 재계산
  const crowX0  = barX + GAP_AFTER_BAR;    // 시작 X
  const crowEnd = crowX0 + SPAN;           // 끝 X (오른쪽 한계)

  // 3) 중앙 정렬 기준은 실제 오른쪽 끝(crowEnd)
  const leftMost  = MID_X1;
  const rightMost = crowEnd;
  const PAD_X = 1;
  const sxv = x => String(x + (12 - (leftMost + rightMost) / 2) + PAD_X);
  const syv = y => String(y);

  // 4) 왼쪽 짧은 막대는 barX 바로 앞까지 살짝 여유 두고 확장
  const LEFT_EXTEND = 4; // ← 가로막대만 연장할 길이(px)
  const midStart = MID_X1 - LEFT_EXTEND;
  const midEnd = barX - 1; // 세로바와 1px 여유

  return [
    // 왼쪽 짧은 가로선(기존 midPath 대신, 끝점을 barX 근처로 확장)
    ['path', { d: `M${sxv(midStart)} ${syv(12)} H${sxv(midEnd)}`, key: 'mid', ...cap }],

    // 세로바(왼쪽으로 당겨진 위치)
    ['path', { d: `M${sxv(barX)} ${syv(6)} L${sxv(barX)} ${syv(18)}`, key: 'bar', ...cap }],

    // 새발(세로바 기준으로 붙임)
    ['path', { d: `M${sxv(crowX0)} ${syv(CROW_Y)} L${sxv(crowEnd)} ${syv(8)}`,  key: 'c1', ...cap }],
    ['path', { d: `M${sxv(crowX0)} ${syv(CROW_Y)} L${sxv(crowEnd)} ${syv(12)}`, key: 'c2', ...cap }],
    ['path', { d: `M${sxv(crowX0)} ${syv(CROW_Y)} L${sxv(crowEnd)} ${syv(16)}`, key: 'c3', ...cap }],
  ];
})());

/* ---------------- 5) crow (─ <) ---------------- */
export const CrowOnly = createLucideIcon('CrowOnly', (() => {
  const leftMost  = MID_X1;
  
  // 막대(=midPath 끝) 바로 옆에 새발 붙이기
  const GAP_AFTER_MID = 1.0;       // 왼쪽 막대와 새발 사이 간격
  const crowSpan = CROW_SPAN;      // 가닥 길이
  const LEFT_TICK_EXTEND = 4;
  const MID_END = MID_X2 + LEFT_TICK_EXTEND;
  const crowX0  = MID_END + GAP_AFTER_MID;
  const crowEnd = crowX0 + crowSpan;

  // 중앙정렬 기준을 새발 끝으로
  const rightMost = crowEnd;
  const PAD_X = 1;
  const sxv = x => String(x + (12 - (leftMost + rightMost) / 2) + PAD_X);
  const syv = y => String(y);

  return [
    ['path', { d: `M${sxv(MID_X1 - 4)} ${syv(12)} H${sxv(MID_X1)}`, key: 'extraLeft', ...cap }],
    // 왼쪽 짧은 가로선
    ['path', { d: `M${sxv(MID_X1)} ${syv(12)} H${sxv(MID_END)}`, key: 'mid', ...cap }],

    // 새발(막대 기준)
    ['path', { d: `M${sxv(crowX0)} ${syv(CROW_Y)} L${sxv(crowEnd)} ${syv(8)}`,  key: 'c1', ...cap }],
    ['path', { d: `M${sxv(crowX0)} ${syv(CROW_Y)} L${sxv(crowEnd)} ${syv(12)}`, key: 'c2', ...cap }],
    ['path', { d: `M${sxv(crowX0)} ${syv(CROW_Y)} L${sxv(crowEnd)} ${syv(16)}`, key: 'c3', ...cap }],
  ];
})());

/* ---------------- 6) bar + vertical + bar (─ | ─) - 공백 제거 ---------------- */
export const BarOnly = createLucideIcon('BarOnly', (() => {
  const SW = 2;                      // strokeWidth (Lucide 기본)
  const GAP_LEFT_TO_BAR = 3;          // 왼쪽 짧은 막대 끝(MID_X2) → 세로바 간격
  const TICK_LEN = 6;                 // 오른쪽 가로막대 길이

  // 원 없는 전용 세로바 위치 (왼쪽으로 당김)
  const barX = MID_X2 + GAP_LEFT_TO_BAR;      // 예: 7 + 3 = 10
  const tickEndX = barX + TICK_LEN;           // 오른쪽 가로막대 끝

  const leftMost  = MID_X1;
  const rightMost = tickEndX;                 // 오른쪽 끝은 가로막대 끝
  const PAD_X = 2;

  const sxv = x => String(x + (12 - (leftMost + rightMost) / 2) + PAD_X);
  const syv = y => String(y);

  // 왼쪽 짧은 막대 끝을 세로바 바로 앞까지 확장 (공백 제거)
  const midEnd = barX - (SW / 2); // 반 스트로크만큼 여유 → 완전 붙어서 보임

  return [
    ['path', { d: `M${sxv(MID_X1 - 4)} ${syv(12)} H${sxv(MID_X1)}`, key: 'extraLeft', ...cap }],
    // 왼쪽 짧은 막대 (midPath 대신 직접 좌표 지정)
    ['path', { d: `M${sxv(MID_X1)} ${syv(12)} H${sxv(midEnd)}`, key: 'mid', ...cap }],

    // 세로바 위쪽 + 오른쪽 가로막대기를 하나의 path로 연결 (틈 없음)
    ['path', {
      d: `M${sxv(barX)} ${syv(6)} V${syv(12)} H${sxv(tickEndX)}`,
      key: 'barTopWithRightTick',
      'stroke-linecap': 'butt',
      'stroke-linejoin': 'miter',
      'stroke-width': SW,
    }],

    // 세로바 아래쪽
    ['path', {
      d: `M${sxv(barX)} ${syv(12)} V${syv(18)}`,
      key: 'barBottom',
      'stroke-linecap': 'butt',
      'stroke-linejoin': 'miter',
      'stroke-width': SW,
    }],
  ];
})());
