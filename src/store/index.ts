// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { configureStore, combineReducers, Middleware } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
// import { thunk } from 'redux-thunk';

import completedProblemsReducer from './completedProblemsSlice';

const persistConfig = {
  key: 'leetcode-tracker',
  storage,
  whitelist: ['completedProblems'] 
};

const rootReducer = combineReducers({
  completedProblems: completedProblemsReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST']
      }
    })
    // .concat(thunk as unknown as Middleware)
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
