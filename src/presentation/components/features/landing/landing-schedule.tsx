import type { LandingContent } from "@/domain/landing/landing.types";

type LandingScheduleProps = {
  content: LandingContent;
};

export function LandingSchedule({ content }: LandingScheduleProps) {
  return (
    <section
      id="agenda"
      className="mx-auto flex w-full max-w-[1400px] flex-col gap-12 px-6 py-16 md:px-10 xl:flex-row xl:justify-center xl:gap-20 xl:px-[120px] xl:py-[100px]"
    >
      <div className="flex w-full max-w-[494px] flex-col gap-5">
        <h2 className="text-4xl leading-[1.1] font-bold text-[color:var(--landing-text)] xl:text-5xl">
          Agenda
        </h2>
        <p className="whitespace-pre-line text-sm leading-[1.6] text-[color:var(--landing-muted)]">
          Una lista completa de actividades para que aproveches al máximo cada bloque del evento.
          {"\n"}Gestiona tu tiempo y elige las sesiones que más te interesan.
        </p>
        <button
          type="button"
          className="mt-2 flex h-[42px] w-full items-center justify-center rounded-[22px] border border-[color:var(--landing-text)] text-[11px] font-bold text-[color:var(--landing-text)] xl:w-[494px]"
        >
          DESCARGAR AGENDA
        </button>
      </div>

      <div className="flex w-full flex-col xl:max-w-[700px]">
        <div className="flex gap-8 pb-5">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-[color:var(--landing-text)]">Día Uno</span>
            <div className="h-[3px] w-[60px] rounded-[2px] bg-[color:var(--landing-indigo)]" />
          </div>

        </div>

        <div className="flex flex-col gap-8">
          {content.scheduleItems.map((item) => (
            <article key={item.time} className="flex w-full flex-col gap-3 sm:flex-row sm:gap-6">
              <p className="min-w-[160px] text-[13px] text-[color:var(--landing-muted)]">
                {item.time}
              </p>
              <div
                className={`mt-1 h-3 w-3 shrink-0 rounded-full ${
                  item.isActive
                    ? "bg-[color:var(--landing-indigo)]"
                    : "border border-[color:var(--landing-indigo)]"
                }`}
              />
              <div className="flex w-full max-w-[500px] flex-col gap-2">
                <h3 className="text-base font-semibold text-[color:var(--landing-text)]">
                  {item.title}
                </h3>
                <p className="text-[13px] leading-[1.5] text-[color:var(--landing-muted)]">
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
