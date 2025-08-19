// src/components/Github/GithubManagerModal.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Search, PlusCircle, RefreshCcw, Trash2 } from 'lucide-react';
import GithubRegisterForm from '@/components/Github/GithubRegisterForm';
import GithubUpdateForm from '@/components/Github/GithubUpdateForm';
import GithubInfoPanel from '@/components/Github/GithubInfoPanel';
import GithubDelete from '@/components/Github/GithubDelete';
import { useGetGithub } from '@/api/hooks/github';   // ✅ 추가

import '@/styles/css/AddServerModal.css';        // 기존 모달 공통 버튼/레이아웃
import '@/styles/css/GithubManagerModal.css';    // 이번에 만든 전용 스타일

export default function GithubManagerModal({ teamCode, onClose }) {
  const [tab, setTab] = useState('info'); // 'info' | 'register' | 'update' | 'delete'

  // 현재 팀의 깃허브 설정 존재 여부 조회
  const { data: gh, isLoading } = useGetGithub(teamCode);
  const hasConfig = Boolean(gh?.data);   // 서버 래핑 구조: { raw, data }

  // ESC 종료
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // 설정유무가 바뀌면, 금지된 탭에 있지 않도록 보정
  useEffect(() => {
    if (!hasConfig && (tab === 'update' || tab === 'delete')) setTab('info');
    if (hasConfig && tab === 'register') setTab('info');
  }, [hasConfig, tab]);

  const handleNeedRegister = useCallback(() => setTab('register'), []);

  // 버튼 핸들러: 비활성 상태면 무시
  const guardedSetTab = (next, disabled) => {
    if (disabled) return;
    setTab(next);
  };

  // 비활성 조건
  const disableRegister = !isLoading && hasConfig;       // 설정 있으면 등록 금지
  const disableUpdateDelete = !isLoading && !hasConfig;  // 설정 없으면 업데이트/삭제 금지

  return (
    <div className="github-modal-overlay" onClick={onClose}>
      <div className="github-modal" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="github-modal-header">
          <h2>GitHub 관리</h2>
          <button className="modal-close-button" onClick={onClose}>×</button>
        </div>

        {/* 탭 */}
        <div className="github-modal-tabs">
          <button
            className={`github-tab ${tab === 'info' ? 'active' : ''}`}
            onClick={() => setTab('info')}
          >
            <Search size={16} />
            조회
          </button>

          <button
            className={`github-tab ${tab === 'register' ? 'active' : ''} ${disableRegister ? 'disabled' : ''}`}
            onClick={() => guardedSetTab('register', disableRegister)}
            disabled={disableRegister}
            aria-disabled={disableRegister}
            title={disableRegister ? '이미 등록되어 있어요' : ''}
          >
            <PlusCircle size={16} />
            등록
          </button>

          <button
            className={`github-tab ${tab === 'update' ? 'active' : ''} ${disableUpdateDelete ? 'disabled' : ''}`}
            onClick={() => guardedSetTab('update', disableUpdateDelete)}
            disabled={disableUpdateDelete}
            aria-disabled={disableUpdateDelete}
            title={disableUpdateDelete ? '등록된 설정이 없어요' : ''}
          >
            <RefreshCcw size={16} />
            업데이트
          </button>

          <button
            className={`github-tab ${tab === 'delete' ? 'active' : ''} ${disableUpdateDelete ? 'disabled' : ''}`}
            onClick={() => guardedSetTab('delete', disableUpdateDelete)}
            disabled={disableUpdateDelete}
            aria-disabled={disableUpdateDelete}
            title={disableUpdateDelete ? '등록된 설정이 없어요' : ''}
          >
            <Trash2 size={16} />
            삭제
          </button>
        </div>

        {/* 컨텐츠 */}
        <div className="github-modal-body">
          {tab === 'info' && (
            <GithubInfoPanel teamCode={teamCode} onNeedRegister={handleNeedRegister} />
          )}
          {tab === 'register' && (
            <GithubRegisterForm
              teamCode={teamCode}
              onDone={() => setTab('info')}
            />
          )}
          {tab === 'update' && (
            <GithubUpdateForm
              teamCode={teamCode}
              onDone={() => setTab('info')}
            />
          )}
          {tab === 'delete' && (
            <div className="flex flex-col gap-3">
              <p>현재 등록된 GitHub 설정을 삭제합니다. 이 작업은 되돌릴 수 없습니다.</p>
              <GithubDelete
                teamCode={teamCode}
                className="modal-delete-button"
                onSuccess={() => setTab('info')}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
