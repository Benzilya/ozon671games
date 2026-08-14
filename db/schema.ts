import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const assets = sqliteTable("assets", {
  id: text("id").primaryKey(),
  kind: text("kind", { enum: ["image", "audio", "video", "document"] }).notNull(),
  url: text("url").notNull(),
  alt: text("alt"),
  rightsStatus: text("rights_status", { enum: ["unverified", "cleared", "restricted", "expired"] }).notNull().default("unverified"),
  rightsHolder: text("rights_holder"),
  licenseNote: text("license_note"),
  aiDisclosure: text("ai_disclosure", { enum: ["none", "ai-assisted", "ai-generated"] }).notNull().default("none"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [index("assets_kind_idx").on(table.kind), index("assets_rights_idx").on(table.rightsStatus)]);

export const works = sqliteTable("works", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  publicationStatus: text("publication_status", { enum: ["draft", "review", "published", "archived"] }).notNull().default("draft"),
  rightsStatus: text("rights_status", { enum: ["unverified", "cleared", "restricted", "expired"] }).notNull().default("unverified"),
  year: integer("year"),
  durationSeconds: integer("duration_seconds"),
  ageRating: text("age_rating"),
  coverAssetId: text("cover_asset_id").references(() => assets.id, { onDelete: "set null" }),
  heroAssetId: text("hero_asset_id").references(() => assets.id, { onDelete: "set null" }),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [uniqueIndex("works_slug_uidx").on(table.slug), index("works_publication_idx").on(table.publicationStatus)]);

export const workGenres = sqliteTable("work_genres", {
  workId: text("work_id").notNull().references(() => works.id, { onDelete: "cascade" }),
  genre: text("genre").notNull(),
}, (table) => [uniqueIndex("work_genres_uidx").on(table.workId, table.genre), index("work_genres_genre_idx").on(table.genre)]);

export const chapters = sqliteTable("chapters", {
  id: text("id").primaryKey(),
  workId: text("work_id").notNull().references(() => works.id, { onDelete: "cascade" }),
  order: integer("chapter_order").notNull(),
  title: text("title").notNull(),
  publicationStatus: text("publication_status", { enum: ["draft", "review", "published", "archived"] }).notNull().default("draft"),
  audioAssetId: text("audio_asset_id").references(() => assets.id, { onDelete: "set null" }),
  durationSeconds: integer("duration_seconds"),
  transcript: text("transcript"),
  transcriptRightsStatus: text("transcript_rights_status", { enum: ["unverified", "cleared", "restricted", "expired"] }),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [uniqueIndex("chapters_work_order_uidx").on(table.workId, table.order), index("chapters_work_idx").on(table.workId)]);

export const films = sqliteTable("films", {
  id: text("id").primaryKey(),
  workId: text("work_id").references(() => works.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  type: text("type", { enum: ["film", "short", "fan-clip", "making-of", "trailer"] }).notNull(),
  publicationStatus: text("publication_status", { enum: ["draft", "review", "published", "archived"] }).notNull().default("draft"),
  videoAssetId: text("video_asset_id").references(() => assets.id, { onDelete: "set null" }),
  aiDisclosure: text("ai_disclosure", { enum: ["none", "ai-assisted", "ai-generated"] }).notNull().default("none"),
  authorship: text("authorship"),
  fanWork: integer("fan_work", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [index("films_work_idx").on(table.workId), index("films_type_idx").on(table.type)]);

export const characters = sqliteTable("characters", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  publicationStatus: text("publication_status", { enum: ["draft", "review", "published", "archived"] }).notNull().default("draft"),
  canonStatus: text("canon_status", { enum: ["verified", "editorial-placeholder", "alternate"] }).notNull().default("editorial-placeholder"),
  spoilerLevel: integer("spoiler_level").notNull().default(0),
  portraitAssetId: text("portrait_asset_id").references(() => assets.id, { onDelete: "set null" }),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [uniqueIndex("characters_slug_uidx").on(table.slug)]);

export const characterWorks = sqliteTable("character_works", {
  characterId: text("character_id").notNull().references(() => characters.id, { onDelete: "cascade" }),
  workId: text("work_id").notNull().references(() => works.id, { onDelete: "cascade" }),
  relationNote: text("relation_note"),
}, (table) => [uniqueIndex("character_works_uidx").on(table.characterId, table.workId)]);

export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  category: text("category", { enum: ["print", "collector", "poster", "clothing", "accessory", "digital"] }).notNull(),
  publicationStatus: text("publication_status", { enum: ["draft", "review", "published", "archived"] }).notNull().default("draft"),
  priceMinor: integer("price_minor"),
  currency: text("currency"),
  stock: integer("stock"),
  editionSize: integer("edition_size"),
  coverAssetId: text("cover_asset_id").references(() => assets.id, { onDelete: "set null" }),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [uniqueIndex("products_slug_uidx").on(table.slug), index("products_category_idx").on(table.category)]);

export const productVariants = sqliteTable("product_variants", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  stock: integer("stock"),
}, (table) => [index("product_variants_product_idx").on(table.productId)]);

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email"),
  displayName: text("display_name"),
  role: text("role", { enum: ["user", "editor", "moderator", "admin"] }).notNull().default("user"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [uniqueIndex("users_email_uidx").on(table.email)]);

export const favorites = sqliteTable("favorites", {
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  workId: text("work_id").notNull().references(() => works.id, { onDelete: "cascade" }),
  createdAt: text("created_at").notNull(),
}, (table) => [uniqueIndex("favorites_uidx").on(table.userId, table.workId)]);

export const playbackProgress = sqliteTable("playback_progress", {
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  workId: text("work_id").notNull().references(() => works.id, { onDelete: "cascade" }),
  chapterId: text("chapter_id").references(() => chapters.id, { onDelete: "set null" }),
  positionSeconds: integer("position_seconds").notNull().default(0),
  playbackRateMilli: integer("playback_rate_milli").notNull().default(1000),
  updatedAt: text("updated_at").notNull(),
}, (table) => [uniqueIndex("playback_progress_uidx").on(table.userId, table.workId)]);

export const savedMoments = sqliteTable("saved_moments", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  workId: text("work_id").notNull().references(() => works.id, { onDelete: "cascade" }),
  chapterId: text("chapter_id").references(() => chapters.id, { onDelete: "set null" }),
  positionSeconds: integer("position_seconds").notNull(),
  note: text("note"),
  createdAt: text("created_at").notNull(),
}, (table) => [index("saved_moments_user_idx").on(table.userId)]);

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  status: text("status", { enum: ["new", "awaiting-payment", "paid", "packing", "shipped", "completed", "cancelled"] }).notNull().default("new"),
  deliveryProvider: text("delivery_provider"),
  deliveryTracking: text("delivery_tracking"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [index("orders_user_idx").on(table.userId), index("orders_status_idx").on(table.status)]);

export const orderItems = sqliteTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "restrict" }),
  variantId: text("variant_id").references(() => productVariants.id, { onDelete: "set null" }),
  quantity: integer("quantity").notNull(),
  unitPriceMinor: integer("unit_price_minor"),
}, (table) => [index("order_items_order_idx").on(table.orderId)]);

export const events = sqliteTable("events", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  startsAt: text("starts_at"),
  publicationStatus: text("publication_status", { enum: ["draft", "review", "published", "archived"] }).notNull().default("draft"),
  canonStatus: text("canon_status", { enum: ["verified", "editorial-placeholder", "alternate"] }),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const comments = sqliteTable("comments", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  targetType: text("target_type", { enum: ["work", "film", "community-post"] }).notNull(),
  targetId: text("target_id").notNull(),
  body: text("body").notNull(),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).notNull().default("pending"),
  createdAt: text("created_at").notNull(),
}, (table) => [index("comments_target_idx").on(table.targetType, table.targetId), index("comments_status_idx").on(table.status)]);

export const externalLinks = sqliteTable("external_links", {
  id: text("id").primaryKey(),
  label: text("label").notNull(),
  url: text("url").notNull(),
  kind: text("kind", { enum: ["youtube", "telegram", "boosty", "steam", "other"] }).notNull(),
  publicationStatus: text("publication_status", { enum: ["draft", "review", "published", "archived"] }).notNull().default("draft"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});
