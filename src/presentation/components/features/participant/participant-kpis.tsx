import { Outfit } from "next/font/google";
import { Medal, Trophy } from "lucide-react";
import type { ParticipantKpi } from "@/domain/participant/participant.types";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const kpiIconByKey = {
  medal: Medal,
  trophy: Trophy,
} as const;

const kpiStyleByTone = {
  neutral: {
    border: "border-[#333333]",
    panel: "bg-[#121212]",
    icon: "text-white",
    value: "text-white",
  },
  primary: {
    border: "border-[#5B68F1]",
    panel: "bg-[#121212]",
    icon: "text-[#5B68F1]",
    value: "text-[#5B68F1]",
  },
  accent: {
    border: "border-[#F15BB5]",
    panel: "bg-[#121212]",
    icon: "text-[#F15BB5]",
    value: "text-[#F15BB5]",
  },
} as const;

type ParticipantKpisProps = {
  kpis: ParticipantKpi[];
};

export function ParticipantKpis({ kpis }: ParticipantKpisProps) {
  return (
    <section className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6">
      {kpis.map((kpi) => {
        const Icon = kpiIconByKey[kpi.icon];
        const tone = kpiStyleByTone[kpi.tone];
        return (
          <article
            key={kpi.id}
            className={`flex h-[140px] flex-col justify-between rounded-[20px] border p-6 ${
              tone.border
            } ${tone.panel} ${kpi.tone === "accent" ? "sm:col-span-2 lg:col-span-1" : ""}`.trim()}
          >
            <div className="flex items-center gap-3">
              <Icon className={`h-6 w-6 ${tone.icon}`} />
              <p className="text-sm font-medium text-[#AAAAAA]">{kpi.label}</p>
            </div>
            {kpi.suffix ? (
              <div className="flex items-end gap-1">
                <p className={`${outfit.className} text-5xl leading-none font-bold ${tone.value}`}>
                  {kpi.value}
                </p>
                <p className="pb-1 text-sm text-[#AAAAAA]">{kpi.suffix}</p>
              </div>
            ) : (
              <p className={`${outfit.className} text-5xl leading-none font-bold ${tone.value}`}>{kpi.value}</p>
            )}
          </article>
        );
      })}
    </section>
  );
}
