// src/components/Github/GithubInfoModal.jsx
import React, { useEffect } from 'react';
import GithubInfoPanel from '@/components/Github/GithubInfoPanel';
import '@/styles/css/AddServerModal.css';

export default function GithubInfoModal({ teamCode, onClose, onNeedRegister }) {
  // ESC 닫기
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* 이벤트 버블링 방지해서 내용 클릭해도 닫히지 않게 */}
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 520 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2>GitHub 설정 조회</h2>
        </div>

        {/* 실제 조회 패널 */}
        <GithubInfoPanel teamCode={teamCode} onNeedRegister={onNeedRegister} />
      </div>
    </div>
  );
}
