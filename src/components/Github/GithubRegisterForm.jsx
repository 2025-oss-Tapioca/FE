import React, { useState } from 'react';
import { useRegisterGithub } from '@/api/hooks/github';

export default function GithubRegisterForm({ teamCode, onDone }) {
  const [repoUrl, setRepoUrl] = useState('');
  const [defaultBranch, setDefaultBranch] = useState('main');
  const [isPrivate, setIsPrivate] = useState(true);
  const [accessToken, setAccessToken] = useState('');

  const { mutate, isPending, data, error } = useRegisterGithub();

  const handleSubmit = (e) => {
    e.preventDefault();

    // 간단 검증
    const urlOk = /^https:\/\/github\.com\/[^/]+\/[^/]+(\.git)?$/.test(repoUrl);
    if (!urlOk) return alert('repoUrl 형식: https://github.com/{owner}/{repo}');
    if (!accessToken) return alert('Personal Access Token(PAT)을 입력하세요.');

    mutate(
      { teamCode, repoUrl, isPrivate, accessToken, defaultBranch },
      {
        onSuccess: (res) => {
          // 인터셉터로 이미 res는 서버의 최상위 응답객체
          // { success: boolean, data: null, error: {code,message}|null } 예상
          if (res?.success) {
            alert('GitHub 저장소 등록 완료!');
            // 보안상 폼 초기화
            setAccessToken('');
            onDone?.();
          } else {
            alert(res?.error?.message ?? '등록 실패');
          }
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-xl">
      <label className="flex flex-col gap-1">
        <span>저장소 URL</span>
        <input
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="https://github.com/owner/repo"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span>기본 브랜치</span>
        <input
          value={defaultBranch}
          onChange={(e) => setDefaultBranch(e.target.value)}
          placeholder="main"
        />
      </label>

      <label className="inline-flex items-center gap-2">
        <input
          type="checkbox"
          checked={isPrivate}
          onChange={(e) => setIsPrivate(e.target.checked)}
        />
        Private 저장소
      </label>

      <label className="flex flex-col gap-1">
        <span>Personal Access Token (repo 권한 필요)</span>
        <input
          type="password"
          value={accessToken}
          onChange={(e) => setAccessToken(e.target.value)}
          placeholder="ghp_xxx..."
        />
      </label>

      <button type="submit" disabled={isPending}>
        {isPending ? '등록 중...' : '등록'}
      </button>

      {/* 실패 메세지 보조 표기 (선택) */}
      {data && !data.success && (
        <p style={{ color: 'crimson' }}>
          {data.error?.code} · {data.error?.message}
        </p>
      )}
      {error && <p style={{ color: 'crimson' }}>네트워크 오류</p>}
    </form>
  );
}
