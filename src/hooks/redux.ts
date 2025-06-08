import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '~/store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Helper selectors
export const isProblemCompleted = (state: RootState, problemId: string): boolean => {
  return !!state.completedProblems.problems[problemId];
};

export const getProblemNotes = (state: RootState, problemId: string) => {
  const noteIds = state.problemNotes.problemNotes[problemId] || [];
  return noteIds.map(noteId => state.problemNotes.notes[noteId]).filter(Boolean);
};

export const getProblemNoteCount = (state: RootState, problemId: string): number => {
  return state.problemNotes.problemNotes[problemId]?.length || 0;
};

export const getNote = (state: RootState, noteId: string) => {
  return state.problemNotes.notes[noteId];
};
