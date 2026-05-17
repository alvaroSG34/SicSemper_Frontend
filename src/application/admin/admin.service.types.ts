import type {
  AdminClub,
  AdminDashboardData,
  AdminDashboardSummary,
  AdminPermissionCode,
  AdminPermissionEntry,
  AdminNotificationsMutationResult,
  AdminNotificationsPageResponse,
  AssignJudgeScopePayload,
  CategoryDeleteImpact,
  ScaleDeleteImpact,
  CatalogCategory,
  CatalogEvent,
  EventCategoryScaleConfig,
  EventCategoryOption,
  CatalogSubcategory,
  ClubDeleteImpact,
  CreateAdminPayload,
  CreateCategoryPayload,
  CreateClubPayload,
  CreateEventPayload,
  CreateSubcategoryPayload,
  EventDeleteImpact,
  JudgeAssignmentScope,
  JudgePermissionCode,
  JudgePermissionEntry,
  UpdateCategoryPayload,
  UpdateClubPayload,
  UpdateEventPayload,
  UpdateSubcategoryPayload,
} from "@/domain/admin/admin.types";
import type { LandingAsset, LandingContent, LandingDraftState } from "@/domain/landing/landing.types";
import type { User } from "@/domain/user/user.types";

export type SyntheticCatalog = AdminDashboardData["catalog"];

export interface AdminService {
  getDashboardSummaryData(): Promise<AdminDashboardSummary>;
  getDashboardData(): Promise<AdminDashboardData>;
  uploadClubLogo(file: File): Promise<{ url: string }>;
  uploadEventImage(file: File): Promise<{ url: string }>;
  uploadLandingAsset(file: File): Promise<LandingAsset>;
  listLandingAssets(): Promise<LandingAsset[]>;
  getLandingDraftState(): Promise<LandingDraftState>;
  updateLandingDraft(payload: LandingContent): Promise<LandingDraftState>;
  publishLandingDraft(): Promise<LandingDraftState>;
  listUsers(): Promise<User[]>;
  createClub(payload: CreateClubPayload): Promise<AdminClub>;
  updateClub(payload: UpdateClubPayload): Promise<AdminClub>;
  getClubDeleteImpact(clubId: string): Promise<ClubDeleteImpact>;
  removeClub(clubId: string): Promise<void>;
  promoteToJudge(userId: string): Promise<User>;
  demoteJudge(userId: string): Promise<User>;
  createJudge(payload: CreateAdminPayload): Promise<User>;
  createAdmin(payload: CreateAdminPayload): Promise<User>;
  promoteToAdmin(userId: string): Promise<User>;
  demoteAdmin(userId: string): Promise<User>;
  banParticipant(userId: string): Promise<User>;
  unbanParticipant(userId: string): Promise<User>;
  setParticipantVerified(userId: string, verified: boolean): Promise<User>;
  listCatalog(): Promise<SyntheticCatalog>;
  createEvent(payload: CreateEventPayload): Promise<CatalogEvent>;
  updateEvent(payload: UpdateEventPayload): Promise<CatalogEvent>;
  createEventAndLinkCategories(
    payload: CreateEventPayload,
    categoryIds: string[],
    scalesByCategoryId: Record<string, string[]>,
  ): Promise<CatalogEvent>;
  updateEventAndLinkCategories(
    payload: UpdateEventPayload,
    categoryIds: string[],
    scalesByCategoryId: Record<string, string[]>,
  ): Promise<CatalogEvent>;
  listEventCategoryScales(
    eventId: string,
  ): Promise<{
    eventId: string;
    availableScales: Array<{
      id: string;
      value: string;
      createdAt: string;
      updatedAt: string;
    }>;
    items: EventCategoryScaleConfig[];
  }>;
  syncEventCategoryScales(
    eventId: string,
    items: Array<{ eventCategoryId: string; scaleIds: string[] }>,
  ): Promise<void>;
  createEventCategoryLink(payload: { eventId: string; categoryId: string }): Promise<EventCategoryOption>;
  removeEventCategoryLink(eventCategoryId: string): Promise<void>;
  getEventDeleteImpact(eventId: string): Promise<EventDeleteImpact>;
  removeEvent(eventId: string): Promise<void>;
  createCategory(payload: CreateCategoryPayload): Promise<CatalogCategory>;
  updateCategory(payload: UpdateCategoryPayload): Promise<CatalogCategory>;
  getCategoryDeleteImpact(categoryId: string): Promise<CategoryDeleteImpact>;
  removeCategory(categoryId: string): Promise<void>;
  listScales(): Promise<Array<{ id: string; value: string; createdAt: string; updatedAt: string }>>;
  createScale(payload: { value: string }): Promise<{ id: string; value: string; createdAt: string; updatedAt: string }>;
  updateScale(payload: { id: string; value: string }): Promise<{ id: string; value: string; createdAt: string; updatedAt: string }>;
  getScaleDeleteImpact(scaleId: string): Promise<ScaleDeleteImpact>;
  removeScale(scaleId: string): Promise<void>;
  createSubcategory(payload: CreateSubcategoryPayload): Promise<CatalogSubcategory>;
  updateSubcategory(payload: UpdateSubcategoryPayload): Promise<CatalogSubcategory>;
  removeSubcategory(subcategoryId: string): Promise<void>;
  assignJudgeScope(payload: AssignJudgeScopePayload): Promise<JudgeAssignmentScope>;
  removeJudgeScope(assignmentId: string): Promise<void>;
  listJudgePermissions(judgeUserId: string): Promise<JudgePermissionEntry[]>;
  grantJudgePermission(judgeUserId: string, permission: JudgePermissionCode): Promise<JudgePermissionEntry[]>;
  revokeJudgePermission(judgeUserId: string, permission: JudgePermissionCode): Promise<JudgePermissionEntry[]>;
  listAdminPermissions(adminUserId: string): Promise<AdminPermissionEntry[]>;
  grantAdminPermission(
    adminUserId: string,
    permission: AdminPermissionCode,
  ): Promise<AdminPermissionEntry[]>;
  revokeAdminPermission(
    adminUserId: string,
    permission: AdminPermissionCode,
  ): Promise<AdminPermissionEntry[]>;
  listNotifications(page?: number, pageSize?: number): Promise<AdminNotificationsPageResponse>;
  markNotificationAsRead(notificationId: string): Promise<AdminNotificationsMutationResult>;
  markAllNotificationsAsRead(): Promise<AdminNotificationsMutationResult>;
  deleteNotification(notificationId: string): Promise<AdminNotificationsMutationResult>;
}
