import type { AdminPermission } from '@/domain/admin/admin.types';

type AdminPermissionsSectionProps = {
  headingClassName: string;
  permissions: AdminPermission[];
  totalPermissions: number;
  permissionSearch: string;
  onPermissionSearchChange: (value: string) => void;
};

export function AdminPermissionsSection({
  headingClassName,
  permissions,
  totalPermissions,
  permissionSearch,
  onPermissionSearchChange,
}: AdminPermissionsSectionProps) {
  return (
    <section id="permisos" className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-4 sm:p-5 xl:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className={`${headingClassName} text-[18px] font-semibold text-white`}>Permisos del sistema</h3>
          <span className="text-xs text-[#9C9C9C]">Listado completo de permisos y asignaciones activas</span>
        </div>
        <span className="inline-flex h-7 items-center rounded-full border border-[#2D2D2D] bg-[#121212] px-3 text-[11px] font-semibold text-[#D1D1D1]">
          Total: {totalPermissions}
        </span>
      </div>

      <div className="mb-3 grid gap-2 md:grid-cols-2">
        <input
          value={permissionSearch}
          onChange={(event) => onPermissionSearchChange(event.target.value)}
          placeholder="Buscar por codigo, nombre o descripcion"
          className="h-8 rounded-lg border border-[#2D2D2D] bg-[#101010] px-2.5 text-xs text-white outline-none"
        />
        <p className="flex h-8 items-center rounded-lg border border-[#2D2D2D] bg-[#121212] px-2.5 text-[11px] text-[#9C9C9C]">
          {permissions.length} permiso(s) visible(s)
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {permissions.map((permission) => (
          <article
            key={permission.id}
            title={permission.name}
            className="rounded-lg border border-[#2D2D2D] bg-[#121212] px-2 py-1.5"
          >
            <p className="text-[11px] font-medium leading-tight text-white break-words">{permission.name}</p>
          </article>
        ))}

        {permissions.length === 0 ? (
          <p className="col-span-4 rounded-xl border border-[#2D2D2D] bg-[#121212] px-4 py-3 text-sm text-[#9C9C9C]">
            No se encontraron permisos con los filtros seleccionados.
          </p>
        ) : null}
      </div>
    </section>
  );
}
