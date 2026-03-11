import dynamic from "next/dynamic";

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

export default function LandingPage() {
  return <LandingPageFeature />;
}
