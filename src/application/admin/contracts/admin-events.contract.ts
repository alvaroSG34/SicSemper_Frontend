import type { components, operations } from "@/infrastructure/api/generated/backend-api.types";
import type { EventCategoryScaleMode } from "@/domain/admin/admin.types";

export type ApiAdminEvent = components["schemas"]["AdminEvent"] & {
  participantModelEditingEnabled?: boolean;
  participantModelEditingDeadline?: string | null;
};
export type ApiEventDeleteImpact = components["schemas"]["EventDeleteImpact"];
export type ApiCreateEventRequest =
  operations["adminCreateEvent"]["requestBody"]["content"]["application/json"] & {
    participantModelEditingEnabled?: boolean;
    participantModelEditingDeadline?: string;
  };
export type ApiUpdateEventRequest =
  operations["adminUpdateEvent"]["requestBody"]["content"]["application/json"] & {
    participantModelEditingEnabled?: boolean;
    participantModelEditingDeadline?: string;
  };

export type ApiAdminEventCategoryScalesResponse = {
  eventId: string;
  availableScales: Array<{
    id: string;
    value: string;
    createdAt: string;
    updatedAt: string;
  }>;
  items: Array<{
    eventCategoryId: string;
    categoryId: string;
    categoryName: string;
    categoryParentId: string | null;
    categoryParentName: string | null;
    scaleMode: EventCategoryScaleMode;
    scaleIds: string[];
    scaleValues: string[];
  }>;
};

export type ApiAdminSyncEventCategoryScalesRequest = {
  items: Array<{
    eventCategoryId: string;
    scaleMode: EventCategoryScaleMode;
    scaleIds: string[];
  }>;
};

export type ApiAdminEventCategoryScaleGroupsResponse = {
  eventId: string;
  finalCategoryId: string;
  groups: Array<{
    id: string;
    name: string;
    scaleIds: string[];
  }>;
};

export type ApiAdminReplaceEventCategoryScaleGroupsRequest = {
  finalCategoryId: string;
  groups: Array<{
    name: string;
    scaleIds: string[];
  }>;
};
