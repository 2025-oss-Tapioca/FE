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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl">
  {/* 저장소 URL */}
  <label className="flex flex-col gap-2">
    <span className="text-sm font-semibold text-gray-700">Repo URL</span>
    <input
      value={repoUrl}
      onChange={(e) => setRepoUrl(e.target.value)}
      placeholder="https://github.com/owner/repo"
      className="px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-medium"
    />
  </label>

  {/* 기본 브랜치 */}
  <label className="flex flex-col gap-2">
    <span className="text-sm font-semibold text-gray-700">Default Branch</span>
    <input
      value={defaultBranch}
      onChange={(e) => setDefaultBranch(e.target.value)}
      placeholder="main"
      className="px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-medium"
    />
  </label>

  {/* Private 체크박스 */}
  <label className="inline-flex items-center gap-2">
    <input
      type="checkbox"
      checked={isPrivate}
      onChange={(e) => setIsPrivate(e.target.checked)}
      className="w-4 h-4 accent-blue-500"
    />
    <span className="text-sm font-semibold text-gray-700">Private</span>
  </label>

  {/* 토큰 */}
  <label className="flex flex-col gap-2">
    <span className="text-sm font-semibold text-gray-700">
      Personal Access Token (변경 시에만 입력)
    </span>
    <input
      type="password"
      value={accessToken}
      onChange={(e) => setAccessToken(e.target.value)}
      placeholder="ghp_xxx..."
      className="px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-medium"
    />
  </label>

  {/* 액션 버튼 */}
  <div className="modal-actions mt-4 flex justify-end gap-3">
    <button
      type="button"
      onClick={onDone}
      className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
    >
      취소
    </button>
    <button
      type="submit"
      disabled={isPending}
      className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300"
    >
      {isPending ? '업데이트 중...' : '업데이트'}
    </button>
  </div>

  {/* 에러 표시 */}
  {data && !data.success && (
    <p className="text-sm text-red-600">
      {data.error?.code} · {data.error?.message}
    </p>
  )}
  {error && <p className="text-sm text-red-600">네트워크 오류</p>}
</form>

  );
}
