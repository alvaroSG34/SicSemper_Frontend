import dynamic from "next/dynamic";
import type { LandingContent } from "@/domain/landing/landing.types";
import { LandingAmbientBackground } from "./landing-ambient-background";
import { LandingFooter } from "./landing-footer";
import { LandingHeader } from "./landing-header";

const LandingReveal = dynamic(() => import("./landing-reveal").then((module) => module.LandingReveal));
const LandingHero = dynamic(() => import("./landing-hero").then((module) => module.LandingHero));
const LandingOrganizersCard = dynamic(() =>
  import("./landing-organizers-card").then((module) => module.LandingOrganizersCard),
);
const LandingEvents = dynamic(() => import("./landing-events").then((module) => module.LandingEvents));
const LandingFeaturedSpeakers = dynamic(() =>
  import("./landing-featured-speakers").then((module) => module.LandingFeaturedSpeakers),
);
const LandingSchedule = dynamic(() => import("./landing-schedule").then((module) => module.LandingSchedule));
const LandingSponsors = dynamic(() => import("./landing-sponsors").then((module) => module.LandingSponsors));
const LandingLocation = dynamic(() => import("./landing-location").then((module) => module.LandingLocation));

type LandingPageFeatureProps = {
  content: LandingContent;
};

export function LandingPageFeature({ content }: LandingPageFeatureProps) {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[color:var(--landing-bg)]">
      <LandingAmbientBackground />
      <div className="relative z-10 flex w-full flex-col">
        <LandingHeader />
        <LandingReveal>
          <LandingHero content={content} />
        </LandingReveal>
        <LandingReveal delayMs={50}>
          <LandingOrganizersCard content={content} />
        </LandingReveal>
        <LandingReveal delayMs={80}>
          <LandingEvents content={content} />
        </LandingReveal>
        <LandingReveal delayMs={110}>
          <LandingFeaturedSpeakers content={content} />
        </LandingReveal>
        <LandingReveal delayMs={140}>
          <LandingSchedule content={content} />
        </LandingReveal>
        <LandingReveal delayMs={170}>
          <LandingSponsors content={content} />
        </LandingReveal>
        <LandingReveal delayMs={200}>
          <LandingLocation content={content} />
        </LandingReveal>
        <LandingFooter />
      </div>
    </main>
  );
}
