"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEvent } from "react";
import type { UserRole } from "@/domain/user/user.types";
import { useAuthStore } from "@/presentation/stores";

const roleLabel: Record<UserRole, string> = {
  PARTICIPANTE: "Participante",
  JUEZ: "Juez",
  ADMIN: "Admin",
  SUPERADMIN: "Superadmin",
};

const dashboardRouteByRole: Record<UserRole, string> = {
  PARTICIPANTE: "/participante/inicio",
  JUEZ: "/juez/inicio",
  ADMIN: "/admin/inicio",
  SUPERADMIN: "/admin/inicio",
};

export function DashboardRoleSwitch() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const currentRole = useAuthStore((state) => state.currentRole);
  const switchRole = useAuthStore((state) => state.switchRole);
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);

  const rawAvailableRoles = user?.roles ?? [];
  const availableRoles = rawAvailableRoles.includes("SUPERADMIN")
    ? (["SUPERADMIN"] as UserRole[])
    : rawAvailableRoles;
  const activeRole = currentRole ?? availableRoles[0] ?? null;

  if (availableRoles.length <= 1 || !activeRole) {
    return null;
  }

  const handleRoleChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const nextRole = event.target.value as UserRole;
    if (!availableRoles.includes(nextRole) || nextRole === activeRole) {
      return;
    }

    try {
      setIsSwitchingRole(true);
      await switchRole(nextRole);
      router.push(dashboardRouteByRole[nextRole]);
    } finally {
      setIsSwitchingRole(false);
    }
  };

  return (
    <label className="flex items-center gap-2 rounded-full border border-[#2A2A2A] bg-[#111111] px-3 py-1.5 text-xs text-[#E5E5E5]">
      <span className="font-semibold text-[#AAAAAA]">Rol</span>
      <select
        className="rounded-md bg-transparent text-xs font-semibold text-white outline-none"
        value={activeRole}
        onChange={handleRoleChange}
        disabled={isSwitchingRole}
        aria-label="Cambiar rol de dashboard"
      >
        {availableRoles.map((role) => (
          <option key={role} value={role} className="bg-[#111111] text-white">
            {roleLabel[role]}
          </option>
        ))}
      </select>
    </label>
  );
}
