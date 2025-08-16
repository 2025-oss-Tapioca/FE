import React, { useEffect, useState, useCallback } from "react";
import NavButton from "./navButton";
import ServerButton from "./serverButton";
import AddServerButton from "./addServerButton";
import { useParams } from "react-router-dom";
import { getServers } from "../../api/apis/server";

import "../../styles/css/sideBar.css";

export default function Sidebar({
  activeTab,
  setActiveTab,
  refetchTrigger,
  onAddServerClick,
}) {
  const { teamCode } = useParams();
  const [serverData, setServerData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ 서버 정보 불러오기 함수 (useCallback으로 메모이제이션)
  const fetchServers = useCallback(async () => {
    if (!teamCode) return;
    console.log("[Sidebar] 서버 정보 fetch 시작");
    setIsLoading(true);
    try {
      const res = await getServers(teamCode);
      if (res.success) {
        setServerData(res.data);
        console.log("[Sidebar] 서버 정보 fetch 성공:", res.data); // ✅ 성공 결과
      } else {
        console.warn("[Sidebar] 서버 fetch 실패: 응답은 왔지만 success=false");
      }
    } catch (err) {
      console.error("[Sidebar] 서버 fetch 중 오류 발생:", err); // ✅ 에러 로그
    } finally {
      setIsLoading(false);
    }
  }, [teamCode]);
  // ✅ 팀 코드가 바뀔 때 서버 정보 새로 로드
  useEffect(() => {
    fetchServers();
  }, [fetchServers]);

  useEffect(() => {
    fetchServers();
  }, [refetchTrigger, fetchServers]);

  // ✅ 다른 탭에서 서버 변경 시 감지하여 갱신
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "serversNeedRefresh" && e.newValue === "true") {
        fetchServers(); // 다시 불러오기
        localStorage.setItem("serversNeedRefresh", "false"); // 플래그 리셋
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [fetchServers]);

  // ✅ 네비게이션 탭 목록
  const buttons = [
    "대시보드",
    "서버관리",
    "개발도구",
    "성능 테스트",
    "로그 모니터링",
  ];

  const iconMap = {
    대시보드: "dashboard",
    서버관리: "server",
    개발도구: "tool",
    "성능 테스트": "test",
    "로그 모니터링": "test",
  };

  return (
    <div className="side-bar">
      {/* 로고 영역 */}
      <div className="header">
        <img src="/assets/logo.svg" alt="logo" className="logo" />
        <div>TAPIOCA</div>
      </div>

      {/* 네비게이션 버튼 */}
      <div className="nav-buttons">
        {buttons.map((label) => {
          const baseName = iconMap[label];
          const isActive = activeTab === label;
          const iconSrc = `/assets/icons/${baseName}${
            isActive ? "-selected" : ""
          }.svg`;

          return (
            <NavButton
              key={label}
              label={label}
              icon={
                <img src={iconSrc} alt={`${label} icon`} className="nav-icon" />
              }
              active={isActive}
              onClick={() => setActiveTab(label)}
            />
          );
        })}
      </div>

      {/* 서버 목록 영역 */}
      <div>
        <div className="connected-server-header">연결된 서버</div>
        <div className="server-buttons">
          {isLoading ? (
            <p>서버 불러오는 중...</p>
          ) : serverData ? (
            <>
              {serverData.front && (
                <ServerButton
                  label="프론트 서버"
                  url={serverData.front.ec2Host}
                  defaultConnected={true}
                />
              )}
              {serverData.back && (
                <ServerButton
                  label="백엔드 서버"
                  url={serverData.back.ec2Url}
                  defaultConnected={true}
                />
              )}
              {serverData.db && (
                <ServerButton
                  label="DB 서버"
                  url={serverData.db.dbAddress}
                  defaultConnected={true}
                />
              )}
            </>
          ) : (
            <p>등록된 서버가 없습니다.</p>
          )}

          {/* 새 서버 추가 버튼 */}
          <AddServerButton onClick={onAddServerClick} />
        </div>
      </div>
    </div>
  );
}
