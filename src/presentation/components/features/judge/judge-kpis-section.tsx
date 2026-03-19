"use client";

import { CheckCircle2, ClipboardCheck, Timer } from "lucide-react";
import { useJudgeKpis } from "./use-judge-kpis";

type JudgeKpisSectionProps = {
  headingClassName: string;
};

export function JudgeKpisSection({ headingClassName }: JudgeKpisSectionProps) {
  const { pendingCount, reviewedToday, averageReviewMinutes } = useJudgeKpis();

  return (
    <section className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6">
      <article className="flex h-[140px] flex-col justify-between rounded-[20px] border border-[#5B68F1] bg-[#121212] p-6">
        <div className="flex items-center gap-3">
          <ClipboardCheck className="h-6 w-6 text-[#5B68F1]" />
          <p className="text-sm font-medium text-[#AAAAAA]">Pendientes</p>
        </div>
        <p className={`${headingClassName} text-5xl leading-none font-bold text-[#5B68F1]`}>{pendingCount}</p>
      </article>

      <article className="flex h-[140px] flex-col justify-between rounded-[20px] border border-[#10B981] bg-[#121212] p-6">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-[#10B981]" />
          <p className="text-sm font-medium text-[#AAAAAA]">Calificadas hoy</p>
        </div>
        <p className={`${headingClassName} text-5xl leading-none font-bold text-[#10B981]`}>{reviewedToday}</p>
      </article>

      <article className="flex h-[140px] flex-col justify-between rounded-[20px] border border-[#F15BB5] bg-[#121212] p-6 sm:col-span-2 lg:col-span-1">
        <div className="flex items-center gap-3">
          <Timer className="h-6 w-6 text-[#F15BB5]" />
          <p className="text-sm font-medium text-[#AAAAAA]">Tiempo promedio</p>
        </div>
        <div className="flex items-end gap-1">
          <p className={`${headingClassName} text-5xl leading-none font-bold text-[#F15BB5]`}>{averageReviewMinutes}</p>
          <p className="pb-1 text-sm text-[#AAAAAA]">min</p>
        </div>
      </article>
    </section>
  );
}
