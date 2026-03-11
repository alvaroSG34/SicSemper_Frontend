import { cookies } from "next/headers";
import type { User, UserRole } from "@/domain/user/user.types";
import { getApiBaseUrl } from "@/infrastructure/api/api-base-url";

export type ServerSession = {
  user: User;
  activeRole: UserRole;
};

const SESSION_PATH = "/auth/session";

export async function getServerSession(): Promise<ServerSession | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  if (!cookieHeader) {
    return null;
  }

  const response = await fetch(`${getApiBaseUrl()}${SESSION_PATH}`, {
    method: "GET",
    headers: {
      cookie: cookieHeader,
    },
    cache: "no-store",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to resolve server session: ${response.status}`);
  }

  return (await response.json()) as ServerSession;
}

