import { LandingEvents } from "./landing-events";
import { LandingFeaturedSpeakers } from "./landing-featured-speakers";
import { LandingFooter } from "./landing-footer";
import { LandingHeader } from "./landing-header";
import { LandingHero } from "./landing-hero";
import { LandingLocation } from "./landing-location";
import { LandingSchedule } from "./landing-schedule";
import { LandingSpeakerCards } from "./landing-speaker-cards";
import { LandingSponsors } from "./landing-sponsors";

export function LandingPageFeature() {
  return (
    <main className="min-h-screen w-full bg-black">
      <div className="mx-auto flex w-full max-w-[1686px] flex-col overflow-hidden">
        <LandingHeader />
        <LandingHero />
        <LandingSpeakerCards />
        <LandingEvents />
        <LandingFeaturedSpeakers />
        <LandingSchedule />
        <LandingSponsors />
        <LandingLocation />
        <LandingFooter />
      </div>
    </main>
  );
}
