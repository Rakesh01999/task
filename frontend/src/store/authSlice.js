import { createSlice } from '@reduxjs/toolkit';

// SSR Safe LocalStorage retriever
const getLocalStorageItem = (key) => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
};

const getInitialUser = () => {
  const user = getLocalStorageItem('collab_user');
  return user ? JSON.parse(user) : null;
};

const initialState = {
  user: getInitialUser(),
  token: getLocalStorageItem('collab_token') || null,
  isAuthenticated: !!getLocalStorageItem('collab_token'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action) {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('collab_token', action.payload.token);
        localStorage.setItem('collab_user', JSON.stringify(action.payload.user));
      }
    },
    loginFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('collab_token');
        localStorage.removeItem('collab_user');
      }
    },
    clearError(state) {
      state.error = null;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
