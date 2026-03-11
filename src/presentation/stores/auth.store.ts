import { create } from "zustand";
import {
  authService,
  getCurrentSessionRole,
  type RegisterError,
  type RegisterPayload,
} from "@/application/auth/auth.service";
import type { User, UserRole } from "@/domain/user/user.types";

type AuthStoreState = {
  user: User | null;
  currentRole: UserRole | null;
  initialized: boolean;
  initializing: boolean;
  hydrateSession: (session: { user: User; currentRole: UserRole | null } | null) => void;
  initializeSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<RegisterError | null>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
};

export const useAuthStore = create<AuthStoreState>((set, get) => ({
  user: null,
  currentRole: null,
  initialized: false,
  initializing: false,
  hydrateSession: (session) => {
    if (!session) {
      set({
        user: null,
        currentRole: null,
        initialized: true,
        initializing: false,
      });
      return;
    }

    set({
      user: session.user,
      currentRole: session.currentRole ?? session.user.roles[0] ?? null,
      initialized: true,
      initializing: false,
    });
  },
  initializeSession: async () => {
    if (get().initialized || get().initializing) {
      return;
    }

    set({ initializing: true });

    try {
      const user = await authService.getCurrentUser();
      set({
        user,
        currentRole: user ? (getCurrentSessionRole() ?? user.roles[0] ?? null) : null,
        initialized: true,
        initializing: false,
      });
    } catch {
      set({
        user: null,
        currentRole: null,
        initialized: true,
        initializing: false,
      });
    }
  },
  login: async (email, password) => {
    const user = await authService.login(email, password);

    if (!user) {
      set({ user: null, currentRole: null, initialized: true, initializing: false });
      return false;
    }

    set({
      user,
      currentRole: getCurrentSessionRole() ?? user.roles[0] ?? null,
      initialized: true,
      initializing: false,
    });

    return true;
  },
  register: async (payload) => {
    const result = await authService.register(payload);

    if (!result.user || result.error) {
      set({ user: null, currentRole: null, initialized: true, initializing: false });
      return result.error;
    }

    set({
      user: result.user,
      currentRole: getCurrentSessionRole() ?? result.user.roles[0] ?? null,
      initialized: true,
      initializing: false,
    });

    return null;
  },
  logout: async () => {
    await authService.logout();
    set({ user: null, currentRole: null, initialized: true, initializing: false });
  },
  switchRole: async (role) => {
    const nextRole = await authService.switchRole(role);
    set({ currentRole: nextRole, initialized: true, initializing: false });
  },
}));
