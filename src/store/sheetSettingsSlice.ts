import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type GroupingType = 'topic' | 'week';

interface SheetSettings {
  weeks: number;
  hoursPerWeek: number;
  groupBy: GroupingType;
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
  groupBy: 'topic'
};

export const sheetSettingsSlice = createSlice({
  name: 'sheetSettings',
  initialState,
  reducers: {
    setWeeks: (state, action: PayloadAction<{ sheetSlug: string; weeks: number }>) => {
      const { sheetSlug, weeks } = action.payload;
      if (!state.sheets[sheetSlug]) {
        state.sheets[sheetSlug] = { ...defaultSettings };
      }
      state.sheets[sheetSlug].weeks = weeks;
    },
    setHoursPerWeek: (state, action: PayloadAction<{ sheetSlug: string; hoursPerWeek: number }>) => {
      const { sheetSlug, hoursPerWeek } = action.payload;
      if (!state.sheets[sheetSlug]) {
        state.sheets[sheetSlug] = { ...defaultSettings };
      }
      state.sheets[sheetSlug].hoursPerWeek = hoursPerWeek;
    },
    setGroupBy: (state, action: PayloadAction<{ sheetSlug: string; groupBy: GroupingType }>) => {
      const { sheetSlug, groupBy } = action.payload;
      if (!state.sheets[sheetSlug]) {
        state.sheets[sheetSlug] = { ...defaultSettings };
      }
      state.sheets[sheetSlug].groupBy = groupBy;
    },
    initSheetSettings: (state, action: PayloadAction<{ sheetSlug: string }>) => {
      const { sheetSlug } = action.payload;
      if (!state.sheets[sheetSlug]) {
        state.sheets[sheetSlug] = { ...defaultSettings };
      }
    }
  }
});

export const { setWeeks, setHoursPerWeek, setGroupBy, initSheetSettings } = sheetSettingsSlice.actions;
export default sheetSettingsSlice.reducer;
export { defaultSettings };
