import { ImageIcon, Tag } from "lucide-react";
import { Outfit } from "next/font/google";
import type { ParticipantModel } from "@/domain/participant/participant.types";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["600", "700"],
});

type ParticipantMyModelsProps = {
  models: ParticipantModel[];
  loading?: boolean;
};

export function ParticipantMyModels({ models, loading = false }: ParticipantMyModelsProps) {
  return (
    <article className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6 xl:p-8">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h3 className={`${outfit.className} text-[22px] font-semibold text-white`}>Mis Maquetas</h3>
        <span className="text-xs uppercase tracking-[1.5px] text-[#8D8D8D]">{models.length} registros</span>
      </div>

      {loading ? <p className="text-sm text-[#9C9C9C]">Cargando maquetas...</p> : null}

      {!loading && models.length === 0 ? (
        <p className="rounded-xl border border-[#2D2D2D] bg-[#121212] px-4 py-3 text-sm text-[#9C9C9C]">
          Aun no tienes maquetas registradas.
        </p>
      ) : null}

      <div className="space-y-4">
        {models.map((model) => (
          <article key={model.id} className="rounded-2xl border border-[#2D2D2D] bg-[#1A1A1A] p-4">
            <p className="text-base font-semibold text-white">{model.nombre}</p>
            <p className="mt-1 text-sm text-[#BDBDBD]">
              {model.modelo} · {model.marca}
            </p>
            <p className="mt-1 text-sm text-[#A0A0A0]">
              {model.eventName} · {model.categoryName} · {model.subcategoryName}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#D8D8D8]">
              <span className="inline-flex items-center gap-1 rounded-full border border-[#303030] px-2 py-1">
                <Tag className="h-3.5 w-3.5" />
                Codigo: {model.codigo}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#303030] px-2 py-1">
                Escala: {model.escalaValue}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#303030] px-2 py-1">
                Estado: {model.status}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#303030] px-2 py-1">
                <ImageIcon className="h-3.5 w-3.5" />
                {model.images.length} imagen(es)
              </span>
            </div>
          </article>
        ))}
      </div>
    </article>
  );
}

