"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Check, ChevronDown, Copy, Download, FileText, ImageIcon, Search, Tag, X } from "lucide-react";
import { Outfit } from "next/font/google";
import Image from "next/image";
import type { ParticipantModel } from "@/domain/participant/participant.types";
import { Skeleton } from "@/presentation/components/ui";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["600", "700"],
});

type ParticipantMyModelsProps = {
  models: ParticipantModel[];
  loading?: boolean;
};

type SortOption = "recent" | "oldest" | "name";
type StatusFilterOption = "ALL" | ParticipantModel["status"];

const dateFormatter = new Intl.DateTimeFormat("es-BO", {
  dateStyle: "medium",
  timeStyle: "short",
});

const formatDate = (value: string) => {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "Sin fecha";
  }

  return dateFormatter.format(parsedDate);
};

const formatFileSize = (sizeBytes: number) => {
  if (sizeBytes <= 0) {
    return "0 B";
  }

  if (sizeBytes < 1024) {
    return `${sizeBytes} B`;
  }

  if (sizeBytes < 1024 * 1024) {
    return `${(sizeBytes / 1024).toFixed(1)} KB`;
  }

  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
};

const resolveFileUrl = (publicUrl: string, fileName: string) => {
  const normalizedPublicUrl = publicUrl.trim();
  if (normalizedPublicUrl) {
    return normalizedPublicUrl;
  }

  const normalizedFileName = fileName.trim();
  if (/^https?:\/\//i.test(normalizedFileName)) {
    return normalizedFileName;
  }

  return "";
};

const statusStyles: Record<ParticipantModel["status"], string> = {
  ENVIADA: "border-[#3B82F6]/60 bg-[#1D4ED8]/20 text-[#BFDBFE]",
  EN_REVISION: "border-[#F59E0B]/60 bg-[#92400E]/20 text-[#FDE68A]",
  CALIFICADA: "border-[#10B981]/60 bg-[#047857]/20 text-[#A7F3D0]",
};

