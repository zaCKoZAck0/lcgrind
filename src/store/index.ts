import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
//import thunk from 'redux-thunk';

import completedProblemsReducer from './completedProblemsSlice';
import problemNotesReducer from './problemNotesSlice';
import sheetSettingsReducer from './sheetSettingsSlice';

const persistConfig = {
  key: 'leetcode-tracker',
  storage,
  whitelist: ['completedProblems', 'problemNotes', 'sheetSettings'] 
};

const rootReducer = combineReducers({
  completedProblems: completedProblemsReducer,
  problemNotes: problemNotesReducer,
  sheetSettings: sheetSettingsReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST']
      }
    })//.concat(thunk)
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
