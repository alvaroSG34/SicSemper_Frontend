"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type ParticipantShowcaseLegacyScaleRedirectProps = {
  eventId: string;
  level1Id: string;
  finalCategoryId: string;
  level1Name: string;
  level2Name: string | null;
  level2Id: string | null;
  finalCategoryName: string;
};

export function ParticipantShowcaseLegacyScaleRedirect({
  eventId,
  level1Id,
  finalCategoryId,
  level1Name,
  level2Name,
  level2Id,
  finalCategoryName,
}: ParticipantShowcaseLegacyScaleRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    router.replace(
      `/participante/participantes/${eventId}/maquetas/${level1Id}/${finalCategoryId}/escalas?l1=${encodeURIComponent(level1Name)}&final=${encodeURIComponent(finalCategoryName)}${level2Name ? `&l2=${encodeURIComponent(level2Name)}` : ""}${level2Id ? `&l2id=${encodeURIComponent(level2Id)}` : ""}`,
    );
  }, [
    eventId,
    finalCategoryId,
    finalCategoryName,
    level1Id,
    level1Name,
    level2Id,
    level2Name,
    router,
  ]);

  return (
    <section className="rounded-3xl border border-[#1E1E1E] bg-[#121212] p-6 text-sm text-[#BBBBBB]">
      Redirigiendo a las escalas y grupos...
    </section>
  );
}
