import { create } from 'zustand';

const useTeamStore = create((set) => ({
    // 👇 마지막으로 생성된 팀의 상세 정보를 저장할 상태
    lastCreatedTeamDetails: null,

    // 👇 이 상태를 업데이트하는 함수
    setLastCreatedTeamDetails: (details) => set({ lastCreatedTeamDetails: details }),
}));

export default useTeamStore;