import { pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  googleId: text("google_id").notNull().unique(),
  encryptedRefreshToken: text("encrypted_refresh_token").notNull(),
  name: text("name"),
  picture: text("picture"),
  givenName: text("given_name"),
  familyName: text("family_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const refreshTokens = pgTable("refresh_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  tokenHash: text("token_hash").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  revoked: boolean("revoked").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const scans = pgTable("scans", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  foodName: text("food_name").notNull(),
  nutritionJson: text("nutrition_json").notNull(), 
  imageHash: text("image_hash"), 
  imageUrl: text("image_url"), 
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const images = pgTable("images", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  fileId: text("file_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contactLogs = pgTable("contact_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  ip: text("ip").notNull(),
  type: text("type").notNull(),
  name: text("name").notNull(),
  surname: text("surname"),
  email: text("email").notNull(),
  telegram: text("telegram"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const medicalRecords = pgTable("medical_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  extractedText: text("extracted_text").notNull(),
  summary: text("summary"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const healthContext = pgTable("health_context", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  allergies: text("allergies").array(),
  conditions: text("conditions").array(),
  medications: text("medications").array(),
  additionalNotes: text("additional_notes"),
  gender: text("gender").default("male"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
