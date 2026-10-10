import type {
  ApiAdminEventControlModelDetail,
  ApiAdminEventControlPodiumResult,
  ApiAdminEventControlPodiumSegment,
  ApiAdminEventControlPodiumTree,
} from "@/application/admin/contracts/admin-event-control.contract";
import { apiRequest } from "@/infrastructure/api/http-client";

const query = (params: Record<string, string | number | undefined>) => {
  const values = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => value !== undefined && values.set(key, String(value)));
  return values.toString() ? `?${values.toString()}` : "";
};

export const participantEventPodiumService = {
  getEventControlPodiumTree(eventId: string) {
    return apiRequest<ApiAdminEventControlPodiumTree>(`/participant/events/${eventId}/podium/tree`);
  },
  listEventControlPodiumSegments(eventId: string, finalCategoryId: string) {
    return apiRequest<ApiAdminEventControlPodiumSegment[]>(
      `/participant/events/${eventId}/podium/segments${query({ finalCategoryId })}`,
    );
  },
  getEventControlPodiumResult(input: {
    eventId: string;
    finalCategoryId: string;
    scaleId?: string;
    groupId?: string;
    page?: number;
    pageSize?: number;
  }) {
    return apiRequest<ApiAdminEventControlPodiumResult>(
      `/participant/events/${input.eventId}/podium/results${query(input)}`,
    );
  },
  getPodiumModelDetail(eventId: string, modelId: string) {
    return apiRequest<ApiAdminEventControlModelDetail>(
      `/participant/events/${eventId}/podium/models/${modelId}`,
    );
  },
};

