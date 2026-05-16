import { createSlice, PayloadAction, nanoid } from '@reduxjs/toolkit';

export interface ProblemList {
  id: string;
  name: string;
  description?: string;
  problemIds: number[];
  createdAt: number;
  updatedAt: number;
}

interface ProblemListsState {
  lists: Record<string, ProblemList>;
  order: string[];
}

const initialState: ProblemListsState = {
  lists: {},
  order: [],
};

export const problemListsSlice = createSlice({
  name: 'problemLists',
  initialState,
  reducers: {
    createList: (
      state,
      action: PayloadAction<{ id?: string; name: string; description?: string; problemIds?: number[] }>
    ) => {
      const { name, description, problemIds = [] } = action.payload;
      const id = action.payload.id ?? nanoid();
      const now = Date.now();
      state.lists[id] = { id, name, description, problemIds, createdAt: now, updatedAt: now };
      state.order.push(id);
    },

    updateListMeta: (
      state,
      action: PayloadAction<{ id: string; name?: string; description?: string }>
    ) => {
      const { id, name, description } = action.payload;
      const list = state.lists[id];
      if (!list) return;
      if (name !== undefined) list.name = name;
      if (description !== undefined) list.description = description;
      list.updatedAt = Date.now();
    },

    deleteList: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      delete state.lists[id];
      state.order = state.order.filter((oid) => oid !== id);
    },

    addProblemToList: (
      state,
      action: PayloadAction<{ listId: string; problemId: number; index?: number }>
    ) => {
      const { listId, problemId, index } = action.payload;
      const list = state.lists[listId];
      if (!list) return;
      if (list.problemIds.includes(problemId)) return;
      if (index !== undefined) {
        list.problemIds.splice(index, 0, problemId);
      } else {
        list.problemIds.push(problemId);
      }
      list.updatedAt = Date.now();
    },

    removeProblemFromList: (
      state,
      action: PayloadAction<{ listId: string; problemId: number }>
    ) => {
      const { listId, problemId } = action.payload;
      const list = state.lists[listId];
      if (!list) return;
      list.problemIds = list.problemIds.filter((id) => id !== problemId);
      list.updatedAt = Date.now();
    },

    reorderProblems: (
      state,
      action: PayloadAction<{ listId: string; problemIds: number[] }>
    ) => {
      const { listId, problemIds } = action.payload;
      const list = state.lists[listId];
      if (!list) return;
      list.problemIds = problemIds;
      list.updatedAt = Date.now();
    },

    addProblemsToList: (
      state,
      action: PayloadAction<{ listId: string; problemIds: number[] }>
    ) => {
      const { listId, problemIds } = action.payload;
      const list = state.lists[listId];
      if (!list) return;
      const have = new Set(list.problemIds);
      for (const pid of problemIds) {
        if (!have.has(pid)) {
          list.problemIds.push(pid);
          have.add(pid);
        }
      }
      list.updatedAt = Date.now();
    },

    upsertSharedList: (state, action: PayloadAction<ProblemList>) => {
      const list = action.payload;
      state.lists[list.id] = list;
      if (!state.order.includes(list.id)) {
        state.order.push(list.id);
      }
    },
  },
});

export const {
  createList,
  updateListMeta,
  deleteList,
  addProblemToList,
  addProblemsToList,
  removeProblemFromList,
  reorderProblems,
  upsertSharedList,
} = problemListsSlice.actions;

export default problemListsSlice.reducer;
