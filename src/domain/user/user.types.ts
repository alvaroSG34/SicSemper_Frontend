import type { Identifier } from "@/core/types";

export type UserRole = "PARTICIPANTE" | "JUEZ" | "ADMIN" | "SUPERADMIN";

export type User = {
  id: Identifier;
  name: string;
  email: string;
  photoUrl?: string | null;
  roles: UserRole[];
  verified: boolean;
  status?: string;
  ci?: string | null;
  country?: string | null;
  city?: string | null;
  phone?: string | null;
  birthDate?: string | null;
  club?: { id: string; name: string } | null;
  createdAt?: string;
};
