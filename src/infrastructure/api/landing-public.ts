import { cache } from "react";
import type { LandingEvent } from "@/domain/landing/landing.types";
import {
  landingDefaultContent,
  normalizeLandingContent,
} from "@/presentation/components/features/landing/landing-data";
import { getApiBaseUrl } from "./api-base-url";

export async function loadPublicLandingContent() {
  try {
    const response = await fetch(`${getApiBaseUrl()}/landing/content`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) return landingDefaultContent;

    return normalizeLandingContent((await response.json()) as unknown);
  } catch {
    return landingDefaultContent;
  }
}

export const loadPublicEvent = cache(async (id: string): Promise<LandingEvent | null> => {
  const response = await fetch(`${getApiBaseUrl()}/landing/events/${encodeURIComponent(id)}`, {
    next: { revalidate: 60 },
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("No se pudo cargar el evento público.");
  return (await response.json()) as LandingEvent;
});

export async function loadPublicEvents(): Promise<LandingEvent[]> {
  // This endpoint returns only visible events, independently of the homepage display toggle.
  const response = await fetch(`${getApiBaseUrl()}/landing/events`, {
    next: { revalidate: 60 },
  });
  if (!response.ok) throw new Error("No se pudo cargar la lista de eventos públicos.");
  return (await response.json()) as LandingEvent[];
}
