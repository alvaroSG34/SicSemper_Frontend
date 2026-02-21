import { LandingAmbientBackground } from "./landing-ambient-background";
import { LandingEvents } from "./landing-events";
import { LandingFeaturedSpeakers } from "./landing-featured-speakers";
import { LandingFooter } from "./landing-footer";
import { LandingHeader } from "./landing-header";
import { LandingHero } from "./landing-hero";
import { LandingLocation } from "./landing-location";
import { LandingOrganizersCard } from "./landing-organizers-card";
import { LandingReveal } from "./landing-reveal";
import { LandingSchedule } from "./landing-schedule";
import { LandingSponsors } from "./landing-sponsors";

export function LandingPageFeature() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[color:var(--landing-bg)]">
      <LandingAmbientBackground />
      <div className="relative z-10 flex w-full flex-col">
        <LandingHeader />
        <LandingReveal>
          <LandingHero />
        </LandingReveal>
        <LandingReveal delayMs={50}>
          <LandingOrganizersCard />
        </LandingReveal>
        <LandingReveal delayMs={80}>
          <LandingEvents />
        </LandingReveal>
        <LandingReveal delayMs={110}>
          <LandingFeaturedSpeakers />
        </LandingReveal>
        <LandingReveal delayMs={140}>
          <LandingSchedule />
        </LandingReveal>
        <LandingReveal delayMs={170}>
          <LandingSponsors />
        </LandingReveal>
        <LandingReveal delayMs={200}>
          <LandingLocation />
        </LandingReveal>
        <LandingFooter />
      </div>
    </main>
  );
}
