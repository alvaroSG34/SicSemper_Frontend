import type { ReactNode } from "react";

type DashboardLayoutProps = Readonly<{
  children: ReactNode;
}>;

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return <div className="min-h-screen bg-[#000000] text-white">{children}</div>;
}
