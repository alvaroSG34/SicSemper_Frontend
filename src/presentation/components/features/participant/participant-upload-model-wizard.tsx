"use client";

import { CheckCircle2, ChevronRight, Circle, UploadCloud } from "lucide-react";
import { Outfit } from "next/font/google";
import type {
  ParticipantCategoryOption,
  ParticipantScale,
  ParticipantSubcategoryOption,
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
    nombreModelo: string;
    marca: string;
    descripcion?: string;
    escalaId: string;
    files: File[];
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
  const level2SelectionReady = Boolean(flow.selectedLevel2Id);
  const finalSelectionReady = Boolean(flow.selectedSubcategoryId);

  return (
    <article className="rounded-3xl border border-[#2D2D2D] bg-[#121212] p-6 xl:p-8">
      <h3 className={`${outfit.className} text-[22px] font-semibold text-white`}>Subir maqueta</h3>

      {error ? (
        <p className="mt-4 rounded-xl border border-[#7f1d1d] bg-[#7f1d1d]/20 px-4 py-3 text-sm text-[#fca5a5]">
          {error}
        </p>
      ) : null}

      {flow.step === "category" ? (
        <div className="mt-5 space-y-4">
          <div className="rounded-2xl border border-[#2D2D2D] bg-[#0F0F0F] p-4">
            <div className="flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${
                  flow.selectedCategoryId
                    ? "border-[#5B68F1] bg-[rgba(91,104,241,0.16)] text-[#D7DCFF]"
                    : "border-[#2D2D2D] bg-[#121212] text-[#AFAFAF]"
                }`}
              >
                {flow.selectedCategoryId ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                1. Categoria
              </span>
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${
                  level2SelectionReady
                    ? "border-[#5B68F1] bg-[rgba(91,104,241,0.16)] text-[#D7DCFF]"
                    : "border-[#2D2D2D] bg-[#121212] text-[#AFAFAF]"
                }`}
              >
                {level2SelectionReady ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                2. Subcategoria
              </span>
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${
                  finalSelectionReady
                    ? "border-[#5B68F1] bg-[rgba(91,104,241,0.16)] text-[#D7DCFF]"
                    : "border-[#2D2D2D] bg-[#121212] text-[#AFAFAF]"
                }`}
              >
                {finalSelectionReady ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                3. Seleccion final
              </span>
            </div>

            <p className="mt-3 text-xs text-[#9C9C9C]">Ruta elegida</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm font-medium text-white">
              <span className="rounded-full border border-[#2D2D2D] bg-[#121212] px-3 py-1 text-xs">
                {flow.selectedCategory?.name ?? "Categoria"}
              </span>
              <ChevronRight className="h-4 w-4 text-[#7C7C7C]" />
              <span className="rounded-full border border-[#2D2D2D] bg-[#121212] px-3 py-1 text-xs">
                {flow.selectedLevel2?.name ?? "Subcategoria"}
              </span>
              <ChevronRight className="h-4 w-4 text-[#7C7C7C]" />
              <span className="rounded-full border border-[#2D2D2D] bg-[#121212] px-3 py-1 text-xs">
                {flow.selectedFinalSubcategory?.name ?? "Seleccion final"}
              </span>
            </div>
            {flow.autoSelectedLeafAtLevel2 ? (
              <p className="mt-2 text-xs text-[#A9B2FF]">
                La subcategoria del Nivel 2 es hoja y se tomo automaticamente como seleccion final.
              </p>
            ) : (
              <p className="mt-2 text-xs text-[#8F8F8F]">
                Selecciona una opcion en cada nivel para habilitar el formulario.
              </p>
            )}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <section className="rounded-2xl border border-[#2D2D2D] bg-[#0F0F0F] p-4">
              <h4 className="text-sm font-semibold text-white">Nivel 1</h4>
              <p className="mt-1 text-xs text-[#9C9C9C]">Categoria principal</p>

              <div className="mt-3 space-y-2">
                {flow.categories.map((category) => {
                  const isSelected = flow.selectedCategoryId === category.id;

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => flow.handleSelectCategory(category.id)}
                      className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                        isSelected
                          ? "border-[#5B68F1] bg-[rgba(91,104,241,0.14)] text-white"
                          : "border-[#2D2D2D] bg-[#121212] text-[#D0D0D0] hover:border-[#3A3A3A]"
                      }`}
                    >
                      {category.name}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-[#2D2D2D] bg-[#0F0F0F] p-4">
              <h4 className="text-sm font-semibold text-white">Nivel 2</h4>
              <p className="mt-1 text-xs text-[#9C9C9C]">Subcategoria intermedia</p>

              {!flow.selectedCategoryId ? (
                <p className="mt-3 text-xs text-[#8F8F8F]">Primero elige una categoria del Nivel 1.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {flow.level2Options.map((subcategory) => {
                    const children = subcategoriesByCategory[subcategory.id] ?? [];
                    const isLeaf = children.length === 0;
                    const isSelected = flow.selectedLevel2Id === subcategory.id;

                    return (
                      <button
                        key={subcategory.id}
                        type="button"
                        onClick={() => flow.handleSelectLevel2(subcategory.id)}
                        className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                          isSelected
                            ? "border-[#5B68F1] bg-[rgba(91,104,241,0.14)]"
                            : "border-[#2D2D2D] bg-[#121212] hover:border-[#3A3A3A]"
                        }`}
                      >
                        <p className={`text-sm ${isSelected ? "text-white" : "text-[#D0D0D0]"}`}>
                          {subcategory.name}
                        </p>
                        <p className="mt-1 text-[11px] text-[#9C9C9C]">
                          {isLeaf ? "Seleccion final disponible" : "Tiene opciones de Nivel 3"}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-[#2D2D2D] bg-[#0F0F0F] p-4">
              <h4 className="text-sm font-semibold text-white">Nivel 3</h4>
              <p className="mt-1 text-xs text-[#9C9C9C]">Seleccion final para competir</p>

              {!flow.selectedLevel2Id ? (
                <p className="mt-3 text-xs text-[#8F8F8F]">Selecciona primero una opcion de Nivel 2.</p>
              ) : flow.level3Options.length === 0 ? (
                <div className="mt-3 rounded-xl border border-[#5B68F1] bg-[rgba(91,104,241,0.14)] p-3">
                  <p className="text-sm font-semibold text-white">{flow.selectedLevel2?.name ?? "Seleccion final"}</p>
                  <p className="mt-1 text-[11px] text-[#C8CEFF]">Seleccion final tomada automaticamente.</p>
                </div>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                  {flow.level3Options.map((subcategory) => {
                    const isSelected = flow.selectedSubcategoryId === subcategory.id;

                    return (
                      <button
                        key={subcategory.id}
                        type="button"
                        onClick={() => flow.handleSelectSubcategory(subcategory.id)}
                        className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                          isSelected
                            ? "border-[#5B68F1] bg-[rgba(91,104,241,0.16)] text-[#D7DCFF]"
                            : "border-[#2D2D2D] bg-[#121212] text-[#D0D0D0] hover:border-[#3A3A3A]"
                        }`}
                      >
                        {subcategory.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {flow.categoryWithoutSubcategories ? (
            <div className="rounded-xl border border-[#7f1d1d] bg-[#7f1d1d]/20 px-4 py-3 text-xs text-[#fca5a5]">
              Esta categoria no tiene niveles descendientes disponibles para este evento. Selecciona otra categoria principal.
            </div>
          ) : null}

          <button
            type="button"
            onClick={flow.handleGoToForm}
            disabled={!flow.canContinueToForm}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[#5B68F1] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continuar al formulario
          </button>
        </div>
      ) : null}

      {flow.step === "form" ? (
        <form onSubmit={flow.submitForm} className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-[#D0D0D0]">
            Nombre del modelo *
            <input
              {...flow.form.register("nombreModelo")}
              className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
            />
            {flow.form.formState.errors.nombreModelo ? (
              <span className="text-xs text-[#fca5a5]">{flow.form.formState.errors.nombreModelo.message}</span>
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

          <label className="flex flex-col gap-2 text-sm text-[#D0D0D0] md:col-span-2">
            Agregados
            <textarea
              {...flow.form.register("descripcion")}
              className="min-h-[100px] rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 py-2 text-sm text-white outline-none"
            />
          </label>

          <p className="rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 py-2 text-xs text-[#AFAFAF] md:col-span-2">
            El codigo de maqueta se genera automaticamente al enviar y sera unico dentro del evento.
          </p>

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
                  flow.handleFilesChange(nextFiles);
                  event.currentTarget.value = "";
                }}
              />
            </label>
            {flow.fileError ? <span className="text-xs text-[#fca5a5]">{flow.fileError}</span> : null}
            {flow.selectedFiles.length > 0 ? (
              <span className="text-xs text-[#AFAFAF]">
                {flow.selectedFiles.length} archivo(s) seleccionados (
                {flow.selectedFiles.filter((file) => file.type === "application/pdf").length} PDF,{" "}
                {flow.selectedFiles.filter((file) => file.type !== "application/pdf").length} imagenes)
              </span>
            ) : null}
            <span className="text-[11px] text-[#8F8F8F]">Maximo: 5 imagenes (5MB c/u) y 2 PDF (10MB c/u).</span>
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
