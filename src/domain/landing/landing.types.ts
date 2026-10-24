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

export type LandingSponsor = {
  name: string;
  logoUrl: string;
  url: string;
};

export type LandingSponsors = {
  main: LandingSponsor[];
  secondary: LandingSponsor[];
};

export type LandingBranding = {
  logoUrl: string;
  faviconUrl: string;
};

export type LandingLocationCard = {
  icon: 'mapPin' | 'transport' | 'parking';
  iconBackground: string;
  label: string;
  title: string;
  description: string;
};

export type LandingEventCard = {
  id: string;
  label: string;
  title: string;
  summary: string;
  startDate: string | null;
  endDate: string | null;
  place: string | null;
  format: string | null;
  coverImageUrl: string | null;
};

export type LandingEventHighlight = {
  id: string;
  name: string;
  role: string;
  imageUrl: string | null;
  position: number;
};

export type LandingEventGalleryItem = {
  id: string;
  imageUrl: string;
  altText: string;
  caption: string | null;
  position: number;
};

export type LandingEvent = LandingEventCard & {
  storyTitle: string | null;
  storyParagraphs: string[];
  visible: boolean;
  highlights: LandingEventHighlight[];
  gallery: LandingEventGalleryItem[];
  createdAt: string;
  updatedAt: string;
};

export type LandingEventHighlightInput = {
  name: string;
  role: string;
  imageUrl?: string | null;
};

export type LandingEventGalleryInput = {
  imageUrl: string;
  altText: string;
  caption?: string | null;
};

export type LandingEventDraftInput = {
  label: string;
  title: string;
  summary: string;
  startDate?: string | null;
  endDate?: string | null;
  place?: string | null;
  format?: string | null;
  coverImageUrl?: string | null;
  storyTitle?: string | null;
  storyParagraphs: string[];
  highlights: LandingEventHighlightInput[];
  gallery: LandingEventGalleryInput[];
};

export type LandingContent = {
  branding: LandingBranding;
  contactEmail: string;
  whatsappNumber: string;
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
  eventsSectionVisible: boolean;
  pastEvents: LandingEventCard[];
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
