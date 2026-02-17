import type { Identifier } from "@/core/types";

export type UserRole = "PARTICIPANTE" | "JUEZ" | "ADMIN";

export type User = {
  id: Identifier;
  name: string;
  email: string;
  roles: UserRole[];
  verified: boolean;
};