export function ParticipantMyModels({ models, loading = false }: ParticipantMyModelsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilterOption>("ALL");
  const [eventFilter, setEventFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [copiedModelId, setCopiedModelId] = useState<string | null>(null);
  const [expandedModelId, setExpandedModelId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<{ url: string; fileName: string } | null>(null);

  const showSkeleton = loading && models.length === 0;
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const eventOptions = useMemo(() => {
    const eventsMap = new Map<string, string>();

    for (const model of models) {
      if (!eventsMap.has(model.eventId)) {
        eventsMap.set(model.eventId, model.eventName);
      }
    }

    return Array.from(eventsMap.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [models]);

  const modelsByStatus = useMemo(
    () =>
      models.reduce(
        (accumulator, model) => {
          accumulator[model.status] += 1;
          return accumulator;
        },
        {
          ENVIADA: 0,
          EN_REVISION: 0,
          CALIFICADA: 0,
        } satisfies Record<ParticipantModel["status"], number>,
      ),
    [models],
  );

  const totalFiles = useMemo(
    () => models.reduce((accumulator, model) => accumulator + model.files.length, 0),
    [models],
  );

  const filteredModels = useMemo(() => {
    const nextModels = models.filter((model) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        model.nombreModelo.toLowerCase().includes(normalizedSearch) ||
        model.codigo.toLowerCase().includes(normalizedSearch) ||
        model.marca.toLowerCase().includes(normalizedSearch) ||
        model.eventName.toLowerCase().includes(normalizedSearch);

      const matchesStatus = statusFilter === "ALL" || model.status === statusFilter;
      const matchesEvent = eventFilter === "ALL" || model.eventId === eventFilter;

      return matchesSearch && matchesStatus && matchesEvent;
    });

    nextModels.sort((left, right) => {
      if (sortBy === "name") {
        return left.nombreModelo.localeCompare(right.nombreModelo);
      }

      const leftDate = new Date(left.createdAt).getTime();
      const rightDate = new Date(right.createdAt).getTime();

      if (sortBy === "oldest") {
        return leftDate - rightDate;
      }

      return rightDate - leftDate;
    });

    return nextModels;
  }, [eventFilter, models, normalizedSearch, sortBy, statusFilter]);

  const copyModelCode = async (modelId: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedModelId(modelId);
      window.setTimeout(() => {
        setCopiedModelId((current) => (current === modelId ? null : current));
      }, 1500);
    } catch {
      setCopiedModelId(null);
    }
  };

  const toggleModelExpand = (modelId: string) => {
    setExpandedModelId((currentModelId) => (currentModelId === modelId ? null : modelId));
  };

  useEffect(() => {
    if (!previewImage) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPreviewImage(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [previewImage]);

  return (
    <>
      <article className="rounded-3xl border border-[#353535] bg-[#161616] p-6 sm:p-7 xl:p-9">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h3 className={`${outfit.className} text-3xl font-semibold leading-tight text-white`}>Mis Maquetas</h3>
          <span className="text-sm font-medium uppercase tracking-[1.4px] text-[#B4B4B4]">{models.length} registros</span>
        </div>

        {!showSkeleton && models.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-[#353535] bg-[#111111] px-4 py-3">
                <p className="text-sm font-semibold uppercase tracking-[1.2px] text-[#B7B7B7]">Total</p>
                <p className="mt-1 text-2xl font-semibold text-white">{models.length}</p>
              </div>
              <div className="rounded-xl border border-[#353535] bg-[#111111] px-4 py-3">
                <p className="text-sm font-semibold uppercase tracking-[1.2px] text-[#B7B7B7]">Enviadas</p>
                <p className="mt-1 text-2xl font-semibold text-[#BFDBFE]">{modelsByStatus.ENVIADA}</p>
              </div>
              <div className="rounded-xl border border-[#353535] bg-[#111111] px-4 py-3">
                <p className="text-sm font-semibold uppercase tracking-[1.2px] text-[#B7B7B7]">Archivos</p>
                <p className="mt-1 text-2xl font-semibold text-[#D1D5DB]">{totalFiles}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-4">
              <label className="relative flex items-center md:col-span-2">
                <Search className="pointer-events-none absolute left-3 h-5 w-5 text-[#9B9B9B]" />
                <input
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setExpandedModelId(null);
                  }}
                  placeholder="Buscar por nombre, codigo, marca o evento"
                  className="h-11 w-full rounded-lg border border-[#3A3A3A] bg-[#101010] pl-11 pr-3 text-base text-white placeholder:text-[#9C9C9C] outline-none transition focus-visible:border-[#6C8DFF] focus-visible:ring-2 focus-visible:ring-[#6C8DFF]/40"
                />
              </label>

              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value as StatusFilterOption);
                  setExpandedModelId(null);
                }}
                className="h-11 rounded-lg border border-[#3A3A3A] bg-[#101010] px-3 text-base text-white outline-none transition focus-visible:border-[#6C8DFF] focus-visible:ring-2 focus-visible:ring-[#6C8DFF]/40"
              >
                <option value="ALL">Todos los estados</option>
                <option value="ENVIADA">ENVIADA</option>
                <option value="EN_REVISION">EN_REVISION</option>
                <option value="CALIFICADA">CALIFICADA</option>
              </select>

              <select
                value={eventFilter}
                onChange={(event) => {
                  setEventFilter(event.target.value);
                  setExpandedModelId(null);
                }}
                className="h-11 rounded-lg border border-[#3A3A3A] bg-[#101010] px-3 text-base text-white outline-none transition focus-visible:border-[#6C8DFF] focus-visible:ring-2 focus-visible:ring-[#6C8DFF]/40"
              >
                <option value="ALL">Todos los eventos</option>
                {eventOptions.map((eventOption) => (
                  <option key={eventOption.id} value={eventOption.id}>
                    {eventOption.name}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(event) => {
                  setSortBy(event.target.value as SortOption);
                  setExpandedModelId(null);
                }}
                className="h-11 rounded-lg border border-[#3A3A3A] bg-[#101010] px-3 text-base text-white outline-none transition focus-visible:border-[#6C8DFF] focus-visible:ring-2 focus-visible:ring-[#6C8DFF]/40 md:col-span-4"
              >
                <option value="recent">Orden: Mas recientes</option>
                <option value="oldest">Orden: Mas antiguas</option>
                <option value="name">Orden: Nombre A-Z</option>
              </select>
            </div>
          </>
        ) : null}

        {showSkeleton ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <article
                key={`model-skeleton-${index}`}
                className="rounded-2xl border border-[#2D2D2D] bg-[#1A1A1A] p-4"
              >
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="mt-2 h-4 w-3/4" />
                <Skeleton className="mt-2 h-4 w-4/5" />
                <div className="mt-4 flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </article>
            ))}
          </div>
        ) : null}

        {!showSkeleton && models.length === 0 ? (
          <p className="rounded-xl border border-[#353535] bg-[#111111] px-4 py-4 text-base text-[#C1C1C1]">
            Aun no tienes maquetas registradas.
          </p>
        ) : null}

        {!showSkeleton && models.length > 0 ? (
          <div className="space-y-4">
            {filteredModels.length === 0 ? (
              <p className="rounded-xl border border-[#353535] bg-[#111111] px-4 py-4 text-base text-[#C1C1C1]">
                No hay resultados con los filtros actuales.
              </p>
            ) : null}

            {filteredModels.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border border-[#383838] bg-[#1A1A1A]">
                <div className="min-w-[980px]">
                  <div className="grid grid-cols-[1.2fr_1fr_1.2fr_1fr_1fr_72px] border-b border-[#393939] bg-[#141414] px-4 py-3 text-sm font-semibold uppercase tracking-[1px] text-[#D0D0D0] sm:px-5">
                    <p>Nombre</p>
                    <p>Marca</p>
                    <p>Evento</p>
                    <p>Categoria</p>
                    <p>Subcategoria</p>
                    <p className="text-center">Detalle</p>
                  </div>

                  {filteredModels.map((model) => {
                    const imageFiles = model.files.filter((file) => file.mimeType.startsWith("image/"));
                    const pdfFiles = model.files.filter(
                      (file) => file.mimeType === "application/pdf" || file.fileName.toLowerCase().endsWith(".pdf"),
                    );
                    const isExpanded = expandedModelId === model.id;

                    return (
                      <article key={model.id} className="border-b border-[#333333] last:border-b-0">
                        <div className="grid grid-cols-[1.2fr_1fr_1.2fr_1fr_1fr_72px] items-center gap-3 px-4 py-3.5 text-sm text-[#E2E2E2] sm:px-5">
                          <p className="truncate text-base font-semibold text-white">{model.nombreModelo}</p>
                          <p className="truncate">{model.marca}</p>
                          <p className="truncate">{model.eventName}</p>
                          <p className="truncate">{model.categoryName}</p>
                          <p className="truncate">{model.subcategoryName ?? "Sin subcategoria"}</p>
                          <div className="flex justify-center">
                            <button
                              type="button"
                              onClick={() => toggleModelExpand(model.id)}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#4A4A4A] text-[#E1E1E1] transition hover:border-[#6A6A6A] hover:bg-[#222222] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8BA6FF]/70"
                              aria-expanded={isExpanded}
                              aria-controls={`model-detail-${model.id}`}
                              aria-label={isExpanded ? "Ocultar detalle de la maqueta" : "Ver detalle de la maqueta"}
                            >
                              <ChevronDown
                                className={`h-5 w-5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                              />
                            </button>
                          </div>
                        </div>

                        {isExpanded ? (
                          <div id={`model-detail-${model.id}`} className="border-t border-[#333333] bg-[#181818] p-4 sm:p-5 xl:p-6">
                            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xl font-semibold leading-tight text-white sm:text-2xl">{model.nombreModelo}</p>
                          <p className="mt-1 text-base font-medium text-[#D8D8D8] sm:text-lg">{model.marca}</p>
                        </div>
                        <span
                          className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-semibold leading-none ${
                            statusStyles[model.status]
                          }`}
                        >
                          {model.status}
                        </span>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-3">
                        <div className="rounded-lg border border-[#3A3A3A] bg-[#131313] px-3 py-2">
                          <p className="text-sm font-semibold uppercase tracking-[1px] text-[#C8C8C8]">Evento</p>
                          <p className="mt-1 text-base leading-relaxed text-[#E2E2E2]">{model.eventName}</p>
                        </div>
                        <div className="rounded-lg border border-[#3A3A3A] bg-[#131313] px-3 py-2">
                          <p className="text-sm font-semibold uppercase tracking-[1px] text-[#C8C8C8]">Categoria</p>
                          <p className="mt-1 text-base leading-relaxed text-[#E2E2E2]">{model.categoryName}</p>
                        </div>
                        <div className="rounded-lg border border-[#3A3A3A] bg-[#131313] px-3 py-2">
                          <p className="text-sm font-semibold uppercase tracking-[1px] text-[#C8C8C8]">Subcategoria</p>
                          <p className="mt-1 text-base leading-relaxed text-[#E2E2E2]">
                            {model.subcategoryName ?? "Sin subcategoria"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-sm text-[#E1E1E1]">
                        <div className="inline-flex items-stretch overflow-hidden rounded-lg border border-[#4A79EE]/60 bg-gradient-to-r from-[#1C2A5A] to-[#101A36] shadow-[0_0_0_1px_rgba(59,107,234,0.2)]">
                          <span className="inline-flex items-center gap-1.5 border-r border-[#4A79EE]/60 px-3 py-2 text-sm font-semibold uppercase tracking-[1px] text-[#D3E0FF]">
                            <Tag className="h-4 w-4" />
                            Codigo
                          </span>
                          <span className="px-3 py-2 font-mono text-base tracking-[0.14em] text-[#F8FAFF]">
                            {model.codigo}
                          </span>
                          <button
                            type="button"
                            onClick={() => void copyModelCode(model.id, model.codigo)}
                            className="inline-flex h-11 items-center gap-1.5 border-l border-[#4A79EE]/60 px-3 text-sm font-semibold text-[#E2EBFF] transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8BA6FF]/70"
                            aria-label={`Copiar codigo ${model.codigo}`}
                          >
                            {copiedModelId === model.id ? (
                              <>
                                <Check className="h-4 w-4" />
                                Copiado
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4" />
                                Copiar
                              </>
                            )}
                          </button>
                        </div>

                        <span className="inline-flex h-11 items-center gap-1.5 rounded-full border border-[#414141] px-3 text-sm">
                          Escala: {model.escalaValue}
                        </span>
                        <span className="inline-flex h-11 items-center gap-1.5 rounded-full border border-[#414141] px-3 text-sm">
                          <ImageIcon className="h-4 w-4" />
                          {model.files.length} archivo(s)
                        </span>
                      </div>

                      <div className="grid gap-2 text-sm text-[#D4D4D4] sm:grid-cols-2 sm:text-base">
                        <p className="inline-flex items-center gap-1.5">
                          <CalendarClock className="h-4 w-4 shrink-0" />
                          Enviado: {formatDate(model.createdAt)}
                        </p>
                        <p className="inline-flex items-center gap-1.5">
                          <CalendarClock className="h-4 w-4 shrink-0" />
                          Actualizado: {formatDate(model.updatedAt)}
                        </p>
                      </div>

                      {model.descripcion.trim() ? (
                        <div className="rounded-lg border border-[#3A3A3A] bg-[#131313] px-4 py-3 text-base leading-relaxed text-[#DBDBDB]">
                          {model.descripcion}
                        </div>
                      ) : null}
                    </div>

                    <section className="space-y-4 rounded-xl border border-[#3A3A3A] bg-[#141414] p-4 sm:p-5">
                      <h4 className={`${outfit.className} text-xl font-semibold leading-relaxed text-white`}>Imagenes y PDF</h4>

                      {model.files.length === 0 ? (
                        <p className="text-base text-[#C5C5C5]">No hay archivos adjuntos.</p>
                      ) : (
                        <>
                          <section className="space-y-3">
                            <p className="text-sm font-semibold uppercase tracking-[1.2px] text-[#CDCDCD]">Imagenes</p>

                            {imageFiles.length === 0 ? (
                              <p className="text-base text-[#C5C5C5]">No hay imagenes adjuntas.</p>
                            ) : (
                              <div className="grid gap-3 sm:grid-cols-2">
                                {imageFiles.map((file) => {
                                  const resolvedFileUrl = resolveFileUrl(file.publicUrl, file.fileName);
                                  const hasPublicUrl = Boolean(resolvedFileUrl);
                                  return (
                                    <figure
                                      key={file.id}
                                      className="overflow-hidden rounded-lg border border-[#3A3A3A] bg-[#101010]"
                                    >
                                      {hasPublicUrl ? (
                                        <button
                                          type="button"
                                          className="group block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8BA6FF]/70"
                                          onClick={() =>
                                            setPreviewImage({
                                              url: resolvedFileUrl,
                                              fileName: file.fileName,
                                            })
                                          }
                                          aria-label={`Ampliar imagen ${file.fileName}`}
                                        >
                                          <Image
                                            src={resolvedFileUrl}
                                            alt={file.fileName}
                                            width={640}
                                            height={440}
                                            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                                            className="h-44 w-full object-cover transition duration-200 group-hover:scale-[1.03]"
                                            unoptimized
                                          />
                                        </button>
                                      ) : (
                                        <div className="flex h-44 flex-col items-center justify-center gap-1 bg-[#151515] text-[#A8A8A8]">
                                          <ImageIcon className="h-6 w-6" />
                                          <span className="text-sm">Sin URL de imagen</span>
                                        </div>
                                      )}
                                      <figcaption className="space-y-1 px-3 py-3 text-sm text-[#D8D8D8]">
                                        <p className="truncate font-medium">{file.fileName}</p>
                                        <p className="text-[#BDBDBD]">
                                          {formatFileSize(file.sizeBytes)} - #{file.order}
                                        </p>
                                      </figcaption>
                                    </figure>
                                  );
                                })}
                              </div>
                            )}
                          </section>

                          <section className="space-y-3">
                            <p className="text-sm font-semibold uppercase tracking-[1.2px] text-[#CDCDCD]">PDF</p>

                            {pdfFiles.length === 0 ? (
                              <p className="text-base text-[#C5C5C5]">No hay PDF adjuntos.</p>
                            ) : (
                              <ul className="space-y-2">
                                {pdfFiles.map((file) => {
                                  const resolvedFileUrl = resolveFileUrl(file.publicUrl, file.fileName);
                                  const hasPublicUrl = Boolean(resolvedFileUrl);

                                  return (
                                    <li
                                      key={file.id}
                                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#3A3A3A] bg-[#101010] px-3 py-3 text-sm text-[#DEDEDE]"
                                    >
                                      <div className="flex min-w-0 items-center gap-2">
                                        <FileText className="h-4 w-4 shrink-0 text-[#D1D1D1]" />
                                        <span className="truncate font-medium">{file.fileName}</span>
                                      </div>

                                      <div className="flex flex-wrap items-center gap-2 text-sm text-[#CBCBCB]">
                                        <span>{formatFileSize(file.sizeBytes)}</span>
                                        <span>#{file.order}</span>
                                        <a
                                          href={hasPublicUrl ? resolvedFileUrl : "#"}
                                          download={file.fileName}
                                          aria-disabled={!hasPublicUrl}
                                          onClick={(event) => {
                                            if (!hasPublicUrl) {
                                              event.preventDefault();
                                            }
                                          }}
                                          className={`inline-flex h-11 items-center gap-1.5 rounded border px-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8BA6FF]/70 ${
                                            hasPublicUrl
                                              ? "border-[#525252] text-[#F1F1F1] hover:border-[#666666] hover:text-white"
                                              : "cursor-not-allowed border-[#3B3B3B] text-[#8F8F8F]"
                                          }`}
                                          title={hasPublicUrl ? "Descargar PDF" : "PDF sin URL disponible"}
                                        >
                                          <Download className="h-4 w-4" />
                                          Descargar PDF
                                        </a>
                                      </div>
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </section>
                        </>
                      )}
                    </section>
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
) : null}
          </div>
        ) : null}
      </article>

      {previewImage ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-xl border border-[#2D2D2D] bg-[#0E0E0E]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#3A3A3A] bg-black/50 text-[#E5E5E5] transition hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8BA6FF]/70"
              aria-label="Cerrar imagen"
            >
              <X className="h-5 w-5" />
            </button>

            <Image
              src={previewImage.url}
              alt={previewImage.fileName}
              width={1600}
              height={1200}
              sizes="100vw"
              className="max-h-[82vh] w-full object-contain"
              unoptimized
            />
            <div className="border-t border-[#2D2D2D] px-4 py-3 text-base text-[#D0D0D0]">
              {previewImage.fileName}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
