import type { User, UserRole } from "@/domain/user/user.types";
import { userHasRole } from "@/domain/user/user.model";
import { mockUserPasswords, mockUsers } from "@/infrastructure/mock/mock-users";

export interface AuthService {
  login(email: string, password: string): Promise<User | null>;
  logout(): Promise<void>;
  switchRole(role: UserRole): Promise<UserRole>;
  getCurrentUser(): Promise<User | null>;
}

let activeUserId: string | null = null;
let activeRole: UserRole | null = null;

const cloneUser = (user: User): User => ({
  ...user,
  roles: [...user.roles],
});

const getActiveUserFromSession = (): User | null => {
  if (!activeUserId) {
    return null;
  }

  const user = mockUsers.find((candidate) => candidate.id === activeUserId);
  return user ? cloneUser(user) : null;
};

export const authService: AuthService = {
  async login(email, password) {
    const normalizedEmail = email.trim().toLowerCase();
    const expectedPassword = mockUserPasswords[normalizedEmail];
    const user = mockUsers.find((candidate) => candidate.email.toLowerCase() === normalizedEmail);

    if (!user || expectedPassword !== password) {
      return null;
    }

    activeUserId = user.id;
    activeRole = user.roles[0] ?? null;
    return cloneUser(user);
  },
  async logout() {
    activeUserId = null;
    activeRole = null;
  },
  async switchRole(role) {
    const activeUser = getActiveUserFromSession();

    if (!activeUser || !userHasRole(activeUser, role)) {
      throw new Error("Requested role is not available for current user.");
    }

    activeRole = role;
    return role;
  },
  async getCurrentUser() {
    return getActiveUserFromSession();
  },
};

export const getCurrentSessionRole = (): UserRole | null => activeRole;
