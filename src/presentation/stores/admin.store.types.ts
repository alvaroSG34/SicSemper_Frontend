import type {
  AdminDashboardData,
  AdminDashboardSummary,
  AdminPermissionCode,
  AdminPermissionEntry,
  AssignJudgeScopePayload,
  CategoryDeleteImpact,
  CatalogEventStatus,
  ClubDeleteImpact,
  CreateAdminPayload,
  EventCategoryOption,
  EventDeleteImpact,
  JudgePermissionCode,
  JudgePermissionEntry,
} from "@/domain/admin/admin.types";
import type { User } from "@/domain/user/user.types";

export type AdminStoreState = {
  users: User[];
  dashboard: AdminDashboardData | null;
  summary: AdminDashboardSummary | null;
  loading: boolean;
  error: string | null;
  loadSummary: (options?: { force?: boolean }) => Promise<void>;
  loadDashboard: (options?: { force?: boolean }) => Promise<void>;
  clearError: () => void;
  createClub: (payload: {
    name: string;
    place: string;
    contactEmail: string;
    description?: string;
    logoUrl?: string;
  }) => Promise<void>;
  updateClub: (payload: {
    id: string;
    name: string;
    place: string;
    contactEmail: string;
    description?: string;
    logoUrl?: string;
  }) => Promise<void>;
  getClubDeleteImpact: (clubId: string) => Promise<ClubDeleteImpact>;
  removeClub: (clubId: string) => Promise<void>;
  promoteToJudge: (userId: string) => Promise<void>;
  demoteJudge: (userId: string) => Promise<void>;
  createJudge: (payload: CreateAdminPayload) => Promise<void>;
  createAdmin: (payload: CreateAdminPayload) => Promise<void>;
  promoteToAdmin: (userId: string) => Promise<void>;
  demoteAdmin: (userId: string) => Promise<void>;
  banParticipant: (userId: string) => Promise<void>;
  unbanParticipant: (userId: string) => Promise<void>;
  setParticipantVerified: (userId: string, verified: boolean) => Promise<void>;
  createEvent: (payload: {
    organizerClubId: string;
    name: string;
    status?: CatalogEventStatus;
    place: string;
    startDate: string;
    endDate: string;
    description: string;
    imageUrl?: string;
  }) => Promise<void>;
  createEventAndLinkCategories: (
    payload: {
      organizerClubId: string;
      name: string;
      status?: CatalogEventStatus;
      place: string;
      startDate: string;
      endDate: string;
      description: string;
      imageUrl?: string;
    },
    categoryIds: string[],
  ) => Promise<void>;
  updateEvent: (payload: {
    id: string;
    organizerClubId: string;
    name: string;
    status: CatalogEventStatus;
    place: string;
    startDate: string;
    endDate: string;
    description: string;
    imageUrl?: string;
  }) => Promise<void>;
  updateEventAndLinkCategories: (
    payload: {
      id: string;
      organizerClubId: string;
      name: string;
      status: CatalogEventStatus;
      place: string;
      startDate: string;
      endDate: string;
      description: string;
      imageUrl?: string;
    },
    categoryIds: string[],
  ) => Promise<void>;
  getEventDeleteImpact: (eventId: string) => Promise<EventDeleteImpact>;
  createEventCategoryLink: (payload: { eventId: string; categoryId: string }) => Promise<EventCategoryOption>;
  removeEventCategoryLink: (eventCategoryId: string) => Promise<void>;
  removeEvent: (eventId: string) => Promise<void>;
  createCategory: (payload: { eventId?: string | null; name: string }) => Promise<void>;
  updateCategory: (payload: { id: string; eventId?: string | null; name: string }) => Promise<void>;
  getCategoryDeleteImpact: (categoryId: string) => Promise<CategoryDeleteImpact>;
  removeCategory: (categoryId: string) => Promise<void>;
  createSubcategory: (payload: { categoryId: string; name: string }) => Promise<void>;
  updateSubcategory: (payload: { id: string; categoryId: string; name: string }) => Promise<void>;
  removeSubcategory: (subcategoryId: string) => Promise<void>;
  assignJudgeScope: (payload: AssignJudgeScopePayload) => Promise<void>;
  removeJudgeScope: (assignmentId: string) => Promise<void>;
  adminPermissionsMap: Record<string, AdminPermissionEntry[]>;
  adminPermissionsLoading: Record<string, boolean>;
  adminPermissionsError: Record<string, string | null>;
  loadAdminPermissions: (adminUserId: string) => Promise<void>;
  toggleAdminPermission: (
    adminUserId: string,
    code: AdminPermissionCode,
    shouldRevoke: boolean,
  ) => Promise<void>;
  judgePermissionsMap: Record<string, JudgePermissionEntry[]>;
  judgePermissionsLoading: Record<string, boolean>;
  judgePermissionsError: Record<string, string | null>;
  loadJudgePermissions: (judgeUserId: string) => Promise<void>;
  toggleJudgePermission: (
    judgeUserId: string,
    code: JudgePermissionCode,
    grantedDirectly: boolean,
  ) => Promise<void>;
};
