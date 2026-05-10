"use client";

type ParticipantResultsSectionProps = {
  onGoToEvents: () => void;
  onGoToMyModels: () => void;
};

export function ParticipantResultsSection({
  onGoToEvents,
  onGoToMyModels,
}: ParticipantResultsSectionProps) {
  return (
    <section className="space-y-5">
      <article className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6 xl:p-8">
        <h3 className="text-xl font-semibold text-white">Subir maqueta</h3>
        <p className="mt-2 text-sm text-[#9C9C9C]">
          El flujo de carga usa 3 pantallas por niveles.
          Para subir una maqueta entra a <span className="font-semibold text-[#D9D9D9]">Eventos</span>,
          elige tu evento y presiona <span className="font-semibold text-[#D9D9D9]">Subir maqueta</span>.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onGoToEvents}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[#5B68F1] px-4 text-sm font-semibold text-white"
          >
            Ir a Eventos
          </button>
          <button
            type="button"
            onClick={onGoToMyModels}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[#2D2D2D] px-4 text-sm font-semibold text-white"
          >
            Ir a Mis Maquetas
          </button>
        </div>
      </article>
    </section>
  );
}
