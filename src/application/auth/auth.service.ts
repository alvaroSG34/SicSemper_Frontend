import type { User, UserRole } from "@/domain/user/user.types";
import { ApiError, apiRequest } from "@/infrastructure/api/http-client";

export type RegisterPayload = {
  name: string;
  birthDate?: string;
  ci?: string;
  country?: string;
  city?: string;
  email: string;
  phone?: string;
  clubId?: string;
  password: string;
};

export type RegisterClubOption = {
  id: string;
  name: string;
  place: string;
  logoUrl?: string | null;
};

export type RegisterError = "EMAIL_ALREADY_IN_USE" | "CI_ALREADY_IN_USE";

export type RegisterResult = {
  user: User | null;
  error: RegisterError | null;
};

type AuthResponse = {
  user: User;
  activeRole: UserRole;
  accessToken?: string;
};

type SessionResponse = {
  user: User;
  activeRole: UserRole;
};

export interface AuthService {
  login(email: string, password: string): Promise<User | null>;
  register(payload: RegisterPayload): Promise<RegisterResult>;
  logout(): Promise<void>;
  switchRole(role: UserRole): Promise<UserRole>;
  getCurrentUser(): Promise<User | null>;
}

const authErrorMessages: Record<string, string> = {
  EMAIL_ALREADY_IN_USE: "Ese correo ya esta registrado.",
  CI_ALREADY_IN_USE: "Ese CI ya esta registrado.",
  CLUB_NOT_FOUND: "El club seleccionado ya no esta disponible.",
  INVALID_CREDENTIALS: "Correo o contrasena incorrectos.",
  MISSING_REFRESH_TOKEN: "Tu sesion expiro. Vuelve a iniciar sesion.",
  ROLE_NOT_ASSIGNED: "Ese rol no esta disponible para tu usuario.",
  SUPERADMIN_IMMUTABLE: "No se puede modificar un usuario con rol SUPERADMIN.",
  SESSION_INVALID: "Tu sesion expiro. Vuelve a iniciar sesion.",
  TOKEN_INVALID: "Tu sesion ya no es valida. Vuelve a iniciar sesion.",
  USER_NOT_FOUND: "No se pudo recuperar tu usuario.",
};

let activeRole: UserRole | null = null;

const toErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof ApiError) {
    if (error.code && authErrorMessages[error.code]) {
      return authErrorMessages[error.code];
    }

    if (error.message && error.message !== `HTTP_${error.statusCode}`) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

const applySession = (payload: AuthResponse | SessionResponse) => {
  activeRole = payload.activeRole;
  return payload.user;
};

const clearSession = () => {
  activeRole = null;
};

export const authService: AuthService = {
  async login(email, password) {
    try {
      const response = await apiRequest<AuthResponse>("/auth/login", {
        method: "POST",
        skipAuthRefresh: true,
        body: {
          email,
          password,
        },
      });

      return applySession(response);
    } catch (error) {
      if (error instanceof ApiError && error.code === "INVALID_CREDENTIALS") {
        clearSession();
        return null;
      }

      throw new Error(toErrorMessage(error, "No se pudo iniciar sesion."));
    }
  },
  async register(payload) {
    try {
      const response = await apiRequest<AuthResponse>("/auth/register", {
        method: "POST",
        skipAuthRefresh: true,
        body: payload,
      });

      return {
        user: applySession(response),
        error: null,
      };
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.code === "EMAIL_ALREADY_IN_USE" || error.code === "CI_ALREADY_IN_USE")
      ) {
        const registerError: RegisterError =
          error.code === "CI_ALREADY_IN_USE" ? "CI_ALREADY_IN_USE" : "EMAIL_ALREADY_IN_USE";
        clearSession();
        return {
          user: null,
          error: registerError,
        };
      }

      throw new Error(toErrorMessage(error, "No se pudo completar el registro."));
    }
  },
  async logout() {
    try {
      await apiRequest<{ success: boolean }>("/auth/logout", {
        method: "POST",
        skipAuthRefresh: true,
      });
    } catch {
      // Local session is cleared regardless of backend response.
    } finally {
      clearSession();
    }
  },
  async switchRole(role) {
    try {
      const response = await apiRequest<AuthResponse>("/auth/switch-role", {
        method: "POST",
        body: { role },
      });

      applySession(response);
      return response.activeRole;
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo cambiar de rol."));
    }
  },
  async getCurrentUser() {
    try {
      const response = await apiRequest<SessionResponse>("/auth/session");
      return applySession(response);
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 401) {
        clearSession();
        return null;
      }

      throw new Error(toErrorMessage(error, "No se pudo recuperar la sesion actual."));
    }
  },
};

export const getCurrentSessionRole = (): UserRole | null => activeRole;

export const listRegisterClubs = async (): Promise<RegisterClubOption[]> => {
  return apiRequest<RegisterClubOption[]>("/auth/register/clubs", {
    method: "GET",
    skipAuthRefresh: true,
  });
};
