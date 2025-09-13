import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  accessToken: null,
  refreshToken: null,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action) => {
      const { accessToken, refreshToken, user } = action.payload || {};
      state.accessToken = accessToken ?? null;
      state.refreshToken = refreshToken ?? null;
      state.user = user ?? null;
    },
    setTokens: (state, action) => {
      const { accessToken, refreshToken } = action.payload || {};
      if (accessToken !== undefined) state.accessToken = accessToken;
      if (refreshToken !== undefined) state.refreshToken = refreshToken;
    },
    clearAuth: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
    },
  },
});

export const { setAuth, setTokens, clearAuth } = authSlice.actions;

export default authSlice.reducer;


