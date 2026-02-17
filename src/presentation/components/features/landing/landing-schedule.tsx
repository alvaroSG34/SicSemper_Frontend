import { scheduleItems } from "./landing-data";

export function LandingSchedule() {
  return (
    <section className="flex w-full gap-20 px-[120px] py-[100px]">
      <div className="flex w-[340px] flex-col gap-5">
        <h2 className="text-5xl leading-[1.1] font-bold text-white">Agenda</h2>
        <p className="whitespace-pre-line text-sm leading-[1.6] text-[#999999]">
          A comprehensive list of event programs for your pleasure.{"\n"}Manage your time to get
          the best result.
        </p>
        <button
          type="button"
          className="mt-2 flex h-[42px] w-[494px] items-center justify-center rounded-[22px] border border-white text-[11px] font-bold text-white"
        >
          DESCARGAR AGENDA
        </button>
      </div>

      <div className="flex w-[700px] flex-col">
        <div className="flex gap-8 pb-5">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-white">Día Uno</span>
            <div className="h-[3px] w-[60px] rounded-[2px] bg-[#5865f2]" />
          </div>
          <span className="text-sm text-[#666666]">Día Dos</span>
          <span className="text-sm text-[#666666]">Día Tres</span>
        </div>

        <div className="flex flex-col gap-8">
          {scheduleItems.map((item) => (
            <article key={item.time} className="flex w-full gap-6">
              <p className="min-w-[160px] text-[13px] text-[#999999]">{item.time}</p>
              <div
                className={`mt-1 h-3 w-3 rounded-full ${item.isActive ? "bg-[#5865f2]" : "border border-[#5865f2]"}`}
              />
              <div className="flex w-[500px] flex-col gap-2">
                <h3 className="text-base font-semibold text-white">{item.title}</h3>
                <p className="text-[13px] leading-[1.5] text-[#999999]">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
