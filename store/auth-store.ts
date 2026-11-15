import { create } from "zustand";
import type { AdminProfile } from "@/lib/api/contracts";

interface AuthState {
  user: AdminProfile | null;
  setUser: (user: AdminProfile) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
