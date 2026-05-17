"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { UploadCloud } from "lucide-react";
import { Outfit } from "next/font/google";
import { useParticipantStore } from "@/presentation/stores";
import { useParticipantUploadEventContext } from "./use-participant-upload-event-context";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const allowedPdfType = "application/pdf";
const maxImageSizeBytes = 5 * 1024 * 1024;
const maxPdfSizeBytes = 10 * 1024 * 1024;
const maxImages = 5;
const maxPdfs = 2;

const uploadSchema = z.object({
  nombreModelo: z.string().trim().min(1, "El nombre del modelo es obligatorio."),
  marca: z.string().trim().min(1, "La marca es obligatoria."),
  descripcion: z.string().trim().optional(),
  escalaId: z.string().trim().min(1, "Debes seleccionar una escala."),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

type ParticipantUploadFormSectionProps = {
  eventId: string;
  userId: string;
  level1Id: string;
  finalCategoryId: string;
  level1Name: string;
  level2Name: string | null;
  level2Id: string | null;
  finalCategoryName: string;
  onGoToMyModelsByEvent: (eventId: string) => void;
};

export function ParticipantUploadFormSection({
  eventId,
  userId,
  level1Id,
  finalCategoryId,
  level1Name,
  level2Name,
  level2Id,
  finalCategoryName,
  onGoToMyModelsByEvent,
}: ParticipantUploadFormSectionProps) {
  const { loading, error, eventName, scales } = useParticipantUploadEventContext(
    eventId,
    finalCategoryId,
  );
  const submitModel = useParticipantStore((state) => state.submitModel);
  const flowError = useParticipantStore((state) => state.flowError);
  const flowSuccessMessage = useParticipantStore((state) => state.flowSuccessMessage);
  const clearFlowState = useParticipantStore((state) => state.clearFlowState);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      nombreModelo: "",
      marca: "",
      descripcion: "",
      escalaId: scales[0]?.id ?? "",
    },
  });

  useEffect(() => {
    if (!form.getValues("escalaId") && scales[0]?.id) {
      form.setValue("escalaId", scales[0].id);
    }
  }, [form, scales]);

  const backHref = useMemo(() => {
    if (level2Name && level2Id) {
      return `/participante/subir/${eventId}/nivel-3/${level1Id}/${level2Id}?l1=${encodeURIComponent(level1Name)}&l2=${encodeURIComponent(level2Name)}`;
    }

    if (finalCategoryId === level1Id) {
      return `/participante/subir/${eventId}/nivel-1`;
    }

    return `/participante/subir/${eventId}/nivel-2/${level1Id}?l1=${encodeURIComponent(level1Name)}`;
  }, [eventId, finalCategoryId, level1Id, level1Name, level2Id, level2Name]);

  const buildFileKey = (file: File) =>
    `${file.name}-${file.size}-${file.type}-${file.lastModified}`;

  const mergeFiles = (currentFiles: File[], incomingFiles: File[]) => {
    const seen = new Set<string>();
    const merged: File[] = [];

    for (const file of [...currentFiles, ...incomingFiles]) {
      const key = buildFileKey(file);
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      merged.push(file);
    }

    return merged;
  };

  const handleFilesChange = (files: File[]) => {
    const mergedFiles = mergeFiles(selectedFiles, files);
    let imageCount = 0;
    let pdfCount = 0;

    for (const file of mergedFiles) {
      if (allowedImageTypes.has(file.type)) {
        imageCount += 1;
        if (imageCount > maxImages) {
          setFileError("Solo puedes adjuntar hasta 5 imagenes.");
          return;
        }

        if (file.size > maxImageSizeBytes) {
          setFileError("Cada imagen debe pesar maximo 5MB.");
          return;
        }
        continue;
      }

      if (file.type === allowedPdfType) {
        pdfCount += 1;
        if (pdfCount > maxPdfs) {
          setFileError("Solo puedes adjuntar hasta 2 PDF.");
          return;
        }

        if (file.size > maxPdfSizeBytes) {
          setFileError("Cada PDF debe pesar maximo 10MB.");
          return;
        }
        continue;
      }

      setFileError("Solo se permiten imagenes JPG, PNG, WEBP o archivos PDF.");
      return;
    }

    setFileError(null);
    setSelectedFiles(mergedFiles);
  };

  const submitForm = form.handleSubmit(async (values) => {
    if (!userId.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await submitModel({
        userId,
        eventId,
        categoryId: level1Id,
        subcategoryId: finalCategoryId,
        nombreModelo: values.nombreModelo,
        marca: values.marca,
        descripcion: values.descripcion,
        escalaId: values.escalaId,
        files: selectedFiles,
      });

      if (success) {
        setIsSubmitted(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  });

  const handleSubmitAnother = () => {
    clearFlowState();
    form.reset({
      nombreModelo: "",
      marca: "",
      descripcion: "",
      escalaId: scales[0]?.id ?? "",
    });
    setSelectedFiles([]);
    setFileError(null);
    setIsSubmitted(false);
  };

  if (loading) {
    return (
      <section className="rounded-3xl border border-[#1E1E1E] bg-[#121212] p-5 sm:p-6 md:p-8 xl:p-10">
        <p className="text-sm text-[#9C9C9C]">Cargando formulario de subida...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-3xl border border-[#1E1E1E] bg-[#121212] p-5 sm:p-6 md:p-8 xl:p-10">
        <p className="rounded-xl border border-[#8B1D1D] bg-[#451414] px-4 py-3 text-sm text-[#FFB4B4]">
          {error}
        </p>
      </section>
    );
  }

  if (!userId.trim()) {
    return (
      <section className="rounded-3xl border border-[#1E1E1E] bg-[#121212] p-5 sm:p-6 md:p-8 xl:p-10">
        <p className="rounded-xl border border-[#8B1D1D] bg-[#451414] px-4 py-3 text-sm text-[#FFB4B4]">
          No se pudo identificar al participante actual.
        </p>
      </section>
    );
  }

  if (scales.length === 0) {
    return (
      <section className="rounded-3xl border border-[#1E1E1E] bg-[#121212] p-5 sm:p-6 md:p-8 xl:p-10">
        <p className="rounded-xl border border-[#8B1D1D] bg-[#451414] px-4 py-3 text-sm text-[#FFB4B4]">
          No hay escalas configuradas para esta categoria final en el evento. Contacta a un administrador.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-[#1E1E1E] bg-[#121212] p-5 sm:p-6 md:p-8 xl:p-10">
      <p className="inline-flex rounded-full border border-[#2A2F3A] bg-[#1A1E2B] px-3 py-1 text-xs font-semibold tracking-[1px] text-[#8BA3FF]">
        PASO 4 DE 4
      </p>
      <h2 className={`${outfit.className} mt-4 text-3xl font-bold text-white sm:text-4xl`}>
        Formulario de maqueta
      </h2>
      <p className="mt-2 text-sm text-[#A7A7A7]">
        {eventName} <span className="text-[#6E6E6E]">/</span> {level1Name}
        {level2Name ? (
          <>
            {" "}
            <span className="text-[#6E6E6E]">/</span> {level2Name}
          </>
        ) : null}{" "}
        <span className="text-[#6E6E6E]">/</span>{" "}
        <span className="font-semibold text-[#DCDCDC]">{finalCategoryName}</span>
      </p>

      {isSubmitted ? (
        <div className="mt-6 rounded-2xl border border-[#2A2F3A] bg-[#1A1E2B] p-5">
          <p className="text-sm text-[#D5DBFF]">
            {flowSuccessMessage ?? "Maqueta enviada correctamente."}
          </p>
          <p className="mt-2 text-sm font-semibold text-white">
            Deseas subir otra maqueta?
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={`/participante/subir/${eventId}/nivel-1`}
              onClick={handleSubmitAnother}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-[#5B68F1] px-4 text-sm font-semibold text-white"
            >
              Si, subir otra
            </Link>
            <button
              type="button"
              onClick={() => onGoToMyModelsByEvent(eventId)}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-[#2D2D2D] px-4 text-sm font-semibold text-white"
            >
              No, ir a Mis Maquetas
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={submitForm} className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-[#D0D0D0]">
            Nombre del modelo *
            <input
              {...form.register("nombreModelo")}
              className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
            />
            {form.formState.errors.nombreModelo ? (
              <span className="text-xs text-[#fca5a5]">
                {form.formState.errors.nombreModelo.message}
              </span>
            ) : null}
          </label>

          <label className="flex flex-col gap-2 text-sm text-[#D0D0D0]">
            Marca *
            <input
              {...form.register("marca")}
              className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
            />
            {form.formState.errors.marca ? (
              <span className="text-xs text-[#fca5a5]">
                {form.formState.errors.marca.message}
              </span>
            ) : null}
          </label>

          <label className="flex flex-col gap-2 text-sm text-[#D0D0D0] md:col-span-2">
            Agregados
            <textarea
              {...form.register("descripcion")}
              className="min-h-[100px] rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 py-2 text-sm text-white outline-none"
            />
          </label>

          <p className="rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 py-2 text-xs text-[#AFAFAF] md:col-span-2">
            El codigo de maqueta se genera automaticamente al enviar y sera unico dentro del evento.
          </p>

          <label className="flex flex-col gap-2 text-sm text-[#D0D0D0]">
            Escala *
            <select
              {...form.register("escalaId")}
              className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
            >
              <option value="">Selecciona escala</option>
              {scales.map((scale) => (
                <option key={scale.id} value={scale.id}>
                  {scale.value}
                </option>
              ))}
            </select>
            {form.formState.errors.escalaId ? (
              <span className="text-xs text-[#fca5a5]">
                {form.formState.errors.escalaId.message}
              </span>
            ) : null}
          </label>

          <div className="flex flex-col gap-2 text-sm text-[#D0D0D0]">
            <span>Archivos (opcional)</span>
            <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[#4A4A4A] bg-[#101010] px-3 text-sm text-[#D0D0D0]">
              <UploadCloud className="h-4 w-4" />
              Seleccionar archivos
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                multiple
                className="hidden"
                onChange={(event) => {
                  const nextFiles = Array.from(event.target.files ?? []);
                  handleFilesChange(nextFiles);
                  event.currentTarget.value = "";
                }}
              />
            </label>
            {fileError ? <span className="text-xs text-[#fca5a5]">{fileError}</span> : null}
            {selectedFiles.length > 0 ? (
              <span className="text-xs text-[#AFAFAF]">
                {selectedFiles.length} archivo(s) seleccionados (
                {selectedFiles.filter((file) => file.type === "application/pdf").length} PDF,{" "}
                {selectedFiles.filter((file) => file.type !== "application/pdf").length} imagenes)
              </span>
            ) : null}
            <span className="text-[11px] text-[#8F8F8F]">
              Maximo: 5 imagenes (5MB c/u) y 2 PDF (10MB c/u).
            </span>
          </div>

          {flowError ? (
            <p className="rounded-lg border border-[#7f1d1d] bg-[#7f1d1d]/20 px-4 py-3 text-sm text-[#fca5a5] md:col-span-2">
              {flowError}
            </p>
          ) : null}

          <div className="flex gap-3 md:col-span-2">
            <Link
              href={backHref}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-[#2D2D2D] px-4 text-sm font-semibold text-white"
            >
              Volver
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-[#5B68F1] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Enviando..." : "Enviar maqueta"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
