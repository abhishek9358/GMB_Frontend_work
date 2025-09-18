import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/user.slice";
import type { userInitialState } from "./slices/user.slice";

export interface RootState {
  user: userInitialState;
}

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
  devTools: true,
});
