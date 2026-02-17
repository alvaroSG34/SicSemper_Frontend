import type { User } from "@/domain/user/user.types";

export const mockUsers: User[] = [
  {
    id: "u-1",
    name: "Mariana Soto",
    email: "mariana@sicsemper.test",
    roles: ["PARTICIPANTE", "JUEZ"],
    verified: true,
  },
  {
    id: "u-2",
    name: "Diego Rivas",
    email: "diego@sicsemper.test",
    roles: ["ADMIN"],
    verified: true,
  },
];

export const mockUserPasswords: Record<string, string> = {
  "mariana@sicsemper.test": "SicSemper123!",
  "diego@sicsemper.test": "SicSemper123!",
};
