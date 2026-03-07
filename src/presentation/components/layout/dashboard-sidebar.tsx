import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Gavel, LayoutDashboard, ShieldCheck } from "lucide-react";

type SidebarItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const sidebarItems: SidebarItem[] = [
  { label: "Participante", href: "/participante", icon: LayoutDashboard },
  { label: "Juez", href: "/juez", icon: Gavel },
  { label: "Admin", href: "/admin", icon: ShieldCheck },
];

export function DashboardSidebar() {
  return (
    <aside className="hidden w-72 flex-col border-r border-border bg-card xl:flex">
      <div className="border-b border-border px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          NOMBRE
        </p>
        <h2 className="mt-1 text-lg font-semibold text-foreground">Dashboard</h2>
      </div>

      <nav className="flex flex-1 flex-col gap-2 px-4 py-4">
        {sidebarItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-[var(--radius-md)] border border-transparent px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-border hover:bg-secondary hover:text-foreground"
          >
            <item.icon className="size-4" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
