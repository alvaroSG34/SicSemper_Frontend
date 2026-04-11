import dynamic from "next/dynamic";
import { getApiBaseUrl } from "@/infrastructure/api/api-base-url";
import { landingDefaultContent, normalizeLandingContent } from "@/presentation/components/features/landing/landing-data";

const LandingPageFeature = dynamic(
  () =>
    import("@/presentation/components/features").then(
      (module) => module.LandingPageFeature,
    ),
  {
    loading: () => (
      <main className="flex min-h-screen items-center justify-center bg-[color:var(--landing-bg)] text-white">
        <span className="rounded-full border border-white/20 px-4 py-2 text-sm">
          Cargando sitio...
        </span>
      </main>
    ),
  },
);

async function loadLandingContent() {
  try {
    const response = await fetch(`${getApiBaseUrl()}/landing/content`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return landingDefaultContent;
    }

    const payload = (await response.json()) as unknown;
    return normalizeLandingContent(payload);
  } catch {
    return landingDefaultContent;
  }
}

export default async function LandingPage() {
  const landingContent = await loadLandingContent();

  return <LandingPageFeature content={landingContent} />;
}
