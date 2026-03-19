import type { User, UserRole } from '@/domain/user/user.types';
import type { ApiAdminDashboardUser } from '../contracts/admin-users.contract';

export const mapApiAdminDashboardUserToDomainUser = (user: ApiAdminDashboardUser): User => ({
  id: user.id,
  name: user.name,
  email: user.email,
  roles: user.roles.map((role) => role as UserRole),
  verified: user.verified,
  status: user.status,
  ci: user.ci,
  country: user.country,
  city: user.city,
  phone: user.phone,
  birthDate: user.birthDate,
  club: user.club,
  createdAt: user.createdAt,
});
