import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CompletedProblem {
  problemId: string;
  completedAt: number;
}

interface CompletedProblemsState {
  problems: Record<string, CompletedProblem>;
}

const initialState: CompletedProblemsState = {
  problems: {}
};

export const completedProblemsSlice = createSlice({
  name: 'completedProblems',
  initialState,
  reducers: {
    markCompleted: (state, action: PayloadAction<string>) => {
      const problemId = action.payload;
      state.problems[problemId] = {
        problemId,
        completedAt: Date.now()
      };
    },
    markIncomplete: (state, action: PayloadAction<string>) => {
      const problemId = action.payload;
      delete state.problems[problemId];
    },
    resetAll: (state) => {
      state.problems = {};
    }
  }
});

export const { markCompleted, markIncomplete, resetAll } = completedProblemsSlice.actions;
export default completedProblemsSlice.reducer;
