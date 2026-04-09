import type {
  AssignJudgeScopePayload,
  JudgeAssignmentScope,
  JudgePermissionCode,
  JudgePermissionEntry,
} from '@/domain/admin/admin.types';
import type { User, UserRole } from '@/domain/user/user.types';
import type {
  ApiCreateJudgeAssignmentRequest,
  ApiJudgeAssignmentScope,
  ApiJudgePermissionActionRequest,
  ApiJudgePermissionEntry,
  ApiJudgeUser,
} from '../contracts/admin-judges.contract';

export const mapApiJudgeUserToDomainUser = (user: ApiJudgeUser): User => {
  const userWithPhoto = user as ApiJudgeUser & { photoUrl?: string | null };

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    photoUrl: userWithPhoto.photoUrl ?? null,
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
  };
};

export const mapApiJudgeAssignmentToJudgeAssignmentScope = (
  assignment: ApiJudgeAssignmentScope,
): JudgeAssignmentScope => ({
  id: assignment.id,
  judgeUserId: assignment.judgeUserId,
  eventId: assignment.eventId,
  eventCategoryId: assignment.eventCategoryId,
  createdAt: assignment.createdAt,
});

export const mapAssignJudgeScopePayloadToApiRequest = (
  payload: AssignJudgeScopePayload,
): ApiCreateJudgeAssignmentRequest => ({
  judgeUserId: payload.judgeUserId,
  eventId: payload.eventId,
  eventCategoryId: payload.eventCategoryId,
});

export const mapApiJudgePermissionEntry = (
  entry: ApiJudgePermissionEntry,
): JudgePermissionEntry => ({
  code: entry.code,
  granted: entry.granted,
  grantedByRole: entry.grantedByRole,
  grantedDirectly: entry.grantedDirectly,
  grantedAt: entry.grantedAt,
  grantedBy: entry.grantedBy,
});

export const mapJudgePermissionCodeToApiRequest = (
  code: JudgePermissionCode,
): ApiJudgePermissionActionRequest => ({
  permission: code,
});
