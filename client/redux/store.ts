import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/user.slice";
import type { userInitialState } from "./slices/user.slice";
import type { LocationInitialState } from "./slices/activeLocation.slice";
import activeLocationReducer from "./slices/activeLocation.slice";

export interface RootState {
  user: userInitialState;
  activeLocation: LocationInitialState;
}

export const store = configureStore({
  reducer: {
    user: userReducer,
    activeLocation: activeLocationReducer,
  },
  devTools: true,
});
