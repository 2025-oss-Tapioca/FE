// src/components/Github/GithubUpdateForm.jsx
import React, { useEffect, useState } from 'react';
import { useGetGithub, useUpdateGithub } from '@/api/hooks/github';

export default function GithubUpdateForm({ teamCode, onDone }) {
  const { data: gh } = useGetGithub(teamCode);
  const { mutate, isPending, data, error } = useUpdateGithub();

  const [repoUrl, setRepoUrl] = useState('');
  const [defaultBranch, setDefaultBranch] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [accessToken, setAccessToken] = useState('');

  // 서버 데이터로 초기값 세팅
  useEffect(() => {
    const d = gh?.data; // wrap()으로 {raw,data} 구조
    if (!d) return;
    setRepoUrl(d.repoUrl ?? '');
    setDefaultBranch(d.defaultBranch ?? '');
    setIsPrivate(Boolean(d.isPrivate));
    // 토큰은 보안상 빈칸 유지 권장. 필요 시 별도 UX(“변경 시에만 입력”)로.
    setAccessToken(d.accessToken ?? '');
  }, [gh]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const urlOk = /^https:\/\/github\.com\/[^/]+\/[^/]+(\.git)?$/.test(repoUrl);
    if (!urlOk) return alert('repoUrl 형식: https://github.com/{owner}/{repo}');

    mutate(
      { teamCode, repoUrl, isPrivate, accessToken, defaultBranch },
      {
        onSuccess: (res) => {
          if (res?.success) {
            alert('GitHub 설정이 업데이트되었습니다.');
            setAccessToken(''); // 보안상 초기화
            onDone?.();
          } else {
            alert(res?.error?.message ?? '업데이트 실패');
          }
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-xl">
      <label className="flex flex-col gap-1">
        <span><b>저장소 URL</b></span>
        <input value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} placeholder="https://github.com/owner/repo" />
      </label>

      <label className="flex flex-col gap-1">
        <span><b>Default Branch</b></span>
        <input value={defaultBranch} onChange={(e) => setDefaultBranch(e.target.value)} placeholder="main" />
      </label>

      <label className="inline-flex items-center">
        <input
          type="checkbox"
          checked={isPrivate}
          onChange={(e) => setIsPrivate(e.target.checked)}
          className="mr-2"   // ✅ 체크박스 오른쪽 간격
        />
        <span><b>Private</b></span>
      </label>


      <label className="flex flex-col gap-1">
        <span><b>Personal Access Token (변경 시에만 입력)</b></span>
        <input type="password" value={accessToken} onChange={(e) => setAccessToken(e.target.value)} placeholder="ghp_xxx..." />
      </label>

      <div className="modal-actions">
        <button type="button" onClick={onDone}>취소</button>
        <button type="submit" disabled={isPending}>
          {isPending ? '업데이트 중...' : '업데이트'}
        </button>
      </div>

      {data && !data.success && <p style={{ color: 'crimson' }}>{data.error?.code} · {data.error?.message}</p>}
      {error && <p style={{ color: 'crimson' }}>네트워크 오류</p>}
    </form>
  );
}
