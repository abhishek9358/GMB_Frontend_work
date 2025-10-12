// store.ts

import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/user.slice";
import activeLocationReducer from "./slices/activeLocation.slice";
import activeSiteReducer from "./slices/activeSite.slice";

import type { userInitialState } from "./slices/user.slice";
import type { LocationInitialState } from "./slices/activeLocation.slice";
import type { SiteInitialState } from "./slices/activeSite.slice";

// Root state interface
export interface RootState {
  user: userInitialState;
  activeLocation: LocationInitialState;
  activeSite: SiteInitialState;
}

// Configure store
export const store = configureStore({
  reducer: {
    user: userReducer,
    activeLocation: activeLocationReducer,
    activeSite: activeSiteReducer,
  },
  devTools: true,
});

// Export types for hooks
export type AppDispatch = typeof store.dispatch;

// Optional: Create typed hooks for convenience
// You can use these instead of plain useDispatch and useSelector
// import { useDispatch, useSelector } from 'react-redux';
// export const useAppDispatch = () => useDispatch<AppDispatch>();
// export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
