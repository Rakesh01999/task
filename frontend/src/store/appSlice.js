import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeProjectId: 'all',
  searchQuery: '',
  sidebarOpen: true,
  toast: null, // { message, type: 'success' | 'error' | 'warning', id }
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setActiveProjectId(state, action) {
      state.activeProjectId = action.payload;
    },
    setSearchQuery(state, action) {
      state.searchQuery = action.payload;
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action) {
      state.sidebarOpen = action.payload;
    },
    showToast(state, action) {
      state.toast = {
        message: action.payload.message,
        type: action.payload.type || 'success',
        id: Date.now(),
      };
    },
    hideToast(state) {
      state.toast = null;
    },
  },
});

export const { 
  setActiveProjectId, 
  setSearchQuery, 
  toggleSidebar, 
  setSidebarOpen, 
  showToast, 
  hideToast 
} = appSlice.actions;

export default appSlice.reducer;
