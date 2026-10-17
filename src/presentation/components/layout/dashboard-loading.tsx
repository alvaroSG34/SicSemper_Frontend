import { getApiBaseUrl } from "@/infrastructure/api/api-base-url";
import { normalizeLandingContent } from "@/presentation/components/features/landing/landing-data";
import { LoadingBrandLogo } from "./loading-brand-logo";

type DashboardLoadingProps = {
  message: string;
};

const loadBrandingLogo = async () => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/landing/content`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return "";
    }

    return normalizeLandingContent(await response.json()).branding.logoUrl;
  } catch {
    return "";
  }
};

export async function DashboardLoading({ message }: DashboardLoadingProps) {
  const logoUrl = await loadBrandingLogo();

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#000000] px-4 text-white">
      <div className="flex w-full max-w-md flex-col items-center gap-5 rounded-2xl border border-[#2D2D2D] bg-[#121212] px-5 py-6 text-center text-sm text-[#CFCFCF] sm:px-8 sm:py-8">
        <LoadingBrandLogo logoUrl={logoUrl} />
        <span>{message}</span>
      </div>
    </main>
  );
}
