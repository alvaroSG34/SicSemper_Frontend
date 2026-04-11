export type LandingModelCard = {
  name: string;
  category: string;
  scale: string;
  image: string;
};

export type LandingEventsCopy = {
  title: string;
  subtitle: string;
  descriptionOne: string;
  descriptionTwo: string;
  image: string;
};

export type LandingTeamMember = {
  name: string;
  role: string;
};

export type LandingFeaturedSpeakersGroup = {
  image: string;
  members: LandingTeamMember[];
};

export type LandingScheduleItem = {
  time: string;
  title: string;
  description: string;
  isActive: boolean;
};

export type LandingSponsors = {
  main: string[];
  secondary: string[];
};

export type LandingLocationCard = {
  icon: 'mapPin' | 'transport' | 'parking';
  iconBackground: string;
  label: string;
  title: string;
  description: string;
};

export type LandingContent = {
  heroDate: string;
  heroTitle: string;
  modelCards: LandingModelCard[];
  eventsCopy: LandingEventsCopy;
  featuredSpeakersGroup: LandingFeaturedSpeakersGroup;
  scheduleItems: LandingScheduleItem[];
  sponsors: LandingSponsors;
  locationCards: LandingLocationCard[];
  locationMapImage: string;
  locationMapUrl: string;
};

export type LandingEditorUserRef = {
  id: string;
  name: string;
};

export type LandingDraftState = {
  draftContent: LandingContent;
  publishedContent: LandingContent;
  draftUpdatedAt: string;
  draftUpdatedBy: LandingEditorUserRef | null;
  publishedAt: string;
  publishedBy: LandingEditorUserRef | null;
  isDraftDirty: boolean;
};

export type LandingAsset = {
  id: string;
  url: string;
  storageKey: string;
  mimetype: string;
  sizeBytes: number;
  originalFilename: string;
  createdAt: string;
  createdBy: LandingEditorUserRef | null;
};
