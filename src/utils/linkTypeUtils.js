// src/utils/linkTypeUtils.js
// 카드 번호 → 최대 카디널리티
const CARD_MAX = {
  1: "N", // O_Bar_Crow
  2: "N", // O_Crow
  3: 1, // O_Bar
  4: "N", // Bar_Crow
  5: "N", // CrowOnly
  6: 1, // BarOnly
};

export function decideLinkTypeByCard(sourceCard, targetCard) {
  const s = CARD_MAX[String(sourceCard)];
  const t = CARD_MAX[String(targetCard)];
  if (s === 1 && t === 1) return "ONE_TO_ONE";
  if (s === 1 && t === "N") return "ONE_TO_MANY";
  if (s === "N" && t === 1) return "MANY_TO_ONE";
  return "MANY_TO_MANY";
}

// export function buildAttributeLink(edge) {
//   return {
//     fromClientId: edge?.data?.fromClientId,
//     toClientId: edge?.data?.toClientId,
//     linkType: decideLinkTypeByCard(
//       edge?.data?.sourceCard,
//       edge?.data?.targetCard
//     ),
//     // identifying: !!edge?.data?.identifying, // 필요 시
//   };
// }

// export function buildPayload(edges) {
//   // data가 없는 edge는 제외(방어코드)
//   const attributeLinks = (edges || [])
//     .filter((e) => e?.data && e.data.fromClientId && e.data.toClientId)
//     .map(buildAttributeLink);

//   return { attributeLinks };
// }
