"use client";

import { useState } from "react";

type LoadingBrandLogoProps = {
  logoUrl: string;
};

export function LoadingBrandLogo({ logoUrl }: LoadingBrandLogoProps) {
  const [visible, setVisible] = useState(Boolean(logoUrl));

  if (!visible || !logoUrl) {
    return null;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoUrl}
      alt="SICSEMPER"
      className="h-[clamp(7rem,24vw,12rem)] w-[clamp(7rem,24vw,12rem)] max-w-full shrink-0 object-contain"
      onError={() => setVisible(false)}
    />
  );
}
