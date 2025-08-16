import React from 'react';
import { useGetGithub } from '@/api/hooks/github';

export default function GithubInfoPanel({ teamCode, onNeedRegister }) {
  const { data, isLoading, isError, refetch } = useGetGithub(teamCode);

  if (isLoading) return <div>불러오는 중...</div>;
  if (isError) return (
    <div>
      조회 중 오류가 발생했어요. <button onClick={() => refetch()}>다시 시도</button>
    </div>
  );

  // data: { raw, data }
  const raw = data?.raw;      // { success, data, error }일 수 있음
  const cfg = data?.data;     // 성공 시 설정 객체, 실패/미존재면 null

  // 서버가 { success:false, error:{code,message} }를 내려주는 경우
  if (raw && raw.success === false) {
    const code = raw?.error?.code;
    const msg  = raw?.error?.message || '등록 정보가 없습니다.';

    return (
      <div className="flex flex-col gap-2">
        <div style={{ color: 'crimson' }}>{msg} {code && `(${code})`}</div>
        {['40405','40407'].includes(code) && (
          <button onClick={onNeedRegister}>지금 등록하기</button>
        )}
        <button onClick={() => refetch()}>새로고침</button>
      </div>
    );
  }

  // 설정이 존재하지 않는 경우(응답이 평탄화되어 null)
  if (!cfg) {
    return (
      <div className="flex flex-col gap-2">
        <div>등록된 GitHub 정보가 없습니다.</div>
        {onNeedRegister && <button onClick={onNeedRegister}>지금 등록하기</button>}
        <button onClick={() => refetch()}>새로고침</button>
      </div>
    );
  }

  // 정상 표시
  const maskedToken = cfg.accessToken ? '••••••••' : '미설정';

  return (
    <div className="flex flex-col gap-2 p-3 rounded-lg border">
      <div><b>TeamCode</b>: {cfg.teamCode}</div>
      <div><b>Repo URL</b>: <a href={cfg.repoUrl} target="_blank" rel="noreferrer">{cfg.repoUrl}</a></div>
      <div><b>Private</b>: {cfg.isPrivate ? '예' : '아니오'}</div>
      <div><b>Default Branch</b>: {cfg.defaultBranch}</div>
      <div><b>Access Token</b>: {maskedToken}</div>
      <div className="flex gap-8 mt-2">
        <button onClick={() => refetch()}>새로고침</button>
        {onNeedRegister && <button onClick={onNeedRegister}>다시 등록</button>}
      </div>
    </div>
  );
}
