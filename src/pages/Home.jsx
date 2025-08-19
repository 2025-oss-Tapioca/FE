import React, { useState } from "react";
import { useParams } from "react-router-dom";
import SideBar from "../components/common/sideBar";
import Dashboard from "./Dashboard";
import ServerManagement from "./ServerManagement";
import DevTools from "./DevTools";
import PerformanceTest from "./PerformanceTest";
import LogMonitoring from "./LogMonitoring";
import AddServerModal from "../components/ServerManagement/AddServerModal";
import GithubRegisterModal from "@/components/Github/GithubRegisterModal";

import { checkServerStatus } from "../api/apis/server";
import { useServerActions } from "../api/hooks/server";

import "../styles/css/home.css";

const ERROR_MESSAGES = {
  40904: "프론트 서버 등록은 팀 당 1번만 가능합니다.",
  40905: "백엔드 서버 등록은 팀 당 1번만 가능합니다.",
  40906: "디비 서버 등록은 팀 당 1번만 가능합니다.",
  default: "서버 등록 중 알 수 없는 오류가 발생했습니다.",
};

const Home = () => {
  const [activeTab, setActiveTab] = useState("대시보드");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGithubModal, setShowGithubModal] = useState(false);
  const [refetchTrigger, setRefetchTrigger] = useState(false);
  const triggerServerRefetch = () => {
    setRefetchTrigger((prev) => !prev);
  };

  const { teamCode } = useParams();

  const { registerFront, registerBackend, registerDB } = useServerActions();

  const handleAddServer = async (newServer) => {
    try {
      const payload = { ...newServer, teamCode };

      const registerMap = {
        frontend: registerFront,
        backend: registerBackend,
        database: registerDB,
      };

      const registerFn = registerMap[newServer.type];
      if (!registerFn) throw new Error("지원하지 않는 서버 유형입니다.");

      const res = await new Promise((resolve, reject) =>
        registerFn(payload, {
          onSuccess: (data) => resolve(data),
          onError: (err) => reject(err),
        })
      );

      if (!res?.success) {
        const errorCode = res?.error?.code || null;
        const errorMessage =
          res?.error.message ||
          ERROR_MESSAGES[errorCode] ||
          ERROR_MESSAGES.default;
        alert(errorMessage);
        return;
      }

      const url =
        newServer.type === "database" ? newServer.dbAddress : newServer.ec2Host;

      await checkServerStatus(url);
      alert("서버가 성공적으로 등록되었습니다.");
    } catch (error) {
      const errorCode = error?.response?.data?.code || error?.code || null;
      const errorMessage =
        ERROR_MESSAGES[errorCode] ||
        error?.response?.data?.message ||
        error?.message ||
        ERROR_MESSAGES.default;
      alert(errorMessage);
    } finally {
      setShowAddModal(false);
    }
  };

  return (
    <div className="container">
      <div className="layout-inner">
        <SideBar
          className="side-bar"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          refetchTrigger={refetchTrigger}
          onAddServerClick={() => setShowAddModal(true)}
          onGithubRegisterClick={() => setShowGithubModal(true)}
        />
        <main className="main-content">
          {activeTab === "대시보드" && <Dashboard />}
          {activeTab === "서버관리" && (
            <ServerManagement
              teamCode={teamCode}
              onServerChanged={triggerServerRefetch}
            />
          )}
          {activeTab === "개발도구" && <DevTools />}
          {activeTab === "성능 테스트" && <PerformanceTest />}
          {activeTab === "로그 모니터링" && <LogMonitoring />}
        </main>

        {/* ✅ 모달은 여기에서 관리 */}
        {showAddModal && (
          <AddServerModal
            onClose={() => setShowAddModal(false)}
            onSubmit={handleAddServer}
            teamCode={teamCode}
          />
        )}

        {/* ✅ GitHub 등록 모달 */}
        {showGithubModal && (
          <GithubRegisterModal
            teamCode={teamCode}
            onClose={() => setShowGithubModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Home;
