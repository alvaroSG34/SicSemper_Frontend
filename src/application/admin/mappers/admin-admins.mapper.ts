import type { CreateAdminPayload } from '@/domain/admin/admin.types';
import type { User, UserRole } from '@/domain/user/user.types';
import type {
  ApiAdminManagedUser,
  ApiCreateAdminRequest,
  ApiDemoteAdminUser,
  ApiPromoteAdminUser,
} from '../contracts/admin-admins.contract';

export const mapCreateAdminPayloadToApiRequest = (
  payload: CreateAdminPayload,
): ApiCreateAdminRequest => ({
  name: payload.name,
  email: payload.email,
  password: payload.password,
  birthDate: payload.birthDate,
  ci: payload.ci,
  country: payload.country,
  city: payload.city,
  phone: payload.phone,
  clubId: payload.clubId,
});

export const mapApiAdminManagedUserToDomainUser = (
  user: ApiAdminManagedUser | ApiPromoteAdminUser | ApiDemoteAdminUser,
): User => ({
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
