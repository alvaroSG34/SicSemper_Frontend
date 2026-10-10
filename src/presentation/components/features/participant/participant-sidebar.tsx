"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { BarChart3, ChevronDown, Compass, FolderOpen, Home, Settings, Trophy } from "lucide-react";
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
};

export function ParticipantSidebar({ items }: ParticipantSidebarProps) {
  return (
    <aside className="hidden w-[280px] shrink-0 flex-col border-r border-[#1E1E1E] bg-[#000000] p-10 xl:flex">
      <div className="flex items-center gap-3">
        <ChevronDown className="h-5 w-5 text-white" />
        <span className="text-2xl font-bold tracking-[-0.5px] text-white">SICSEMPER</span>
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
    </aside>
  );
}

export function ParticipantMobileSidebar({ items }: ParticipantSidebarProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegacion de participante"
      className="fixed inset-x-0 bottom-0 z-[60] flex border-t border-[#2A2A2A] bg-[#0A0A0A]/95 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_28px_rgba(0,0,0,0.3)] backdrop-blur xl:hidden"
    >
      {items.map((item) => {
        const Icon = sidebarIconByKey[item.icon];
        const active = item.active || pathname === participantSectionRouteById[item.id];

        return (
          <Link
            key={`mobile-tab-${item.id}`}
            href={participantSectionRouteById[item.id]}
            aria-current={active ? "page" : undefined}
            className={`relative flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-semibold transition ${
              active ? "bg-[rgba(91,104,241,0.18)] text-[#AAB2FF]" : "text-[#9B9B9B] hover:bg-[#161616] hover:text-white"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span>{item.label}</span>
            {active ? <span className="absolute top-0 h-0.5 w-8 rounded-full bg-[#5B68F1]" /> : null}
          </Link>
        );
      })}
    </nav>
  );
}
