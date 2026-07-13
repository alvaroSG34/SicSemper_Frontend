"use client";

import { LogOut, Repeat2, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { UserRole } from "@/domain/user/user.types";
import { ImageWithSkeleton } from "@/presentation/components/ui";
import { useAuthStore } from "@/presentation/stores";

type AccountMenuProps = {
  initials: string;
  photoUrl?: string | null;
  profileHref?: string;
};

const dashboardRouteByRole: Record<UserRole, string> = {
  PARTICIPANTE: "/participante/inicio",
  JUEZ: "/juez/inicio",
  ADMIN: "/admin/inicio",
  SUPERADMIN: "/admin/inicio",
};

export function AccountMenu({ initials, photoUrl, profileHref }: AccountMenuProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const currentRole = useAuthStore((state) => state.currentRole);
  const logout = useAuthStore((state) => state.logout);
  const switchRole = useAuthStore((state) => state.switchRole);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);
  const hasPhoto = Boolean(photoUrl?.trim());
  const hasParticipantAndJudgeRoles =
    Boolean(user?.roles.includes("PARTICIPANTE")) && Boolean(user?.roles.includes("JUEZ"));
  const nextRole: UserRole | null =
    hasParticipantAndJudgeRoles && currentRole === "PARTICIPANTE"
      ? "JUEZ"
      : hasParticipantAndJudgeRoles && currentRole === "JUEZ"
        ? "PARTICIPANTE"
        : null;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  const handleProfile = () => {
    if (!profileHref) {
      return;
    }
    setIsOpen(false);
    router.push(profileHref);
  };

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    try {
      setIsLoggingOut(true);
      await logout();
      setIsOpen(false);
      router.push("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleRoleSwitch = async () => {
    if (!nextRole || isSwitchingRole) {
      return;
    }

    try {
      setIsSwitchingRole(true);
      await switchRole(nextRole);
      setIsOpen(false);
      router.push(dashboardRouteByRole[nextRole]);
    } finally {
      setIsSwitchingRole(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Abrir menu de cuenta"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen((open) => !open)}
        className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-[#5B68F1] bg-[#2D2D2D] transition hover:border-[#8A94FF] focus:outline-none focus:ring-2 focus:ring-[#8A94FF] focus:ring-offset-2 focus:ring-offset-[#000000] sm:h-12 sm:w-12"
      >
        {hasPhoto ? (
          <ImageWithSkeleton
            src={photoUrl ?? ""}
            alt="Foto de perfil"
            fill
            sizes="48px"
            className="object-cover"
          />
        ) : (
          <span className="text-sm font-semibold text-white">{initials}</span>
        )}
      </button>

      {isOpen ? (
        <div
          role="menu"
          aria-label="Menu de cuenta"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-[180px] rounded-xl border border-[#2D2D2D] bg-[#0F0F0F] p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.45)]"
        >
          {nextRole ? (
            <button
              type="button"
              role="menuitem"
              disabled={isSwitchingRole}
              onClick={() => void handleRoleSwitch()}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#C8CEFF] transition hover:bg-[#1C2140] focus:bg-[#1C2140] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Repeat2 className="h-4 w-4" />
              {isSwitchingRole ? "Cambiando rol..." : `Cambiar a ${nextRole === "JUEZ" ? "Juez" : "Participante"}`}
            </button>
          ) : null}
          {profileHref ? (
            <button
              type="button"
              role="menuitem"
              onClick={handleProfile}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#E5E5E5] transition hover:bg-[#1C1C1C] focus:bg-[#1C1C1C] focus:outline-none"
            >
              <UserRound className="h-4 w-4" />
              Mi perfil
            </button>
          ) : null}
          <button
            type="button"
            role="menuitem"
            disabled={isLoggingOut}
            onClick={() => void handleLogout()}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#F0A4A4] transition hover:bg-[#2A1717] focus:bg-[#2A1717] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
            {isLoggingOut ? "Cerrando sesion..." : "Cerrar sesion"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
