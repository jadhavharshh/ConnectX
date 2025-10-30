import { create } from 'zustand';
import { createAuthSlice, AuthState } from './slices/AuthSlice';
import { createAppSlice, AppState } from './slices/AppSlice'; // Ensure AppSlice exists

// Combine all slices into one main store
interface StoreState extends AuthState, AppState {}

const useStore = create<StoreState>((set) => ({
  ...createAuthSlice(set),
  ...createAppSlice(set),
}));

export default useStore;