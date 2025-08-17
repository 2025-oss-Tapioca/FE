import React from 'react';
import { useDeleteGithub } from '@/api/hooks/github';
import '@/styles/css/AddServerModal.css';

export default function GithubDelete({ teamCode, onSuccess, className = "" }) {
  const { mutate, isPending } = useDeleteGithub();

  const onClick = () => {
    if (!teamCode) return alert('teamCode가 없습니다.');
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    mutate(teamCode, {
      onSuccess: (res) => {
        if (res?.success) {
          alert('삭제되었습니다.');
          onSuccess?.();
        } else {
          alert(res?.error?.message ?? '삭제 실패');
        }
      },
      onError: (err) => {
        console.error('[GITHUB DELETE ERROR]', err?.response?.data || err);
        alert('삭제 중 오류가 발생했습니다.');
      },
    });
  };

  return (
    <button
    onClick={onClick}
    disabled={isPending}
    className={className || "modal-danger-button"}
    >
    <img
        src="/assets/icons/image-github.svg"
        alt="Github"
        className="icon"
    />  
    {isPending ? '삭제 중...' : 'GitHub 삭제'}
  </button>
  );
}