import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { enum: ["SEEKER", "OWNER"] }).notNull().default("SEEKER"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const listings = pgTable("listings", {
  id: serial("id").primaryKey(),
  ownerId: varchar("owner_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  rent: integer("rent").notNull(),
  currency: varchar("currency", { length: 10 }).notNull().default("INR"),
  location: varchar("location", { length: 255 }).notNull(),
  roomType: varchar("room_type", { length: 100 }),
  available: boolean("available").notNull().default(true),
  images: text("images").array().notNull().default([]),
  amenities: text("amenities").array().notNull().default([]),
  preferences: text("preferences").array().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  seekerId: varchar("seeker_id").notNull(),
  listingId: integer("listing_id").notNull(),
  message: text("message"),
  status: varchar("status", { enum: ["PENDING", "ACCEPTED", "REJECTED"] }).notNull().default("PENDING"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  chatId: varchar("chat_id").notNull(),
  senderId: varchar("sender_id").notNull(),
  receiverId: varchar("receiver_id").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  authorId: varchar("author_id").notNull(),
  targetId: varchar("target_id").notNull(),
  listingId: integer("listing_id"),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  listings: many(listings),
  applications: many(applications),
  sentMessages: many(messages, { relationName: "sentMessages" }),
  receivedMessages: many(messages, { relationName: "receivedMessages" }),
  reviewsMade: many(reviews, { relationName: "reviewsMade" }),
  reviewsReceived: many(reviews, { relationName: "reviewsReceived" }),
}));

export const listingsRelations = relations(listings, ({ one, many }) => ({
  owner: one(users, {
    fields: [listings.ownerId],
    references: [users.id],
  }),
  applications: many(applications),
  reviews: many(reviews),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  seeker: one(users, {
    fields: [applications.seekerId],
    references: [users.id],
  }),
  listing: one(listings, {
    fields: [applications.listingId],
    references: [listings.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sentMessages",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receivedMessages",
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  author: one(users, {
    fields: [reviews.authorId],
    references: [users.id],
    relationName: "reviewsMade",
  }),
  target: one(users, {
    fields: [reviews.targetId],
    references: [users.id],
    relationName: "reviewsReceived",
  }),
  listing: one(listings, {
    fields: [reviews.listingId],
    references: [listings.id],
  }),
}));

// Schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertListingSchema = createInsertSchema(listings).omit({
  id: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  seekerId: true,
  status: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  senderId: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  authorId: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertListing = z.infer<typeof insertListingSchema>;
export type Listing = typeof listings.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;
