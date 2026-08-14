export type PublicationStatus = "draft" | "review" | "published" | "archived";
export type RightsStatus = "unverified" | "cleared" | "restricted" | "expired";
export type AiDisclosure = "none" | "ai-assisted" | "ai-generated";

export type CmsAsset = {
  id: string;
  kind: "image" | "audio" | "video" | "document";
  url: string;
  alt?: string;
  rightsStatus: RightsStatus;
  rightsHolder?: string;
  licenseNote?: string;
  aiDisclosure: AiDisclosure;
};

export type CmsWork = {
  id: string;
  slug: string;
  title: string;
  description: string;
  genres: string[];
  publicationStatus: PublicationStatus;
  rightsStatus: RightsStatus;
  year?: number;
  durationSeconds?: number;
  ageRating?: string;
  coverAssetId?: string;
  heroAssetId?: string;
};

export type CmsChapter = {
  id: string;
  workId: string;
  order: number;
  title: string;
  publicationStatus: PublicationStatus;
  audioAssetId?: string;
  durationSeconds?: number;
  transcript?: string;
  transcriptRightsStatus?: RightsStatus;
};

export type CmsFilm = {
  id: string;
  workId?: string;
  title: string;
  type: "film" | "short" | "fan-clip" | "making-of" | "trailer";
  publicationStatus: PublicationStatus;
  videoAssetId?: string;
  aiDisclosure: AiDisclosure;
  authorship?: string;
  fanWork: boolean;
};

export type CmsCharacter = {
  id: string;
  slug: string;
  name: string;
  description: string;
  publicationStatus: PublicationStatus;
  canonStatus: "verified" | "editorial-placeholder" | "alternate";
  spoilerLevel: 0 | 1 | 2 | 3;
};

export type CmsProduct = {
  id: string;
  slug: string;
  title: string;
  category: "print" | "collector" | "poster" | "clothing" | "accessory" | "digital";
  publicationStatus: PublicationStatus;
  priceMinor?: number;
  currency?: string;
  stock?: number;
  editionSize?: number;
  variants: Array<{ id: string; title: string; stock?: number }>;
};

export type CmsOrder = {
  id: string;
  status: "new" | "awaiting-payment" | "paid" | "packing" | "shipped" | "completed" | "cancelled";
  createdAt: string;
  items: Array<{ productId: string; variantId: string; quantity: number; unitPriceMinor?: number }>;
  deliveryProvider?: string;
  deliveryTracking?: string;
};

export type CmsEvent = {
  id: string;
  title: string;
  startsAt?: string;
  publicationStatus: PublicationStatus;
  canonStatus?: "verified" | "editorial-placeholder" | "alternate";
};

export type CmsComment = {
  id: string;
  targetType: "work" | "film" | "community-post";
  targetId: string;
  body: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

export type CmsExternalLink = {
  id: string;
  label: string;
  url: string;
  kind: "youtube" | "telegram" | "boosty" | "steam" | "other";
  publicationStatus: PublicationStatus;
};

export type CmsSnapshot = {
  works: CmsWork[];
  chapters: CmsChapter[];
  films: CmsFilm[];
  characters: CmsCharacter[];
  products: CmsProduct[];
  orders: CmsOrder[];
  events: CmsEvent[];
  comments: CmsComment[];
  links: CmsExternalLink[];
  assets: CmsAsset[];
};

export const canPublishAsset = (asset: CmsAsset) => asset.rightsStatus === "cleared";
export const requiresAiLabel = (asset: CmsAsset) => asset.aiDisclosure !== "none";
export const canPublishTranscript = (chapter: CmsChapter) => chapter.transcriptRightsStatus === "cleared";
