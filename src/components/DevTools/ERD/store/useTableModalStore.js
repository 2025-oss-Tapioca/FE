import { create } from 'zustand';

export const useTableModalStore = create((set) => ({
  isOpen: false,
  tableName: '',
  columns: [],
  tables: [], // ✅ 테이블 목록

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),

  setTableName: (name) => set({ tableName: name }),
  resetTableName: () => set({ tableName: '' }),

  addColumn: (column) => set((state) => ({ columns: [...state.columns, column] })),
  removeColumn: (index) => set((state) => ({
    columns: state.columns.filter((_, i) => i !== index),
  })),
  resetColumns: () => set({ columns: [] }),

  // ✅ 테이블 저장 함수
  addTable: (newTable) => set((state) => ({
    tables: [...state.tables, newTable],
  })),
}));
