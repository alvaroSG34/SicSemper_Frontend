"use client";

import { useEffect, useMemo, useState } from "react";
import type { AuditLogDetailItem, AuditLogListItem, SystemAlert } from "@/domain/admin/admin.types";
import { adminBitacoraService } from "@/application/admin/services/admin-bitacora.service";

type AdminBitacoraSectionProps = {
  headingClassName: string;
  alerts: SystemAlert[];
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-BO", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));

const resolveAlertTimestamp = (alert: SystemAlert) =>
  alert.lastTriggeredAt ?? alert.createdAt;

export function AdminBitacoraSection({ headingClassName, alerts }: AdminBitacoraSectionProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [actor, setActor] = useState("");
  const [moduleName, setModuleName] = useState("");
  const [action, setAction] = useState("");
  const [result, setResult] = useState<"" | "SUCCESS" | "FAILED" | "ERROR">("");
  const [ipAddress, setIpAddress] = useState("");
  const [query, setQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [logs, setLogs] = useState<AuditLogListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<AuditLogDetailItem | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await adminBitacoraService.listBitacora({
          page,
          pageSize,
          actor: actor.trim() || undefined,
          module: moduleName.trim() || undefined,
          action: action.trim() || undefined,
          result: result || undefined,
          ipAddress: ipAddress.trim() || undefined,
          query: query.trim() || undefined,
          startDate: startDate ? new Date(startDate).toISOString() : undefined,
          endDate: endDate ? new Date(`${endDate}T23:59:59.999Z`).toISOString() : undefined,
        });

        if (!mounted) {
          return;
        }

        setLogs(response.items);
        setTotal(response.total);
        setHasMore(response.hasMore);

        if (response.items.length === 0) {
          setSelectedId(null);
          setSelectedItem(null);
          return;
        }

        setSelectedId((currentSelectedId) => {
          const stillExists =
            currentSelectedId && response.items.some((entry) => entry.id === currentSelectedId);
          return stillExists ? currentSelectedId : (response.items[0]?.id ?? null);
        });
      } catch (loadError) {
        if (!mounted) {
          return;
        }
        setError(loadError instanceof Error ? loadError.message : "No se pudo cargar la bitacora.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [page, pageSize, actor, moduleName, action, result, ipAddress, query, startDate, endDate]);

  useEffect(() => {
    if (!selectedId) {
      setSelectedItem(null);
      return;
    }

    let mounted = true;

    const loadDetail = async () => {
      try {
        setLoadingDetail(true);
        const detail = await adminBitacoraService.getBitacoraItem(selectedId);
        if (!mounted) {
          return;
        }
        setSelectedItem(detail);
      } catch {
        if (!mounted) {
          return;
        }
        setSelectedItem(null);
      } finally {
        if (mounted) {
          setLoadingDetail(false);
        }
      }
    };

    void loadDetail();

    return () => {
      mounted = false;
    };
  }, [selectedId]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [pageSize, total]);
  const operationalAlerts = useMemo(() => {
    const last24Hours = Date.now() - 24 * 60 * 60 * 1000;
    return [...alerts]
      .filter((alert) => {
        const timestamp = Date.parse(resolveAlertTimestamp(alert));
        return Number.isFinite(timestamp) && timestamp >= last24Hours;
      })
      .sort(
        (left, right) =>
          Date.parse(resolveAlertTimestamp(right)) - Date.parse(resolveAlertTimestamp(left)),
      );
  }, [alerts]);

  return (
    <section className="grid w-full grid-cols-1 gap-5 xl:grid-cols-[1.6fr_1fr] xl:gap-8">
      <article className="rounded-3xl bg-[#121212] p-5 sm:p-6 xl:p-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className={`${headingClassName} text-[20px] font-semibold text-white`}>Bitacora</h3>
          <span className="text-xs text-[#9C9C9C]">{total} registros</span>
        </div>

        <div className="grid grid-cols-1 gap-3 rounded-xl border border-[#2A2A2A] bg-[#111111] p-3 sm:grid-cols-2 xl:grid-cols-4">
          <input value={actor} onChange={(event) => { setActor(event.target.value); setPage(1); }} placeholder="Usuario" className="rounded-lg border border-[#2B2B2B] bg-[#181818] px-3 py-2 text-xs text-white" />
          <input value={moduleName} onChange={(event) => { setModuleName(event.target.value); setPage(1); }} placeholder="Modulo" className="rounded-lg border border-[#2B2B2B] bg-[#181818] px-3 py-2 text-xs text-white" />
          <input value={action} onChange={(event) => { setAction(event.target.value); setPage(1); }} placeholder="Accion" className="rounded-lg border border-[#2B2B2B] bg-[#181818] px-3 py-2 text-xs text-white" />
          <select value={result} onChange={(event) => { setResult(event.target.value as "" | "SUCCESS" | "FAILED" | "ERROR"); setPage(1); }} className="rounded-lg border border-[#2B2B2B] bg-[#181818] px-3 py-2 text-xs text-white">
            <option value="">Resultado</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="FAILED">FAILED</option>
            <option value="ERROR">ERROR</option>
          </select>
          <input value={ipAddress} onChange={(event) => { setIpAddress(event.target.value); setPage(1); }} placeholder="IP" className="rounded-lg border border-[#2B2B2B] bg-[#181818] px-3 py-2 text-xs text-white" />
          <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Buscar" className="rounded-lg border border-[#2B2B2B] bg-[#181818] px-3 py-2 text-xs text-white" />
          <input type="date" value={startDate} onChange={(event) => { setStartDate(event.target.value); setPage(1); }} className="rounded-lg border border-[#2B2B2B] bg-[#181818] px-3 py-2 text-xs text-white" />
          <input type="date" value={endDate} onChange={(event) => { setEndDate(event.target.value); setPage(1); }} className="rounded-lg border border-[#2B2B2B] bg-[#181818] px-3 py-2 text-xs text-white" />
        </div>

        {error ? <p className="mt-3 text-xs text-[#FCA5A5]">{error}</p> : null}

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-xs text-[#D1D1D1]">
            <thead>
              <tr className="border-b border-[#2A2A2A] text-[#A0A0A0]">
                <th className="px-2 py-2">Fecha</th>
                <th className="px-2 py-2">Usuario</th>
                <th className="px-2 py-2">Rol</th>
                <th className="px-2 py-2">Accion</th>
                <th className="px-2 py-2">Modulo</th>
                <th className="px-2 py-2">Descripcion</th>
                <th className="px-2 py-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((item) => (
                <tr key={item.id} className={`cursor-pointer border-b border-[#1D1D1D] ${selectedId === item.id ? "bg-[#1B1B1B]" : ""}`} onClick={() => setSelectedId(item.id)}>
                  <td className="px-2 py-2">{formatDate(item.createdAt)}</td>
                  <td className="px-2 py-2">{item.actor?.name ?? "Sistema"}</td>
                  <td className="px-2 py-2">{item.actorRole ?? "-"}</td>
                  <td className="px-2 py-2">{item.action ?? "-"}</td>
                  <td className="px-2 py-2">{item.module ?? "-"}</td>
                  <td className="max-w-[340px] px-2 py-2">
                    <p className="truncate font-medium text-white">{item.title}</p>
                    <p className="truncate text-[#9C9C9C]">{item.detail}</p>
                  </td>
                  <td className="px-2 py-2">{item.result ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && logs.length === 0 ? (
            <p className="mt-3 text-xs text-[#8E8E8E]">No se encontraron registros de bitacora con los criterios ingresados.</p>
          ) : null}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={page <= 1 || loading} className="rounded-md border border-[#2B2B2B] px-3 py-1 text-xs text-white disabled:opacity-40">Anterior</button>
            <button type="button" onClick={() => setPage((prev) => prev + 1)} disabled={!hasMore || loading} className="rounded-md border border-[#2B2B2B] px-3 py-1 text-xs text-white disabled:opacity-40">Siguiente</button>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#8E8E8E]">
            <span>Pagina {page} / {totalPages}</span>
            <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} className="rounded border border-[#2B2B2B] bg-[#181818] px-2 py-1 text-xs text-white">
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </article>

      <div className="space-y-5">
        <article className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6 xl:p-8">
          <h3 className={`${headingClassName} text-[20px] font-semibold text-white`}>Detalle</h3>
          {loadingDetail ? <p className="mt-3 text-xs text-[#9C9C9C]">Cargando detalle...</p> : null}
          {!loadingDetail && selectedItem ? (
            <div className="mt-3 space-y-2 text-xs text-[#CECECE]">
              <p><span className="text-[#9C9C9C]">Fecha:</span> {formatDate(selectedItem.createdAt)}</p>
              <p><span className="text-[#9C9C9C]">Usuario:</span> {selectedItem.actor?.email ?? 'Sistema'}</p>
              <p><span className="text-[#9C9C9C]">Rol:</span> {selectedItem.actorRole ?? '-'}</p>
              <p><span className="text-[#9C9C9C]">Accion:</span> {selectedItem.action ?? '-'}</p>
              <p><span className="text-[#9C9C9C]">Modulo:</span> {selectedItem.module ?? '-'}</p>
              <p><span className="text-[#9C9C9C]">Entidad:</span> {selectedItem.entityType ?? '-'} {selectedItem.entityId ?? ''}</p>
              <p><span className="text-[#9C9C9C]">IP:</span> {selectedItem.ipAddress ?? '-'}</p>
              <p><span className="text-[#9C9C9C]">Agente:</span> {selectedItem.userAgent ?? '-'}</p>
              <p className="pt-2 text-sm text-white">{selectedItem.title}</p>
              <p>{selectedItem.detail}</p>
              <div className="pt-2">
                <p className="text-[#9C9C9C]">Datos anteriores</p>
                <pre className="mt-1 overflow-auto rounded bg-[#111111] p-2 text-[11px]">{JSON.stringify(selectedItem.previousData, null, 2)}</pre>
              </div>
              <div>
                <p className="text-[#9C9C9C]">Datos nuevos</p>
                <pre className="mt-1 overflow-auto rounded bg-[#111111] p-2 text-[11px]">{JSON.stringify(selectedItem.newData, null, 2)}</pre>
              </div>
              <div>
                <p className="text-[#9C9C9C]">Metadata</p>
                <pre className="mt-1 overflow-auto rounded bg-[#111111] p-2 text-[11px]">{JSON.stringify(selectedItem.metadata, null, 2)}</pre>
              </div>
            </div>
          ) : null}
        </article>

        <article className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6 xl:p-8">
          <h3 className={`${headingClassName} text-[20px] font-semibold text-white`}>Alertas operativas</h3>
          <div className="mt-3 space-y-3">
            {operationalAlerts.map((alert) => (
              <div key={alert.id} className="rounded-xl bg-[#1A1A1A] p-4">
                <p className="text-sm font-semibold text-white">{alert.title}</p>
                <p className="mt-1 text-[13px] text-[#A0A0A0]">{alert.detail}</p>
                <p className="mt-2 text-[11px] text-[#8E8E8E]">
                  Ultima ocurrencia: {formatDate(resolveAlertTimestamp(alert))}
                </p>
                <p className="text-[11px] text-[#8E8E8E]">
                  Ocurrencias acumuladas: {alert.occurrenceCount ?? 1}
                </p>
                <div className="mt-2 flex items-center gap-2 text-[11px]">
                  <span className="rounded-full border border-[#352A2A] bg-[#251919] px-2 py-1 text-[#FCA5A5]">Severidad {alert.severity}</span>
                  <span className="rounded-full border border-[#2A2F3A] bg-[#1A1E2B] px-2 py-1 text-[#C9D3FF]">{alert.status}</span>
                </div>
              </div>
            ))}
            {operationalAlerts.length === 0 ? (
              <p className="text-xs text-[#8E8E8E]">No hay alertas operativas registradas en las ultimas 24 horas.</p>
            ) : null}
          </div>
        </article>
      </div>
    </section>
  );
}
