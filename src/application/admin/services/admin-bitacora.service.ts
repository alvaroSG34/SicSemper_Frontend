import type { AdminService } from "@/application/admin/admin.service.types";
import type {
  AuditLogDetailItem,
  AuditLogListResponse,
} from "@/domain/admin/admin.types";
import { apiRequest } from "@/infrastructure/api/http-client";
import { toErrorMessage } from "./admin-service.shared";

type BackendAuditLogListItem = {
  id: string;
  createdAt: string;
  title: string;
  detail: string;
  action: string | null;
  module: string | null;
  result: string | null;
  entityType: string | null;
  entityId: string | null;
  actorRole: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  actor: {
    id: string;
    name: string;
    email: string;
  } | null;
};

type BackendAuditLogListResponse = {
  items: BackendAuditLogListItem[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
};

type BackendAuditLogDetail = BackendAuditLogListItem & {
  previousData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
};

const mapListItem = (item: BackendAuditLogListItem) => ({
  id: item.id,
  createdAt: item.createdAt,
  title: item.title,
  detail: item.detail,
  action: item.action,
  module: item.module,
  result: item.result,
  entityType: item.entityType,
  entityId: item.entityId,
  actorRole: item.actorRole,
  ipAddress: item.ipAddress,
  userAgent: item.userAgent,
  actor: item.actor,
});

const buildBitacoraPath = (input?: {
  page?: number;
  pageSize?: number;
  actor?: string;
  actorUserId?: string;
  module?: string;
  action?: string;
  result?: "SUCCESS" | "FAILED" | "ERROR";
  ipAddress?: string;
  query?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const params = new URLSearchParams();

  if (!input) {
    return "/admin/bitacora";
  }

  if (typeof input.page === "number") params.set("page", String(input.page));
  if (typeof input.pageSize === "number") params.set("pageSize", String(input.pageSize));
  if (input.actor) params.set("actor", input.actor);
  if (input.actorUserId) params.set("actorUserId", input.actorUserId);
  if (input.module) params.set("module", input.module);
  if (input.action) params.set("action", input.action);
  if (input.result) params.set("result", input.result);
  if (input.ipAddress) params.set("ipAddress", input.ipAddress);
  if (input.query) params.set("query", input.query);
  if (input.startDate) params.set("startDate", input.startDate);
  if (input.endDate) params.set("endDate", input.endDate);

  const query = params.toString();
  return query ? `/admin/bitacora?${query}` : "/admin/bitacora";
};

export const adminBitacoraService: Pick<
  AdminService,
  "listBitacora" | "getBitacoraItem"
> = {
  async listBitacora(input): Promise<AuditLogListResponse> {
    try {
      const response = await apiRequest<BackendAuditLogListResponse>(
        buildBitacoraPath(input),
      );
      return {
        items: response.items.map(mapListItem),
        page: response.page,
        pageSize: response.pageSize,
        total: response.total,
        hasMore: response.hasMore,
      };
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo cargar la bitacora."));
    }
  },
  async getBitacoraItem(id): Promise<AuditLogDetailItem> {
    try {
      const response = await apiRequest<BackendAuditLogDetail>(`/admin/bitacora/${id}`);
      return {
        ...mapListItem(response),
        previousData: response.previousData,
        newData: response.newData,
        metadata: response.metadata,
      };
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo cargar el detalle de bitacora."));
    }
  },
};
