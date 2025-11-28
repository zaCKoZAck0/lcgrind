import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type GroupingType = 'topic' | 'week';

interface SheetSettings {
  weeks: number;
  hoursPerWeek: number;
  groupBy: GroupingType;
  selectedTopics: string[];
  selectedDifficulties: string[];
}

interface SheetSettingsState {
  sheets: Record<string, SheetSettings>;
}

const initialState: SheetSettingsState = {
  sheets: {}
};

const defaultSettings: SheetSettings = {
  weeks: 4,
  hoursPerWeek: 5,
  groupBy: 'topic',
  selectedTopics: [],
  selectedDifficulties: []
};

// Helper to ensure sheet settings exist
function ensureSheetSettings(state: SheetSettingsState, sheetSlug: string): void {
  if (!state.sheets[sheetSlug]) {
    state.sheets[sheetSlug] = { ...defaultSettings };
  }
}

export const sheetSettingsSlice = createSlice({
  name: 'sheetSettings',
  initialState,
  reducers: {
    setWeeks: (state, action: PayloadAction<{ sheetSlug: string; weeks: number }>) => {
      const { sheetSlug, weeks } = action.payload;
      ensureSheetSettings(state, sheetSlug);
      state.sheets[sheetSlug].weeks = weeks;
    },
    setHoursPerWeek: (state, action: PayloadAction<{ sheetSlug: string; hoursPerWeek: number }>) => {
      const { sheetSlug, hoursPerWeek } = action.payload;
      ensureSheetSettings(state, sheetSlug);
      state.sheets[sheetSlug].hoursPerWeek = hoursPerWeek;
    },
    setGroupBy: (state, action: PayloadAction<{ sheetSlug: string; groupBy: GroupingType }>) => {
      const { sheetSlug, groupBy } = action.payload;
      ensureSheetSettings(state, sheetSlug);
      state.sheets[sheetSlug].groupBy = groupBy;
    },
    setSelectedTopics: (state, action: PayloadAction<{ sheetSlug: string; topics: string[] }>) => {
      const { sheetSlug, topics } = action.payload;
      ensureSheetSettings(state, sheetSlug);
      state.sheets[sheetSlug].selectedTopics = topics;
    },
    setSelectedDifficulties: (state, action: PayloadAction<{ sheetSlug: string; difficulties: string[] }>) => {
      const { sheetSlug, difficulties } = action.payload;
      ensureSheetSettings(state, sheetSlug);
      state.sheets[sheetSlug].selectedDifficulties = difficulties;
    },
    initSheetSettings: (state, action: PayloadAction<{ sheetSlug: string }>) => {
      const { sheetSlug } = action.payload;
      ensureSheetSettings(state, sheetSlug);
    }
  }
});

export const { setWeeks, setHoursPerWeek, setGroupBy, setSelectedTopics, setSelectedDifficulties, initSheetSettings } = sheetSettingsSlice.actions;
export default sheetSettingsSlice.reducer;
export { defaultSettings };
