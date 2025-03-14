export interface AuthState {
  userInfo: { id: string; email: string } | null | undefined;
  setUserInfo: (user: { id: string; email: string } | null) => void;
  // New properties for storing data fetched from the backend
  userData: { role: string; data: any } | null;
  setUserData: (data: { role: string; data: any } | null) => void;
}

export const createAuthSlice = (set: any): AuthState => ({
  userInfo: undefined, // initial state
  setUserInfo: (user) => set({ userInfo: user }),
  // initial state and setter for the backend data
  userData: null,
  setUserData: (data) => set({ userData: data }),
});