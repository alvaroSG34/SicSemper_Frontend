export const syncDomains = ["session", "notifications", "participant", "judge", "admin", "event", "model", "registration", "review", "showcase", "ranking", "tieBreak"] as const;
export type SyncDomain = (typeof syncDomains)[number];
export type SyncInvalidation = {
  type: "invalidate";
  domains: SyncDomain[];
  occurredAt: string;
  scope?: { eventId?: string; categoryId?: string; scaleId?: string; groupId?: string; modelId?: string };
};

export const isSyncInvalidation = (value: unknown): value is SyncInvalidation => {
  if (!value || typeof value !== "object") return false;
  const event = value as Partial<SyncInvalidation>;
  return event.type === "invalidate" && Array.isArray(event.domains) && event.domains.every((domain) => syncDomains.includes(domain as SyncDomain));
};
