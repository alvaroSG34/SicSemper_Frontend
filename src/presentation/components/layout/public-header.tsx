"use client";

import Link from "next/link";
import { useCallback, useState, type MouseEvent } from "react";
import type { UserRole } from "@/domain/user/user.types";

type PublicHeaderVariant = "landing" | "login";

interface PublicHeaderProps {
  variant?: PublicHeaderVariant;
  isLandingPage?: boolean;
  activeLinkId?: string | null;
  activeAuthAction?: "login" | "register" | null;
  currentUserName?: string | null;
  availableRoles?: UserRole[];
  currentRole?: UserRole | null;
  dashboardHref?: string;
  onRoleChange?: (role: UserRole) => Promise<void> | void;
  onLogout?: () => Promise<void> | void;
}

interface HeaderLink {
  id: string;
  label: string;
}

const HEADER_LINKS: HeaderLink[] = [
  { id: "inicio", label: "Inicio" },
  { id: "acerca", label: "Acerca de" },
  { id: "agenda", label: "Agenda" },
  { id: "equipo", label: "Jurados Invitados" },
  { id: "ubicacion", label: "Ubicación" },
];

const ROLE_LABEL: Record<UserRole, string> = {
  PARTICIPANTE: "Participante",
  JUEZ: "Juez",
  ADMIN: "Admin",
};

function getLinkHref(linkId: string, isLandingPage: boolean) {
  if (isLandingPage) {
    return `#${linkId}`;
  }

  return `/#${linkId}`;
}

function getBackgroundClass(variant: PublicHeaderVariant) {
  if (variant === "login") {
    return "bg-[linear-gradient(to_right,#dcdcdc_0%,#dcdcdc_50%,#000000_50%,#000000_100%)]";
  }

  return "bg-[color:var(--landing-header-bg)]";
}

export function PublicHeader({
  variant = "landing",
  isLandingPage = false,
  activeLinkId = null,
  activeAuthAction = null,
  currentUserName = null,
  availableRoles = [],
  currentRole = null,
  dashboardHref = "/login",
  onRoleChange,
  onLogout,
}: PublicHeaderProps) {
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLandingMenuClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, linkId: string) => {
      event.preventDefault();

      const section = document.getElementById(linkId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      if (window.location.hash !== `#${linkId}`) {
        window.location.hash = linkId;
      }
    },
    [],
  );

  const handleRoleChange = useCallback(
    async (nextRole: string) => {
      if (!onRoleChange) {
        return;
      }

      const role = nextRole as UserRole;
      if (!availableRoles.includes(role) || role === currentRole) {
        return;
      }

      try {
        setIsSwitchingRole(true);
        await onRoleChange(role);
      } finally {
        setIsSwitchingRole(false);
      }
    },
    [availableRoles, currentRole, onRoleChange],
  );

  const handleLogout = useCallback(async () => {
    if (!onLogout) {
      return;
    }

    try {
      setIsLoggingOut(true);
      await onLogout();
    } finally {
      setIsLoggingOut(false);
    }
  }, [onLogout]);

  const getLinkClasses = (index: number, linkId: string) => {
    const isActive = linkId === activeLinkId;
    const underlineBase =
      "relative whitespace-nowrap pb-1 text-[16px] font-medium transition-colors after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:origin-left after:scale-x-0 after:bg-[color:var(--landing-pink)] after:transition-transform after:duration-300";

    if (variant === "login") {
      const baseColor = index < 3 ? "text-[#111111] hover:text-[#000000]" : "text-white hover:text-white";
      const activeColor = index < 3 ? "text-[#000000]" : "text-white";

      return [
        underlineBase,
        baseColor,
        isActive ? `${activeColor} after:scale-x-100` : "hover:after:scale-x-100",
      ]
        .join(" ")
        .trim();
    }

    return [
      `${underlineBase} text-white hover:text-white`,
      isActive ? "after:scale-x-100" : "hover:after:scale-x-100",
    ]
      .join(" ")
      .trim();
  };

  const getAuthButtonClasses = (action: "login" | "register") => {
    const isActive = activeAuthAction === action;
    return [
      "inline-flex h-11 items-center justify-center whitespace-nowrap rounded-full border px-7 text-[15px] font-semibold tracking-[0.2px] transition-all duration-300 ease-out will-change-transform motion-reduce:transform-none",
      isActive
        ? "border-[color:var(--landing-pink)] bg-[color:var(--landing-pink)] text-white shadow-[0_10px_24px_rgba(255,107,157,0.35)]"
        : "border-white/70 text-white hover:-translate-y-[1px] hover:border-white hover:bg-white/10 hover:shadow-[0_8px_18px_rgba(0,0,0,0.28)] active:translate-y-0",
    ]
      .join(" ")
      .trim();
  };

  const loggedIn = Boolean(currentUserName);

  return (
    <header className={`sticky top-0 z-50 w-full ${getBackgroundClass(variant)}`}>
      <div className="mx-auto grid h-[84px] w-full max-w-[1440px] grid-cols-[auto_1fr_auto] items-center gap-8 px-8 lg:px-16">
        <Link href="/" className="flex items-center gap-2.5 whitespace-nowrap">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--landing-pink)] text-[12px] text-white">
            ▼
          </span>
          <span
            className={`text-[52px] leading-none font-bold ${
              variant === "login" ? "text-[#0f172a]" : "text-white"
            }`}
          >
            SicSemper
          </span>
        </Link>

        <nav className="hidden items-center justify-center gap-8 lg:flex xl:gap-10">
          {HEADER_LINKS.map((link, index) =>
            isLandingPage ? (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(event) => handleLandingMenuClick(event, link.id)}
                className={getLinkClasses(index, link.id)}
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.id}
                href={getLinkHref(link.id, isLandingPage)}
                className={getLinkClasses(index, link.id)}
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>

        {loggedIn ? (
          <div className="hidden items-center gap-3 lg:flex">
            {availableRoles.length > 1 && currentRole ? (
              <label className="flex items-center gap-2 rounded-full border border-white/25 bg-black/30 px-3 py-2 text-xs text-white">
                <span className="font-semibold opacity-90">Rol</span>
                <select
                  className="rounded-md bg-transparent text-xs font-semibold text-white outline-none"
                  value={currentRole}
                  onChange={(event) => void handleRoleChange(event.target.value)}
                  disabled={isSwitchingRole}
                >
                  {availableRoles.map((role) => (
                    <option key={role} value={role} className="bg-[#111111] text-white">
                      {ROLE_LABEL[role]}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <Link
              href={dashboardHref}
              className="inline-flex h-11 items-center justify-center rounded-full border border-[#5865f2] bg-[#5865f2] px-6 text-[14px] font-semibold text-white transition-colors hover:bg-[#4f5be0]"
            >
              MI PANEL
            </Link>

            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={isLoggingOut}
              className="inline-flex h-11 items-center justify-center rounded-full border border-white/70 px-6 text-[14px] font-semibold text-white transition-colors hover:bg-white/10 disabled:opacity-70"
            >
              {isLoggingOut ? "CERRANDO..." : "CERRAR SESIÓN"}
            </button>
          </div>
        ) : (
          <div className="hidden items-center gap-3 lg:flex">
            <Link href="/login" className={getAuthButtonClasses("login")}>
              INICIAR SESIÓN
            </Link>
            <Link href="/register" className={getAuthButtonClasses("register")}>
              REGISTRARSE
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
