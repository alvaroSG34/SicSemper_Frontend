import { sponsors } from "./landing-data";

export function LandingSponsors() {
  return (
    <section className="flex w-full flex-col items-center gap-12 px-[120px] py-[100px]">
      <h2 className="text-center text-5xl font-bold text-white">Nuestros Patrocinadores</h2>

      <div className="flex w-[900px] flex-col items-center gap-10">
        <div className="flex h-[200px] w-full items-center justify-center gap-[60px] rounded-3xl bg-[#0f0f0f] p-10">
          {sponsors.main.map((sponsor) => (
            <div key={sponsor} className="flex h-[120px] w-[200px] items-center justify-center">
              <span className="text-2xl font-bold tracking-[2px] text-[#666666]">{sponsor}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-white" />
          <div className="h-2 w-2 rounded-full bg-[#444444]" />
          <div className="h-2 w-2 rounded-full bg-[#444444]" />
          <div className="h-2 w-2 rounded-full bg-[#444444]" />
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <p className="text-center text-xs font-semibold tracking-[2px] text-[#666666]">
          También nos apoyan
        </p>
        <div className="flex items-center justify-center gap-10">
          {sponsors.secondary.map((sponsor) => (
            <span key={sponsor} className="text-sm font-semibold tracking-[1px] text-[#444444]">
              {sponsor}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
