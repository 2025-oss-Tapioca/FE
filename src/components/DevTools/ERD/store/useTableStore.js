// src/store/useTableStore.js
import { create } from 'zustand';

const makeId = () =>
  (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const useTableStore = create((set, get) => ({
  tables: [],

  // 생성
  addTable: (newTable) =>
    set((state) => {
      const withId = newTable.id ? newTable : { id: makeId(), ...newTable };
      // 좌표 없으면 기본값
      if (!withId.position) withId.position = { x: 120, y: 80 };
      return { tables: [...state.tables, withId] };
    }),

  // 수정 (이름/컬럼/좌표 등 부분 업데이트)
  updateTable: (tableId, patch) =>
    set((state) => ({
      tables: state.tables.map((t) =>
        (t.id ?? t.name) === tableId ? { ...t, ...patch } : t
      ),
    })),

  // 삭제
  removeTable: (tableId) =>
    set((state) => ({
      tables: state.tables.filter((t) => (t.id ?? t.name) !== tableId),
    })),

  // (선택) 배치 저장—서버에서 통째로 불러온 ERD 반영 등에 유용
  setTables: (tables) => set({ tables }),

  // (선택) 위치만 업데이트—ReactFlow onNodeDragStop에서 호출하기 좋음
  updateTablePosition: (tableId, position) =>
    set((state) => ({
      tables: state.tables.map((t) =>
        (t.id ?? t.name) === tableId ? { ...t, position } : t
      ),
    })),
}));
