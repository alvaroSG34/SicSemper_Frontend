"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { PublicHeader } from "./public-header";

const LANDING_SECTION_IDS = ["inicio", "acerca", "agenda", "equipo", "ubicacion"] as const;

export function AutoPublicHeader() {
  const pathname = usePathname();
  const variant = pathname === "/login" ? "login" : "landing";
  const [activeLinkId, setActiveLinkId] = useState<string | null>("inicio");

  useEffect(() => {
    if (pathname !== "/") {
      return;
    }

    const updateFromHash = () => {
      const hashId = window.location.hash.replace("#", "");
      if (LANDING_SECTION_IDS.includes(hashId as (typeof LANDING_SECTION_IDS)[number])) {
        setActiveLinkId(hashId);
      }
    };

    const hashFrame = window.requestAnimationFrame(updateFromHash);

    const sections = LANDING_SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (section): section is HTMLElement => section !== null,
    );

    if (sections.length === 0) {
      return () => window.cancelAnimationFrame(hashFrame);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length === 0) {
          return;
        }

        visibleEntries.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        setActiveLinkId(visibleEntries[0].target.id);
      },
      {
        root: null,
        rootMargin: "-35% 0px -45% 0px",
        threshold: [0.15, 0.35, 0.55, 0.75],
      },
    );

    sections.forEach((section) => observer.observe(section));
    window.addEventListener("hashchange", updateFromHash);

    return () => {
      window.cancelAnimationFrame(hashFrame);
      observer.disconnect();
      window.removeEventListener("hashchange", updateFromHash);
    };
  }, [pathname]);

  return (
    <PublicHeader
      variant={variant}
      isLandingPage={pathname === "/"}
      activeLinkId={pathname === "/" ? activeLinkId : null}
      activeAuthAction={
        pathname === "/login" ? "login" : pathname === "/register" ? "register" : null
      }
    />
  );
}
