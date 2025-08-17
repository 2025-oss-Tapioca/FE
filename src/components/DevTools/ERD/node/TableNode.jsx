// src/components/DevTools/node/TableNode.jsx
import React from 'react';
import { Handle, Position } from 'reactflow';
import { Pencil, X } from 'lucide-react';
import '@/styles/css/ERDEditor.css';

const renderType = (t, len) => {
  if (!t) return '';
  if ((t.toLowerCase() === 'varchar' || t.toLowerCase() === 'char') && len) {
    return `${t.toUpperCase()}(${len})`;
  }
  return t.toUpperCase();
};

// 행 중앙 Y 계산용 (스타일과 맞지 않으면 숫자만 조절)
const HEAD_H = 36;     // .erd-table-header 높이
const ROW_H = 28;      // .erd-column-item 한 줄 높이
const BODY_PAD_Y = 8;  // 리스트 위쪽 패딩

const TableNode = ({ data }) => {
  const { table, onEdit, onDelete } = data || {};
  if (!table) return null;

  return (
    <div className='erd-table-box rf-node'>
      {/* 연결 핸들: 왼쪽(타겟), 오른쪽(소스) */}

      <div className='erd-table-header'>
        {table.name}
        <div className='icon-actions'>
          <Pencil size={16} onClick={() => onEdit?.(table)} className='icon-button' />
          <X size={18} onClick={() => onDelete?.(table)} className='icon-button' />
        </div>
      </div>

      <ul className='erd-column-list'>
        {table.columns?.map((col, i) => {
          // 행(i번째)의 '중앙' Y
          const top = HEAD_H + BODY_PAD_Y + i * ROW_H + ROW_H / 2;

          // 핸들 id 규칙: "{컬럼 식별자}:{L|R}"
          const colId = col.clientId || col.id || String(i);
          const leftId = `${colId}:L`;
          const rightId = `${colId}:R`;

          return (
            <li key={colId} className='erd-column-item'>
              {col.isPrimary && (
                <img src='/assets/icons/primary_key.svg' alt='Primary-table' className='icon-table' />
              )}
              {!col.isPrimary && col.isForeign && (
                <img src='/assets/icons/foreign_key.svg' alt='Foreign-table' className='icon-table' />
              )}
              <span className='column-name'>{col.name}</span>
              <span className='column-type'>{renderType(col.type, col.varcharLength)}</span>
            </li>
          );
        })}
      </ul>
      {/* Left */}
      <Handle id='L' type='source' position={Position.Left}
              style={{ top: '50%', width: 8, height: 8, opacity: 0.001 }} />
      <Handle id='L' type='target' position={Position.Left}
              style={{ top: '50%', width: 8, height: 8, opacity: 0.001 }} />

      {/* Right */}
      <Handle id='R' type='source' position={Position.Right}
              style={{ top: '50%', width: 8, height: 8, opacity: 0.001 }} />
      <Handle id='R' type='target' position={Position.Right}
              style={{ top: '50%', width: 8, height: 8, opacity: 0.001 }} />

      {/* Top */}
      <Handle id='T' type='source' position={Position.Top}
              style={{ left: '50%', width: 8, height: 8, opacity: 0.001 }} />
      <Handle id='T' type='target' position={Position.Top}
              style={{ left: '50%', width: 8, height: 8, opacity: 0.001 }} />

      {/* Bottom */}
      <Handle id='B' type='source' position={Position.Bottom}
              style={{ left: '50%', width: 8, height: 8, opacity: 0.001 }} />
      <Handle id='B' type='target' position={Position.Bottom}
              style={{ left: '50%', width: 8, height: 8, opacity: 0.001 }} />
    </div>
  );
};

export default TableNode;
