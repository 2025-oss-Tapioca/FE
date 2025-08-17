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

const TableNode = ({ data }) => {
  const { table, onEdit, onDelete } = data || {};
  if (!table) return null;

  return (
    <div className='erd-table-box rf-node'>
      {/* 연결 핸들: 왼쪽(타겟), 오른쪽(소스) */}
      <Handle type='target' position={Position.Left} />
      <Handle type='source' position={Position.Right} />

      <div className='erd-table-header'>
        {table.name}
        <div className='icon-actions'>
          <Pencil size={16} onClick={() => onEdit?.(table)} className='icon-button' />
          <X size={18} onClick={() => onDelete?.(table)} className='icon-button' />
        </div>
      </div>

      <ul className='erd-column-list'>
        {table.columns?.map((col, i) => (
          <li key={i} className='erd-column-item'>
            {col.isPrimary && (
              <img src='/assets/icons/primary_key.svg' alt='Primary-table' className='icon-table' />
            )}
            {!col.isPrimary && col.isForeign && (
              <img src='/assets/icons/foreign_key.svg' alt='Foreign-table' className='icon-table' />
            )}
            <span className='column-name'>{col.name}</span>
            <span className='column-type'>{renderType(col.type, col.varcharLength)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TableNode;
