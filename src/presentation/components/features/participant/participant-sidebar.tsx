"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { BarChart3, ChevronDown, Compass, FolderOpen, Home, LogOut, Menu, Settings, Trophy, X } from "lucide-react";
import type { ParticipantSidebarItem } from "@/domain/participant/participant.types";
import { participantSectionRouteById } from "./participant-routes";

const sidebarIconByKey: Record<ParticipantSidebarItem["icon"], LucideIcon> = {
  home: Home,
  trophy: Trophy,
  compass: Compass,
  folderOpen: FolderOpen,
  barChart3: BarChart3,
  settings: Settings,
};

type ParticipantSidebarProps = {
  items: ParticipantSidebarItem[];
  onLogout?: () => void;
};

export function ParticipantSidebar({ items, onLogout }: ParticipantSidebarProps) {
  return (
    <aside className="hidden w-[280px] shrink-0 flex-col border-r border-[#1E1E1E] bg-[#000000] p-10 xl:flex">
      <div className="flex items-center gap-3">
        <ChevronDown className="h-5 w-5 text-white" />
        <span className="text-2xl font-bold tracking-[-0.5px] text-white">IPMS BOLIVIA</span>
      </div>

      <nav className="mt-16 flex flex-col gap-8">
        {items.map((item) => {
          const Icon = sidebarIconByKey[item.icon];
          return (
            <Link
              key={item.id}
              href={participantSectionRouteById[item.id]}
              className="flex items-center gap-4 text-left"
            >
              <Icon className={`h-5 w-5 ${item.active ? "text-[#5B68F1]" : "text-[#AAAAAA]"}`} />
              <span
                className={`text-base ${
                  item.active ? "font-semibold text-[#5B68F1]" : "font-medium text-[#AAAAAA] opacity-80"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={onLogout}
        className="mt-auto flex items-center gap-4 text-left opacity-70 transition hover:opacity-100"
      >
        <LogOut className="h-5 w-5 text-[#AAAAAA]" />
        <span className="text-base font-medium text-[#AAAAAA]">Cerrar sesion</span>
      </button>
    </aside>
  );
}

export function ParticipantMobileSidebar({ items, onLogout }: ParticipantSidebarProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const isMenuVisible = menuOpen && menuPath === pathname;

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const openMenu = () => {
    setMenuPath(pathname);
    setMenuOpen(true);
  };

  return (
    <>
      <div className="rounded-2xl border border-[#1E1E1E] bg-[#0c0c0c] px-4 py-3 xl:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <ChevronDown className="h-4 w-4 text-white" />
            <span className="text-lg font-bold tracking-[-0.3px] text-white">IPMS BOLIVIA</span>
          </div>
          <button
            type="button"
            aria-label="Abrir menu de navegacion"
            onClick={openMenu}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#2A2A2A] bg-[#111111] text-[#D0D0D0]"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isMenuVisible ? (
        <div className="fixed inset-0 z-[70] xl:hidden">
          <button
            type="button"
            aria-label="Cerrar menu"
            onClick={closeMenu}
            className="absolute inset-0 bg-black/70"
          />
          <aside className="relative h-full w-[86%] max-w-[320px] border-r border-[#2A2A2A] bg-[#0A0A0A] px-5 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ChevronDown className="h-4 w-4 text-white" />
                <span className="text-lg font-bold text-white">IPMS BOLIVIA</span>
              </div>
              <button
                type="button"
                aria-label="Cerrar menu de navegacion"
                onClick={closeMenu}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#2A2A2A] bg-[#111111] text-[#D0D0D0]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="mt-6 flex flex-col gap-2">
              {items.map((item) => {
                const Icon = sidebarIconByKey[item.icon];
                return (
                  <Link
                    key={`mobile-drawer-${item.id}`}
                    href={participantSectionRouteById[item.id]}
                    onClick={closeMenu}
                    className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-medium ${
                      item.active
                        ? "border-[#5B68F1] bg-[rgba(91,104,241,0.15)] text-[#5B68F1]"
                        : "border-[#2A2A2A] bg-[#111111] text-[#AAAAAA]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <button
              type="button"
              onClick={() => {
                closeMenu();
                onLogout?.();
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-[#2A2A2A] bg-[#111111] px-3 py-2 text-sm font-medium text-[#AAAAAA]"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesion
            </button>
          </aside>
        </div>
      ) : null}
    </>
  );
}
