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
  const [selectedLevel2Id, setSelectedLevel2Id] = useState<string>("");
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

  const level2Options = useMemo(
    () => subcategoriesByCategory[selectedCategoryId] ?? [],
    [selectedCategoryId, subcategoriesByCategory],
  );
  const level3Options = useMemo(
    () => subcategoriesByCategory[selectedLevel2Id] ?? [],
    [selectedLevel2Id, subcategoriesByCategory],
  );

  const categoryWithoutSubcategories =
    Boolean(selectedCategoryId) && level2Options.length === 0;
  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId],
  );
  const selectedLevel2 = useMemo(
    () => level2Options.find((subcategory) => subcategory.id === selectedLevel2Id) ?? null,
    [level2Options, selectedLevel2Id],
  );
  const selectedFinalSubcategory = useMemo(() => {
    if (!selectedSubcategoryId) {
      return null;
    }

    const explicitLevel3 = level3Options.find(
      (subcategory) => subcategory.id === selectedSubcategoryId,
    );
    if (explicitLevel3) {
      return explicitLevel3;
    }

    if (selectedLevel2?.id === selectedSubcategoryId) {
      return selectedLevel2;
    }

    return null;
  }, [level3Options, selectedLevel2, selectedSubcategoryId]);
  const autoSelectedLeafAtLevel2 = Boolean(
    selectedLevel2 &&
      selectedSubcategoryId === selectedLevel2.id &&
      level3Options.length === 0,
  );
  const canContinueToForm = Boolean(
    selectedCategoryId && selectedLevel2Id && selectedSubcategoryId,
  );

  const resetFiles = () => {
    setSelectedFiles([]);
    setFileError(null);
  };

  const resetForAnother = () => {
    setStep("category");
    setSelectedCategoryId("");
    setSelectedLevel2Id("");
    setSelectedSubcategoryId("");
    resetFiles();
    form.reset({
      ...defaultFormValues,
      escalaId: scales[0]?.id ?? "",
    });
  };

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedLevel2Id("");
    setSelectedSubcategoryId("");
  };

  const handleSelectLevel2 = (subcategoryId: string) => {
    setSelectedLevel2Id(subcategoryId);
    const children = subcategoriesByCategory[subcategoryId] ?? [];
    setSelectedSubcategoryId(children.length === 0 ? subcategoryId : "");
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
    level2Options,
    level3Options,
    scales,
    selectedCategoryId,
    selectedLevel2Id,
    selectedSubcategoryId,
    selectedFiles,
    fileError,
    form,
    categoryWithoutSubcategories,
    selectedCategory,
    selectedLevel2,
    selectedFinalSubcategory,
    autoSelectedLeafAtLevel2,
    canContinueToForm,
    handleSelectCategory,
    handleSelectLevel2,
    handleSelectSubcategory,
    handleFilesChange,
    handleGoToForm,
    handleBackToCategory,
    submitForm,
    resetForAnother,
  };
};

