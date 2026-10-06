"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  FileText,
  ImageIcon,
  Search,
  Tag,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Outfit } from "next/font/google";
import type {
  ParticipantModel,
  ParticipantModelFile,
} from "@/domain/participant/participant.types";
import { ImageWithSkeleton, Skeleton } from "@/presentation/components/ui";
import { useRealtimeDirtyForm } from "@/presentation/realtime/use-realtime-dirty-form";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["600", "700"],
});

type ParticipantMyModelsProps = {
  models: ParticipantModel[];
  loading?: boolean;
  initialEventFilterId?: string | null;
  onUpdateModel?: (payload: {
    modelId: string;
    nombreModelo: string;
    marca: string;
    descripcion?: string;
    files: Array<{ id: string } | File>;
  }) => Promise<void>;
  onDeleteModel?: (modelId: string) => Promise<void>;
};

type SortOption = "recent" | "oldest" | "name";
type EditableFile = { existing?: ParticipantModelFile; newFile?: File };
const participantModelEditDomains = ["participant", "model", "event"] as const;

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

export function ParticipantMyModels({
  models,
  loading = false,
  initialEventFilterId,
  onUpdateModel,
  onDeleteModel,
}: ParticipantMyModelsProps) {
  const normalizedInitialEventFilterId = initialEventFilterId?.trim();
  const [searchTerm, setSearchTerm] = useState("");
  const [eventFilter, setEventFilter] = useState<string>(normalizedInitialEventFilterId || "ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [subcategoryFilter, setSubcategoryFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [copiedModelId, setCopiedModelId] = useState<string | null>(null);
  const [expandedModelId, setExpandedModelId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<{ url: string; fileName: string } | null>(null);
  const [editingModel, setEditingModel] = useState<ParticipantModel | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingBrand, setEditingBrand] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingFiles, setEditingFiles] = useState<EditableFile[]>([]);
  const [editingError, setEditingError] = useState<string | null>(null);
  const [editingSaving, setEditingSaving] = useState(false);
  useRealtimeDirtyForm([...participantModelEditDomains], Boolean(editingModel));
  const [modelPendingDeletion, setModelPendingDeletion] = useState<ParticipantModel | null>(null);
  const [deletingModelId, setDeletingModelId] = useState<string | null>(null);
  const [deletingError, setDeletingError] = useState<string | null>(null);

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

  const categoryOptions = useMemo(() => {
    const categoriesMap = new Map<string, string>();

    for (const model of models) {
      if (!categoriesMap.has(model.categoryId)) {
        categoriesMap.set(model.categoryId, model.categoryName);
      }
    }

    return Array.from(categoriesMap.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [models]);

  const subcategoryOptions = useMemo(() => {
    const subcategoriesMap = new Map<string, string>();

    for (const model of models) {
      if (categoryFilter !== "ALL" && model.categoryId !== categoryFilter) {
        continue;
      }

      if (!subcategoriesMap.has(model.subcategoryId)) {
        subcategoriesMap.set(model.subcategoryId, model.subcategoryName ?? "Sin subcategoria");
      }
    }

    return Array.from(subcategoriesMap.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [categoryFilter, models]);

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

      const matchesEvent = eventFilter === "ALL" || model.eventId === eventFilter;
      const matchesCategory = categoryFilter === "ALL" || model.categoryId === categoryFilter;
      const matchesSubcategory =
        subcategoryFilter === "ALL" || model.subcategoryId === subcategoryFilter;

      return matchesSearch && matchesEvent && matchesCategory && matchesSubcategory;
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
  }, [categoryFilter, eventFilter, models, normalizedSearch, sortBy, subcategoryFilter]);

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

  const openEditModel = (model: ParticipantModel) => {
    setEditingModel(model);
    setEditingName(model.nombreModelo);
    setEditingBrand(model.marca);
    setEditingDescription(model.descripcion);
    setEditingFiles(model.files.map((existing) => ({ existing })));
    setEditingError(null);
  };

  const moveEditingFile = (index: number, offset: number) => {
    setEditingFiles((current) => {
      const targetIndex = index + offset;
      if (targetIndex < 0 || targetIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  };

  const submitEditModel = async () => {
    if (!editingModel) return;
    if (!editingName.trim() || !editingBrand.trim()) {
      setEditingError("El nombre y la marca son obligatorios.");
      return;
    }
    setEditingSaving(true);
    setEditingError(null);
    try {
      const files = editingFiles.map((entry) => {
        if (entry.existing) return { id: entry.existing.id };
        if (!entry.newFile) throw new Error("Archivo invalido.");
        return entry.newFile;
      });
      if (!onUpdateModel) throw new Error("La edicion de maquetas no esta disponible.");
      await onUpdateModel({
        modelId: editingModel.id,
        nombreModelo: editingName,
        marca: editingBrand,
        descripcion: editingDescription,
        files,
      });
      setEditingModel(null);
    } catch (error) {
      setEditingError(error instanceof Error ? error.message : "No se pudo actualizar la maqueta.");
    } finally {
      setEditingSaving(false);
    }
  };

  const requestDeleteModel = (model: ParticipantModel) => {
    setModelPendingDeletion(model);
    setDeletingError(null);
  };

  const confirmDeleteModel = async () => {
    if (!modelPendingDeletion) return;
    if (!onDeleteModel) {
      setDeletingError("La eliminacion de maquetas no esta disponible.");
      return;
    }

    setDeletingModelId(modelPendingDeletion.id);
    setDeletingError(null);
    try {
      await onDeleteModel(modelPendingDeletion.id);
      setExpandedModelId((current) => (current === modelPendingDeletion.id ? null : current));
      setModelPendingDeletion(null);
    } catch (error) {
      setDeletingError(error instanceof Error ? error.message : "No se pudo eliminar la maqueta.");
    } finally {
      setDeletingModelId(null);
    }
  };

  const renderModelExpandedDetail = (model: ParticipantModel) => {
    const imageFiles = model.files.filter((file) => file.mimeType.startsWith("image/"));
    const pdfFiles = model.files.filter(
      (file) => file.mimeType === "application/pdf" || file.fileName.toLowerCase().endsWith(".pdf"),
    );

    return (
      <div
        id={`model-detail-${model.id}`}
        className="border-t border-[#333333] bg-[#181818] p-4 sm:p-5 xl:p-6"
      >
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xl font-semibold leading-tight text-white sm:text-2xl">
                  {model.nombreModelo}
                </p>
                <p className="mt-1 text-base font-medium text-[#D8D8D8] sm:text-lg">
                  {model.marca}
                </p>
              </div>
              <span
                className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-semibold leading-none ${
                  statusStyles[model.status]
                }`}
              >
                {model.status}
              </span>
            </div>

            {model.canEdit ? (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => openEditModel(model)}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-[#5B68F1] px-4 text-sm font-semibold text-[#DDE3FF] transition hover:bg-[#5B68F1]/20"
                >
                  Editar maqueta
                </button>
                {onDeleteModel ? (
                  <button
                    type="button"
                    disabled={deletingModelId === model.id}
                    onClick={() => requestDeleteModel(model)}
                    className="inline-flex h-10 items-center justify-center rounded-lg border border-[#B91C1C] px-4 text-sm font-semibold text-[#FECACA] transition hover:bg-[#7F1D1D]/30 disabled:opacity-60"
                  >
                    {deletingModelId === model.id ? "Eliminando..." : "Eliminar maqueta"}
                  </button>
                ) : null}
              </div>
            ) : null}

            {deletingError ? (
              <p className="rounded-lg border border-[#8B1D1D] bg-[#451414] px-3 py-2 text-sm text-[#FFB4B4]">
                {deletingError}
              </p>
            ) : null}

            <div className="grid gap-2 md:grid-cols-3">
              <div className="rounded-lg border border-[#3A3A3A] bg-[#131313] px-3 py-2">
                <p className="text-sm font-semibold uppercase tracking-[1px] text-[#C8C8C8]">
                  Evento
                </p>
                <p className="mt-1 text-base leading-relaxed text-[#E2E2E2] break-words">
                  {model.eventName}
                </p>
              </div>
              <div className="rounded-lg border border-[#3A3A3A] bg-[#131313] px-3 py-2">
                <p className="text-sm font-semibold uppercase tracking-[1px] text-[#C8C8C8]">
                  Categoria
                </p>
                <p className="mt-1 text-base leading-relaxed text-[#E2E2E2] break-words">
                  {model.categoryName}
                </p>
              </div>
              <div className="rounded-lg border border-[#3A3A3A] bg-[#131313] px-3 py-2">
                <p className="text-sm font-semibold uppercase tracking-[1px] text-[#C8C8C8]">
                  Subcategoria
                </p>
                <p className="mt-1 text-base leading-relaxed text-[#E2E2E2] break-words">
                  {model.subcategoryName ?? "Sin subcategoria"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm text-[#E1E1E1]">
              <div className="flex w-full flex-col overflow-hidden rounded-lg border border-[#4A79EE]/60 bg-gradient-to-r from-[#1C2A5A] to-[#101A36] shadow-[0_0_0_1px_rgba(59,107,234,0.2)] sm:w-auto sm:flex-row sm:items-stretch">
                <span className="inline-flex items-center gap-1.5 border-b border-[#4A79EE]/60 px-3 py-2 text-sm font-semibold uppercase tracking-[1px] text-[#D3E0FF] sm:border-b-0 sm:border-r">
                  <Tag className="h-4 w-4" />
                  Codigo
                </span>
                <span className="px-3 py-2 font-mono text-sm tracking-[0.12em] text-[#F8FAFF] break-all sm:text-base">
                  {model.codigo}
                </span>
                <button
                  type="button"
                  onClick={() => void copyModelCode(model.id, model.codigo)}
                  className="inline-flex h-11 w-full items-center justify-center gap-1.5 border-t border-[#4A79EE]/60 px-3 text-sm font-semibold text-[#E2EBFF] transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8BA6FF]/70 sm:w-auto sm:justify-start sm:border-l sm:border-t-0"
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

              <span className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-[#414141] px-3 text-sm">
                Escala: {model.escalaValue}
              </span>
              <span className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-[#414141] px-3 text-sm">
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
              <div className="rounded-lg border border-[#3A3A3A] bg-[#131313] px-4 py-3 text-base leading-relaxed text-[#DBDBDB] break-words">
                {model.descripcion}
              </div>
            ) : null}
          </div>

          <section className="space-y-4 rounded-xl border border-[#3A3A3A] bg-[#141414] p-4 sm:p-5">
            <h4 className={`${outfit.className} text-xl font-semibold leading-relaxed text-white`}>
              Imagenes y PDF
            </h4>

            {model.files.length === 0 ? (
              <p className="text-base text-[#C5C5C5]">No hay archivos adjuntos.</p>
            ) : (
              <>
                <section className="space-y-3">
                  <p className="text-sm font-semibold uppercase tracking-[1.2px] text-[#CDCDCD]">
                    Imagenes
                  </p>

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
                                <ImageWithSkeleton
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
                  <p className="text-sm font-semibold uppercase tracking-[1.2px] text-[#CDCDCD]">
                    PDF
                  </p>

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
    );
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

  useEffect(() => {
    if (!modelPendingDeletion || deletingModelId) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setModelPendingDeletion(null);
        setDeletingError(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [deletingModelId, modelPendingDeletion]);

  return (
    <>
      <article className="rounded-3xl border border-[#353535] bg-[#161616] p-6 sm:p-7 xl:p-9">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h3 className={`${outfit.className} text-3xl font-semibold leading-tight text-white`}>
            Mis Maquetas
          </h3>
          <span className="text-sm font-medium uppercase tracking-[1.4px] text-[#B4B4B4]">
            {models.length} registros
          </span>
        </div>

        {!showSkeleton && models.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-[#353535] bg-[#111111] px-4 py-3">
                <p className="text-sm font-semibold uppercase tracking-[1.2px] text-[#B7B7B7]">
                  Total
                </p>
                <p className="mt-1 text-2xl font-semibold text-white">{models.length}</p>
              </div>
              <div className="rounded-xl border border-[#353535] bg-[#111111] px-4 py-3">
                <p className="text-sm font-semibold uppercase tracking-[1.2px] text-[#B7B7B7]">
                  Enviadas
                </p>
                <p className="mt-1 text-2xl font-semibold text-[#BFDBFE]">
                  {modelsByStatus.ENVIADA}
                </p>
              </div>
              <div className="rounded-xl border border-[#353535] bg-[#111111] px-4 py-3">
                <p className="text-sm font-semibold uppercase tracking-[1.2px] text-[#B7B7B7]">
                  Archivos
                </p>
                <p className="mt-1 text-2xl font-semibold text-[#D1D5DB]">{totalFiles}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-5">
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
                value={categoryFilter}
                onChange={(event) => {
                  setCategoryFilter(event.target.value);
                  setSubcategoryFilter("ALL");
                  setExpandedModelId(null);
                }}
                className="h-11 rounded-lg border border-[#3A3A3A] bg-[#101010] px-3 text-base text-white outline-none transition focus-visible:border-[#6C8DFF] focus-visible:ring-2 focus-visible:ring-[#6C8DFF]/40"
              >
                <option value="ALL">Todas las categorias</option>
                {categoryOptions.map((categoryOption) => (
                  <option key={categoryOption.id} value={categoryOption.id}>
                    {categoryOption.name}
                  </option>
                ))}
              </select>

              <select
                value={subcategoryFilter}
                onChange={(event) => {
                  setSubcategoryFilter(event.target.value);
                  setExpandedModelId(null);
                }}
                className="h-11 rounded-lg border border-[#3A3A3A] bg-[#101010] px-3 text-base text-white outline-none transition focus-visible:border-[#6C8DFF] focus-visible:ring-2 focus-visible:ring-[#6C8DFF]/40"
              >
                <option value="ALL">Todas las subcategorias</option>
                {subcategoryOptions.map((subcategoryOption) => (
                  <option key={subcategoryOption.id} value={subcategoryOption.id}>
                    {subcategoryOption.name}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(event) => {
                  setSortBy(event.target.value as SortOption);
                  setExpandedModelId(null);
                }}
                className="h-11 rounded-lg border border-[#3A3A3A] bg-[#101010] px-3 text-base text-white outline-none transition focus-visible:border-[#6C8DFF] focus-visible:ring-2 focus-visible:ring-[#6C8DFF]/40 md:col-span-5"
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
              <>
                <div className="space-y-3 overflow-x-hidden lg:hidden">
                  {filteredModels.map((model) => {
                    const isExpanded = expandedModelId === model.id;
                    return (
                      <article
                        key={`mobile-${model.id}`}
                        className="overflow-hidden rounded-2xl border border-[#383838] bg-[#1A1A1A]"
                      >
                        <div className="space-y-3 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-lg font-semibold text-white">
                                {model.nombreModelo}
                              </p>
                              <p className="truncate text-sm text-[#D2D2D2]">{model.marca}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleModelExpand(model.id)}
                              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#4A4A4A] text-[#E1E1E1] transition hover:border-[#6A6A6A] hover:bg-[#222222] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8BA6FF]/70"
                              aria-expanded={isExpanded}
                              aria-label={
                                isExpanded
                                  ? "Ocultar detalle de la maqueta"
                                  : "Ver detalle de la maqueta"
                              }
                            >
                              <ChevronDown
                                className={`h-5 w-5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                              />
                            </button>
                          </div>

                          <div className="grid gap-2 text-sm text-[#D7D7D7] sm:grid-cols-2">
                            <p>
                              <span className="text-[#AFAFAF]">Evento:</span>{" "}
                              <span className="break-words">{model.eventName}</span>
                            </p>
                            <p>
                              <span className="text-[#AFAFAF]">Categoria:</span>{" "}
                              <span className="break-words">{model.categoryName}</span>
                            </p>
                            <p>
                              <span className="text-[#AFAFAF]">Subcategoria:</span>{" "}
                              <span className="break-words">
                                {model.subcategoryName ?? "Sin subcategoria"}
                              </span>
                            </p>
                            <p>
                              <span className="text-[#AFAFAF]">Escala:</span> {model.escalaValue}
                            </p>
                            <p>
                              <span className="text-[#AFAFAF]">Archivos:</span> {model.files.length}
                            </p>
                            <p>
                              <span className="text-[#AFAFAF]">Enviado:</span>{" "}
                              {formatDate(model.createdAt)}
                            </p>
                            <p>
                              <span className="text-[#AFAFAF]">Codigo:</span>{" "}
                              <span className="break-all">{model.codigo}</span>
                            </p>
                          </div>

                          <span
                            className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold leading-none ${
                              statusStyles[model.status]
                            }`}
                          >
                            {model.status}
                          </span>
                        </div>
                        {isExpanded ? renderModelExpandedDetail(model) : null}
                      </article>
                    );
                  })}
                </div>

                <div className="hidden overflow-x-auto rounded-2xl border border-[#383838] bg-[#1A1A1A] lg:block">
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
                      const isExpanded = expandedModelId === model.id;

                      return (
                        <article
                          key={model.id}
                          className="border-b border-[#333333] last:border-b-0"
                        >
                          <div className="grid grid-cols-[1.2fr_1fr_1.2fr_1fr_1fr_72px] items-center gap-3 px-4 py-3.5 text-sm text-[#E2E2E2] sm:px-5">
                            <p className="truncate text-base font-semibold text-white">
                              {model.nombreModelo}
                            </p>
                            <p className="truncate">{model.marca}</p>
                            <p className="truncate">{model.eventName}</p>
                            <p className="truncate">{model.categoryName}</p>
                            <p className="truncate">
                              {model.subcategoryName ?? "Sin subcategoria"}
                            </p>
                            <div className="flex justify-center">
                              <button
                                type="button"
                                onClick={() => toggleModelExpand(model.id)}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#4A4A4A] text-[#E1E1E1] transition hover:border-[#6A6A6A] hover:bg-[#222222] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8BA6FF]/70"
                                aria-expanded={isExpanded}
                                aria-controls={`model-detail-${model.id}`}
                                aria-label={
                                  isExpanded
                                    ? "Ocultar detalle de la maqueta"
                                    : "Ver detalle de la maqueta"
                                }
                              >
                                <ChevronDown
                                  className={`h-5 w-5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                                />
                              </button>
                            </div>
                          </div>

                          {isExpanded ? renderModelExpandedDetail(model) : null}
                        </article>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        ) : null}
      </article>

      {editingModel ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#353535] bg-[#161616] p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className={`${outfit.className} text-2xl font-semibold text-white`}>
                  Editar maqueta
                </h4>
                <p className="mt-1 text-sm text-[#BDBDBD]">
                  Disponible hasta{" "}
                  {editingModel.editingDeadline
                    ? formatDate(editingModel.editingDeadline)
                    : "el cierre configurado"}
                  .
                </p>
              </div>
              <button
                type="button"
                disabled={editingSaving}
                onClick={() => setEditingModel(null)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#3A3A3A] text-white"
                aria-label="Cerrar edicion"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 grid gap-4">
              <label className="flex flex-col gap-2 text-sm text-[#D0D0D0]">
                Nombre del modelo
                <input
                  value={editingName}
                  onChange={(event) => setEditingName(event.target.value)}
                  className="h-11 rounded-lg border border-[#3A3A3A] bg-[#101010] px-3 text-white outline-none"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-[#D0D0D0]">
                Marca
                <input
                  value={editingBrand}
                  onChange={(event) => setEditingBrand(event.target.value)}
                  className="h-11 rounded-lg border border-[#3A3A3A] bg-[#101010] px-3 text-white outline-none"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-[#D0D0D0]">
                Descripcion
                <textarea
                  value={editingDescription}
                  onChange={(event) => setEditingDescription(event.target.value)}
                  rows={4}
                  className="rounded-lg border border-[#3A3A3A] bg-[#101010] px-3 py-2 text-white outline-none"
                />
              </label>

              <section className="rounded-xl border border-[#363636] bg-[#111111] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">Archivos</p>
                    <p className="text-sm text-[#BDBDBD]">
                      Maximo 5 imagenes y 2 PDF. Usa las flechas para ordenar.
                    </p>
                  </div>
                  <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-[#4A4A4A] px-3 text-sm font-semibold text-white">
                    <Upload className="h-4 w-4" />
                    Agregar
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      className="hidden"
                      onChange={(event) => {
                        const incoming = Array.from(event.target.files ?? []);
                        setEditingFiles((current) => [
                          ...current,
                          ...incoming.map((newFile) => ({ newFile })),
                        ]);
                        event.currentTarget.value = "";
                      }}
                    />
                  </label>
                </div>
                <div className="mt-3 space-y-2">
                  {editingFiles.length === 0 ? (
                    <p className="text-sm text-[#BDBDBD]">Sin archivos adjuntos.</p>
                  ) : null}
                  {editingFiles.map((entry, index) => {
                    const name = entry.existing?.fileName ?? entry.newFile?.name ?? "Archivo";
                    return (
                      <div
                        key={entry.existing?.id ?? `${name}-${index}`}
                        className="flex items-center gap-2 rounded-lg border border-[#303030] px-3 py-2 text-sm text-[#E2E2E2]"
                      >
                        <span className="min-w-0 flex-1 truncate">{name}</span>
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveEditingFile(index, -1)}
                          className="rounded p-1 disabled:opacity-30"
                          aria-label="Mover arriba"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={index === editingFiles.length - 1}
                          onClick={() => moveEditingFile(index, 1)}
                          className="rounded p-1 disabled:opacity-30"
                          aria-label="Mover abajo"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setEditingFiles((current) =>
                              current.filter((_, fileIndex) => fileIndex !== index),
                            )
                          }
                          className="rounded p-1 text-[#FCA5A5]"
                          aria-label={`Quitar ${name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
              {editingError ? (
                <p className="rounded-lg border border-[#8B1D1D] bg-[#451414] px-3 py-2 text-sm text-[#FFB4B4]">
                  {editingError}
                </p>
              ) : null}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  disabled={editingSaving}
                  onClick={() => setEditingModel(null)}
                  className="h-10 rounded-lg border border-[#444] px-4 text-sm text-white"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={editingSaving}
                  onClick={() => void submitEditModel()}
                  className="h-10 rounded-lg bg-[#5B68F1] px-4 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {editingSaving ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {modelPendingDeletion ? (
        <div
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/80 p-4"
          onMouseDown={() => {
            if (!deletingModelId) {
              setModelPendingDeletion(null);
              setDeletingError(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-model-title"
            className="w-full max-w-md rounded-2xl border border-[#5B2525] bg-[#161616] p-5 shadow-2xl sm:p-6"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#A52929]/70 bg-[#581C1C]/50 text-[#FCA5A5]">
                  <Trash2 className="h-5 w-5" />
                </span>
                <div>
                  <h4 id="delete-model-title" className={`${outfit.className} text-2xl font-semibold text-white`}>
                    ¿Eliminar maqueta?
                  </h4>
                  <p className="mt-1 text-sm text-[#C8C8C8]">Esta accion no se podra deshacer.</p>
                </div>
              </div>
              <button
                type="button"
                disabled={Boolean(deletingModelId)}
                onClick={() => {
                  setModelPendingDeletion(null);
                  setDeletingError(null);
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#3A3A3A] text-white disabled:opacity-50"
                aria-label="Cerrar confirmacion de eliminacion"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-3 text-sm leading-relaxed text-[#D2D2D2]">
              <p>
                La maqueta desaparecera de su historial.
              </p>
              <p className="rounded-lg border border-[#4A3030] bg-[#251515] px-3 py-2 font-semibold text-[#FDE2E2] break-words">
                {modelPendingDeletion.nombreModelo}
              </p>
            </div>

            {deletingError ? (
              <p className="mt-4 rounded-lg border border-[#8B1D1D] bg-[#451414] px-3 py-2 text-sm text-[#FFB4B4]">
                {deletingError}
              </p>
            ) : null}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={Boolean(deletingModelId)}
                onClick={() => {
                  setModelPendingDeletion(null);
                  setDeletingError(null);
                }}
                className="h-10 rounded-lg border border-[#444] px-4 text-sm text-white disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={Boolean(deletingModelId)}
                onClick={() => void confirmDeleteModel()}
                className="h-10 rounded-lg bg-[#B91C1C] px-4 text-sm font-semibold text-white transition hover:bg-[#991B1B] disabled:opacity-60"
              >
                {deletingModelId ? "Eliminando..." : "Eliminar maqueta"}
              </button>
            </div>
          </section>
        </div>
      ) : null}

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

            <ImageWithSkeleton
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
