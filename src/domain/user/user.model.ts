import type { User, UserRole } from "./user.types";

export const userHasRole = (user: User, role: UserRole): boolean => {
  return user.roles.includes(role);
};
