"use client";

import { UploadCloud } from "lucide-react";
import { Outfit } from "next/font/google";
import type {
  ParticipantCategoryOption,
  ParticipantScale,
  ParticipantSubcategoryOption,
  ParticipantUploadImageInput,
} from "@/domain/participant/participant.types";
import { useParticipantUploadFlow } from "@/presentation/hooks";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["600", "700"],
});

type ParticipantUploadModelWizardProps = {
  eventId: string;
  userId: string;
  categories: ParticipantCategoryOption[];
  subcategoriesByCategory: Record<string, ParticipantSubcategoryOption[]>;
  scales: ParticipantScale[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
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
  onGoToMyModels: () => void;
};

export function ParticipantUploadModelWizard({
  eventId,
  userId,
  categories,
  subcategoriesByCategory,
  scales,
  loading,
  error,
  successMessage,
  onSubmitModel,
  onGoToMyModels,
}: ParticipantUploadModelWizardProps) {
  const flow = useParticipantUploadFlow({
    eventId,
    userId,
    categories,
    subcategoriesByCategory,
    scales,
    onSubmitModel,
  });

  return (
    <article className="rounded-3xl border border-[#2D2D2D] bg-[#121212] p-6 xl:p-8">
      <h3 className={`${outfit.className} text-[22px] font-semibold text-white`}>Subir maqueta</h3>

      {error ? (
        <p className="mt-4 rounded-xl border border-[#7f1d1d] bg-[#7f1d1d]/20 px-4 py-3 text-sm text-[#fca5a5]">
          {error}
        </p>
      ) : null}

      {flow.step === "category" ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-[#D0D0D0]">
            Categoria
            <select
              value={flow.selectedCategoryId}
              onChange={(event) => flow.handleSelectCategory(event.target.value)}
              className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
            >
              <option value="">Selecciona categoria</option>
              {flow.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm text-[#D0D0D0]">
            Subcategoria
            <select
              value={flow.selectedSubcategoryId}
              onChange={(event) => flow.handleSelectSubcategory(event.target.value)}
              className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
            >
              <option value="">Selecciona subcategoria</option>
              {flow.subcategoryOptions.map((subcategory) => (
                <option key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={flow.handleGoToForm}
            disabled={!flow.canContinueToForm}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[#5B68F1] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 md:col-span-2"
          >
            Continuar al formulario
          </button>
        </div>
      ) : null}

      {flow.step === "form" ? (
        <form onSubmit={flow.submitForm} className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-[#D0D0D0]">
            Nombre *
            <input
              {...flow.form.register("nombre")}
              className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
            />
            {flow.form.formState.errors.nombre ? (
              <span className="text-xs text-[#fca5a5]">{flow.form.formState.errors.nombre.message}</span>
            ) : null}
          </label>

          <label className="flex flex-col gap-2 text-sm text-[#D0D0D0]">
            Modelo *
            <input
              {...flow.form.register("modelo")}
              className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
            />
            {flow.form.formState.errors.modelo ? (
              <span className="text-xs text-[#fca5a5]">{flow.form.formState.errors.modelo.message}</span>
            ) : null}
          </label>

          <label className="flex flex-col gap-2 text-sm text-[#D0D0D0]">
            Marca *
            <input
              {...flow.form.register("marca")}
              className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
            />
            {flow.form.formState.errors.marca ? (
              <span className="text-xs text-[#fca5a5]">{flow.form.formState.errors.marca.message}</span>
            ) : null}
          </label>

          <label className="flex flex-col gap-2 text-sm text-[#D0D0D0]">
            Codigo *
            <input
              {...flow.form.register("codigo")}
              className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
            />
            {flow.form.formState.errors.codigo ? (
              <span className="text-xs text-[#fca5a5]">{flow.form.formState.errors.codigo.message}</span>
            ) : null}
          </label>

          <label className="flex flex-col gap-2 text-sm text-[#D0D0D0] md:col-span-2">
            Descripcion
            <textarea
              {...flow.form.register("descripcion")}
              className="min-h-[100px] rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 py-2 text-sm text-white outline-none"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-[#D0D0D0]">
            Escala *
            <select
              {...flow.form.register("escalaId")}
              className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
            >
              <option value="">Selecciona escala</option>
              {flow.scales.map((scale) => (
                <option key={scale.id} value={scale.id}>
                  {scale.value}
                </option>
              ))}
            </select>
            {flow.form.formState.errors.escalaId ? (
              <span className="text-xs text-[#fca5a5]">{flow.form.formState.errors.escalaId.message}</span>
            ) : null}
          </label>

          <div className="flex flex-col gap-2 text-sm text-[#D0D0D0]">
            <span>Imagenes (opcional)</span>
            <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[#4A4A4A] bg-[#101010] px-3 text-sm text-[#D0D0D0]">
              <UploadCloud className="h-4 w-4" />
              Seleccionar archivos
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(event) => flow.handleFilesChange(Array.from(event.target.files ?? []))}
              />
            </label>
            {flow.fileError ? <span className="text-xs text-[#fca5a5]">{flow.fileError}</span> : null}
            {flow.selectedFiles.length > 0 ? (
              <span className="text-xs text-[#AFAFAF]">{flow.selectedFiles.length} archivo(s) seleccionados</span>
            ) : null}
          </div>

          <div className="flex gap-3 md:col-span-2">
            <button
              type="button"
              onClick={flow.handleBackToCategory}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-[#2D2D2D] px-4 text-sm font-semibold text-white"
            >
              Volver
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-[#5B68F1] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Enviar maqueta"}
            </button>
          </div>
        </form>
      ) : null}

      {flow.step === "confirmation" ? (
        <div className="mt-6 rounded-2xl border border-[#2A2F3A] bg-[#1A1E2B] p-5">
          <p className="text-sm text-[#D5DBFF]">{successMessage ?? "Maqueta enviada correctamente."}</p>
          <p className="mt-2 text-sm font-semibold text-white">Deseas subir otra maqueta?</p>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={flow.resetForAnother}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-[#5B68F1] px-4 text-sm font-semibold text-white"
            >
              Si, subir otra
            </button>
            <button
              type="button"
              onClick={onGoToMyModels}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-[#2D2D2D] px-4 text-sm font-semibold text-white"
            >
              No, ir a Mis Maquetas
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}
