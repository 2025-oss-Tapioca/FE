import { useState } from "react";
import { GithubInfoPanel } from "@/components/Github";
import { GithubRegisterForm } from "@/components/Github"; // 이미 만들었으면
// 혹은 등록 폼을 같은 섹션에서 토글로 띄우기

export default function GithubPage({ teamCode }) {
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div className="p-4">
      <h2>GitHub 설정</h2>

      <GithubInfoPanel
        teamCode={teamCode}
        onNeedRegister={() => setShowRegister(true)}
      />

      {showRegister && (
        <div className="mt-6">
          <h3>등록/재등록</h3>
          <GithubRegisterForm
            teamCode={teamCode}
            onDone={() => setShowRegister(false)}
          />
        </div>
      )}
    </div>
  );
}
