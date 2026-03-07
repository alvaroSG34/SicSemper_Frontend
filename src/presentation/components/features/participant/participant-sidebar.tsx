import type { LucideIcon } from "lucide-react";
import { BarChart3, ChevronDown, Compass, FolderOpen, Home, LogOut, Settings, Trophy } from "lucide-react";
import type { ParticipantSectionId, ParticipantSidebarItem } from "@/domain/participant/participant.types";

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
  onSelectSection?: (sectionId: ParticipantSectionId) => void;
  onLogout?: () => void;
};

export function ParticipantSidebar({ items, onSelectSection, onLogout }: ParticipantSidebarProps) {
  return (
    <aside className="hidden w-[280px] shrink-0 flex-col border-r border-[#1E1E1E] bg-[#000000] p-10 xl:flex">
      <div className="flex items-center gap-3">
        <ChevronDown className="h-5 w-5 text-white" />
        <span className="text-2xl font-bold tracking-[-0.5px] text-white">SicSemper</span>
      </div>

      <nav className="mt-16 flex flex-col gap-8">
        {items.map((item) => {
          const Icon = sidebarIconByKey[item.icon];
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectSection?.(item.id)}
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
            </button>
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

export function ParticipantMobileSidebar({ items, onSelectSection, onLogout }: ParticipantSidebarProps) {
  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0c0c0c] px-4 py-3 xl:hidden">
      <div className="flex items-center gap-3">
        <ChevronDown className="h-4 w-4 text-white" />
        <span className="text-lg font-bold tracking-[-0.3px] text-white">SicSemper</span>
      </div>
      <nav className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {items.map((item) => {
          const Icon = sidebarIconByKey[item.icon];
          return (
            <button
              key={`mobile-${item.id}`}
              type="button"
              onClick={() => onSelectSection?.(item.id)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium ${
                item.active
                  ? "border-[#5B68F1] bg-[rgba(91,104,241,0.15)] text-[#5B68F1]"
                  : "border-[#2A2A2A] bg-[#111111] text-[#AAAAAA]"
              }`}
            >
              <Icon className="mr-1 inline h-3.5 w-3.5 align-[-2px]" />
              {item.label}
            </button>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={onLogout}
        className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[#2A2A2A] bg-[#111111] px-3 py-1.5 text-xs font-medium text-[#AAAAAA]"
      >
        <LogOut className="h-3.5 w-3.5" />
        Cerrar sesion
      </button>
    </div>
  );
}
