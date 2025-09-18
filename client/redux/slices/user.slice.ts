import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface loadUserPayload {
  user: any;
}

export interface userInitialState {
  isAuthenticated: boolean;
  user: User | null;
  userLoading: boolean;
}

const initialState: userInitialState = {
  isAuthenticated: false,
  user: null,
  userLoading: false,
};

const Slice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loadUser: (state, action: PayloadAction<loadUserPayload>) => {
      const { user } = action.payload;
      state.isAuthenticated = true;
      state.user = user;
      state.userLoading = false;
    },
    setUserLoading: (state, action: PayloadAction<boolean>) => {
      state.userLoading = action.payload;
    },
  },
});

export const { loadUser, setUserLoading } = Slice.actions;

export default Slice.reducer;
