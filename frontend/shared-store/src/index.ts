import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface AuthUser { userId: string; name: string; email: string; role: 'user' | 'admin'; }

interface AuthState { token: string | null; user: AuthUser | null; }

const initialState: AuthState = { token: null, user: null };

const authSlice = createSlice({
  name: 'auth', initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ token: string; user: AuthUser; }>) { state.token = action.payload.token; state.user = action.payload.user; },
    clearCredentials(state) { state.token = null; state.user = null; }
  }
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export const store = configureStore({ reducer: { auth: authSlice.reducer } });
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const selectToken = (state: RootState) => state.auth.token;
export const selectUser = (state: RootState) => state.auth.user;
