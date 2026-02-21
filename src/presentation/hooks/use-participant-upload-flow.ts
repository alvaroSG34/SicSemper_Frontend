"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type {
  ParticipantCategoryOption,
  ParticipantScale,
  ParticipantSubcategoryOption,
  ParticipantUploadImageInput,
} from "@/domain/participant/participant.types";

const allowedFileTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxFileSizeBytes = 5 * 1024 * 1024;

const uploadSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio."),
  modelo: z.string().trim().min(1, "El modelo es obligatorio."),
  marca: z.string().trim().min(1, "La marca es obligatoria."),
  descripcion: z.string().trim().optional(),
  codigo: z.string().trim().min(1, "El codigo es obligatorio."),
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
    nombre: string;
    modelo: string;
    marca: string;
    descripcion?: string;
    codigo: string;
    escalaId: string;
    images: ParticipantUploadImageInput[];
  }) => Promise<boolean>;
};

export type UploadFlowStep = "category" | "form" | "confirmation";

const defaultFormValues: UploadFormValues = {
  nombre: "",
  modelo: "",
  marca: "",
  descripcion: "",
  codigo: "",
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

  const handleFilesChange = (files: File[]) => {
    const invalidType = files.find((file) => !allowedFileTypes.has(file.type));
    if (invalidType) {
      setFileError("Solo se permiten imagenes JPG, PNG o WEBP.");
      return;
    }

    const invalidSize = files.find((file) => file.size > maxFileSizeBytes);
    if (invalidSize) {
      setFileError("Cada imagen debe pesar maximo 5MB.");
      return;
    }

    setFileError(null);
    setSelectedFiles(files);
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
      nombre: values.nombre,
      modelo: values.modelo,
      marca: values.marca,
      descripcion: values.descripcion,
      codigo: values.codigo,
      escalaId: values.escalaId,
      images: selectedFiles.map((file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
      })),
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

