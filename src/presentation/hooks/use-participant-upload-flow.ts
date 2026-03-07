"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type {
  ParticipantCategoryOption,
  ParticipantScale,
  ParticipantSubcategoryOption,
} from "@/domain/participant/participant.types";

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

export type UploadFormValues = z.infer<typeof uploadSchema>;

type UseParticipantUploadFlowParams = {
  eventId: string;
  userId: string;
  categories: ParticipantCategoryOption[];
  subcategoriesByCategory: Record<string, ParticipantSubcategoryOption[]>;
  scales: ParticipantScale[];
  onSubmitModel: (payload: {
    userId: string;
    eventId: string;
    categoryId: string;
    subcategoryId: string;
    nombreModelo: string;
    marca: string;
    descripcion?: string;
    escalaId: string;
    files: File[];
  }) => Promise<boolean>;
};

export type UploadFlowStep = "category" | "form" | "confirmation";

const defaultFormValues: UploadFormValues = {
  nombreModelo: "",
  marca: "",
  descripcion: "",
  escalaId: "",
};

export const useParticipantUploadFlow = ({
  eventId,
  userId,
  categories,
  subcategoriesByCategory,
  scales,
  onSubmitModel,
}: UseParticipantUploadFlowParams) => {
  const [step, setStep] = useState<UploadFlowStep>("category");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      ...defaultFormValues,
      escalaId: scales[0]?.id ?? "",
    },
  });

  const subcategoryOptions = useMemo(
    () => subcategoriesByCategory[selectedCategoryId] ?? [],
    [selectedCategoryId, subcategoriesByCategory],
  );

  const categoryWithoutSubcategories = Boolean(selectedCategoryId) && subcategoryOptions.length === 0;
  const canContinueToForm = Boolean(selectedCategoryId && selectedSubcategoryId);

  const resetFiles = () => {
    setSelectedFiles([]);
    setFileError(null);
  };

  const resetForAnother = () => {
    setStep("category");
    setSelectedCategoryId("");
    setSelectedSubcategoryId("");
    resetFiles();
    form.reset({
      ...defaultFormValues,
      escalaId: scales[0]?.id ?? "",
    });
  };

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedSubcategoryId("");
  };

  const handleSelectSubcategory = (subcategoryId: string) => {
    setSelectedSubcategoryId(subcategoryId);
  };

  const buildFileKey = (file: File) => `${file.name}-${file.size}-${file.type}-${file.lastModified}`;

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

  const handleGoToForm = () => {
    if (!canContinueToForm) {
      return;
    }
    setStep("form");
  };

  const handleBackToCategory = () => {
    setStep("category");
  };

  const submitForm = form.handleSubmit(async (values) => {
    if (!canContinueToForm) {
      return;
    }

    const success = await onSubmitModel({
      userId,
      eventId,
      categoryId: selectedCategoryId,
      subcategoryId: selectedSubcategoryId,
      nombreModelo: values.nombreModelo,
      marca: values.marca,
      descripcion: values.descripcion,
      escalaId: values.escalaId,
      files: selectedFiles,
    });

    if (success) {
      setStep("confirmation");
    }
  });

  return {
    step,
    categories,
    subcategoryOptions,
    scales,
    selectedCategoryId,
    selectedSubcategoryId,
    selectedFiles,
    fileError,
    form,
    categoryWithoutSubcategories,
    canContinueToForm,
    handleSelectCategory,
    handleSelectSubcategory,
    handleFilesChange,
    handleGoToForm,
    handleBackToCategory,
    submitForm,
    resetForAnother,
  };
};

