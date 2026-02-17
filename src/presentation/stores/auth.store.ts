import { create } from "zustand";
import { authService, getCurrentSessionRole } from "@/application/auth/auth.service";
import type { User, UserRole } from "@/domain/user/user.types";

type AuthStoreState = {
  user: User | null;
  currentRole: UserRole | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
};

export const useAuthStore = create<AuthStoreState>((set) => ({
  user: null,
  currentRole: null,
  login: async (email, password) => {
    const user = await authService.login(email, password);

    if (!user) {
      set({ user: null, currentRole: null });
      return false;
    }

    set({
      user,
      currentRole: getCurrentSessionRole() ?? user.roles[0] ?? null,
    });

    return true;
  },
  logout: async () => {
    await authService.logout();
    set({ user: null, currentRole: null });
  },
  switchRole: async (role) => {
    const nextRole = await authService.switchRole(role);
    set({ currentRole: nextRole });
  },
}));
