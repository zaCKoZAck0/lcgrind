import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '~/store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Helper selector
export const isProblemCompleted = (state: RootState, problemId: string): boolean => {
  return !!state.completedProblems.problems[problemId];
};
