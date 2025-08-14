import React from 'react';
import { O_Bar_Crow, O_Crow, O_Bar, Bar_Crow, CrowOnly, BarOnly } from '../icons/ERDicons';

const ENDPOINTS = [
  { id: 'O_BAR_CROW', Icon: O_Bar_Crow, title: '없거나 한개 또는 여러개', card: '1' }, // 시각 보조용으로 | 포함
  { id: 'O_CROW',     Icon: O_Crow,     title: '없거나 여러개',   card: '2' },
  { id: 'O_BAR',      Icon: O_Bar,      title: '없거나 한개',   card: '3' },
  { id: 'BAR_CROW',   Icon: Bar_Crow,   title: '한개 또는 여러개',   card: '4' },
  { id: 'CROW',       Icon: CrowOnly,   title: '여러개',     card: '5' },
  { id: 'BAR',        Icon: BarOnly,    title: '한개',     card: '6' },
];

export default function EndpointPalette() {
  const onDragStart = (e, ep) => {
    e.dataTransfer.setData('application/erd-endpoint', JSON.stringify({ id: ep.id, card: ep.card }));
    e.dataTransfer.setData('text/plain', ep.id); // 호환성
    try { e.dataTransfer.effectAllowed = 'copyMove'; } catch {}
  };

  return (
    <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col gap-2 p-2 rounded-xl bg-[#2a2f3a]/90 z-10
                    [stroke-linecap:round] [stroke-linejoin:round]">
      {ENDPOINTS.map(ep => (
        <button
  key={ep.id}
  draggable
  onDragStart={e => onDragStart(e, ep)}
  title={ep.title}
  className="px-2 w-auto h-8 rounded-md bg-white/10 hover:bg-white/15 text-white grid place-items-center"
>
  <ep.Icon className="w-5 h-5" />
</button>

      ))}
    </div>
  );
}
