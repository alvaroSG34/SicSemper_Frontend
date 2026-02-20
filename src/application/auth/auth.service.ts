import type { User, UserRole } from "@/domain/user/user.types";
import { userHasRole } from "@/domain/user/user.model";
import { mockUserPasswords, mockUsers } from "@/infrastructure/mock/mock-users";

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type RegisterError = "EMAIL_ALREADY_IN_USE";

export type RegisterResult = {
  user: User | null;
  error: RegisterError | null;
};

export interface AuthService {
  login(email: string, password: string): Promise<User | null>;
  register(payload: RegisterPayload): Promise<RegisterResult>;
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

const createUserId = (): string => {
  let sequence = mockUsers.length + 1;
  let nextId = `u-${sequence}`;

  while (mockUsers.some((candidate) => candidate.id === nextId)) {
    sequence += 1;
    nextId = `u-${sequence}`;
  }

  return nextId;
};

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
  async register(payload) {
    const normalizedEmail = payload.email.trim().toLowerCase();
    const userExists = mockUsers.some(
      (candidate) => candidate.email.toLowerCase() === normalizedEmail,
    );

    if (userExists) {
      return { user: null, error: "EMAIL_ALREADY_IN_USE" };
    }

    const user: User = {
      id: createUserId(),
      name: payload.name.trim(),
      email: normalizedEmail,
      roles: ["PARTICIPANTE"],
      verified: true,
    };

    mockUsers.push(user);
    mockUserPasswords[normalizedEmail] = payload.password;

    activeUserId = user.id;
    activeRole = "PARTICIPANTE";

    return { user: cloneUser(user), error: null };
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
