import type { User } from "@/domain/user/user.types";

export const mockUsers: User[] = [
  {
    id: "u-1",
    name: "Paula Participante",
    email: "participante@sicsemper.test",
    roles: ["PARTICIPANTE"],
    verified: true,
  },
  {
    id: "u-2",
    name: "Julia Juez",
    email: "juez@sicsemper.test",
    roles: ["JUEZ"],
    verified: true,
  },
  {
    id: "u-3",
    name: "Alberto Admin",
    email: "admin@sicsemper.test",
    roles: ["ADMIN"],
    verified: true,
  },
  {
    id: "u-5",
    name: "Sara Superadmin",
    email: "superadmin@sicsemper.test",
    roles: ["SUPERADMIN"],
    verified: true,
  },
  {
    id: "u-4",
    name: "Sofia Doble Rol",
    email: "dual@sicsemper.test",
    roles: ["PARTICIPANTE", "JUEZ"],
    verified: true,
  },
];

export const mockUserPasswords: Record<string, string> = {
  "participante@sicsemper.test": "SicSemper123!",
  "juez@sicsemper.test": "SicSemper123!",
  "admin@sicsemper.test": "SicSemper123!",
  "superadmin@sicsemper.test": "SicSemper123!",
  "dual@sicsemper.test": "SicSemper123!",
};
