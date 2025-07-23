import {
  users,
  listings,
  applications,
  messages,
  reviews,
  type User,
  type UpsertUser,
  type Listing,
  type InsertListing,
  type Application,
  type InsertApplication,
  type Message,
  type InsertMessage,
  type Review,
  type InsertReview,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, ilike, gte, lte, or } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Listing operations
  createListing(listing: InsertListing & { ownerId: string }): Promise<Listing>;
  updateListing(
    id: number,
    updates: Partial<InsertListing>
  ): Promise<Listing | undefined>;
  deleteListing(id: number, ownerId: string): Promise<boolean>;
  getListing(id: number): Promise<Listing | undefined>;
  getListings(filters?: {
    search?: string;
    minRent?: number;
    maxRent?: number;
    location?: string;
    roomType?: string;
    ownerId?: string;
  }): Promise<Listing[]>;

  // Application operations
  createApplication(
    application: InsertApplication & { seekerId: string }
  ): Promise<Application>;
  updateApplicationStatus(
    id: number,
    status: "PENDING" | "ACCEPTED" | "REJECTED"
  ): Promise<Application | undefined>;
  getApplication(id: number): Promise<Application | undefined>;
  getApplicationsForListing(listingId: number): Promise<Application[]>;
  getApplicationsForSeeker(seekerId: string): Promise<Application[]>;
  getApplicationsForOwner(ownerId: string): Promise<Application[]>;

  // Message operations
  createMessage(
    message: InsertMessage & { senderId: string }
  ): Promise<Message>;
  getMessages(chatId: string): Promise<Message[]>;
  getChatId(userId1: string, userId2: string): string;

  // Review operations
  createReview(review: InsertReview & { authorId: string }): Promise<Review>;
  getReviewsForUser(userId: string): Promise<Review[]>;
  getReviewsForListing(listingId: number): Promise<Review[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser & { id?: string }): Promise<User> {
    if (userData.id) {
      // Update existing user
      const [user] = await db
        .insert(users)
        .values({ id: userData.id, ...userData })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            ...userData,
            updatedAt: new Date(),
          },
        })
        .returning();
      return user;
    } else {
      // This shouldn't happen in our auth flow, but handle it gracefully
      throw new Error("User ID is required for upsert operation");
    }
  }

  // Listing operations
  async createListing(
    listing: InsertListing & { ownerId: string }
  ): Promise<Listing> {
    const [newListing] = await db.insert(listings).values(listing).returning();
    return newListing;
  }

  async updateListing(
    id: number,
    updates: Partial<InsertListing>
  ): Promise<Listing | undefined> {
    const [updated] = await db
      .update(listings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(listings.id, id))
      .returning();
    return updated;
  }

  async deleteListing(id: number, ownerId: string): Promise<boolean> {
    const result = await db
      .delete(listings)
      .where(and(eq(listings.id, id), eq(listings.ownerId, ownerId)));
    return (result.rowCount ?? 0) > 0;
  }

  async getListing(id: number): Promise<Listing | undefined> {
    const [listing] = await db
      .select()
      .from(listings)
      .where(eq(listings.id, id));
    return listing;
  }

  async getListings(filters?: {
    search?: string;
    minRent?: number;
    maxRent?: number;
    location?: string;
    roomType?: string;
    ownerId?: string;
  }): Promise<Listing[]> {
    let query = db.select().from(listings);

    const conditions = [];

    if (filters?.search) {
      conditions.push(
        or(
          ilike(listings.title, `%${filters.search}%`),
          ilike(listings.description, `%${filters.search}%`),
          ilike(listings.location, `%${filters.search}%`)
        )
      );
    }

    if (filters?.minRent) {
      conditions.push(gte(listings.rent, filters.minRent));
    }

    if (filters?.maxRent) {
      conditions.push(lte(listings.rent, filters.maxRent));
    }

    if (filters?.location) {
      conditions.push(ilike(listings.location, `%${filters.location}%`));
    }

    if (filters?.roomType) {
      conditions.push(eq(listings.roomType, filters.roomType));
    }

    if (filters?.ownerId) {
      conditions.push(eq(listings.ownerId, filters.ownerId));
    } else {
      conditions.push(eq(listings.available, true));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(listings.createdAt));
  }

  // Application operations
  async createApplication(
    application: InsertApplication & { seekerId: string }
  ): Promise<Application> {
    const [newApplication] = await db
      .insert(applications)
      .values(application)
      .returning();
    return newApplication;
  }

  async updateApplicationStatus(
    id: number,
    status: "PENDING" | "ACCEPTED" | "REJECTED"
  ): Promise<Application | undefined> {
    const [updated] = await db
      .update(applications)
      .set({ status })
      .where(eq(applications.id, id))
      .returning();
    return updated;
  }

  async getApplication(id: number): Promise<Application | undefined> {
    const [application] = await db
      .select()
      .from(applications)
      .where(eq(applications.id, id));
    return application;
  }

  async getApplicationsForListing(listingId: number): Promise<Application[]> {
    return await db
      .select()
      .from(applications)
      .where(eq(applications.listingId, listingId))
      .orderBy(desc(applications.createdAt));
  }

  async getApplicationsForSeeker(seekerId: string): Promise<Application[]> {
    return await db
      .select()
      .from(applications)
      .where(eq(applications.seekerId, seekerId))
      .orderBy(desc(applications.createdAt));
  }

  async getApplicationsForOwner(ownerId: string): Promise<Application[]> {
    return await db
      .select({
        id: applications.id,
        seekerId: applications.seekerId,
        listingId: applications.listingId,
        message: applications.message,
        status: applications.status,
        createdAt: applications.createdAt,
      })
      .from(applications)
      .innerJoin(listings, eq(applications.listingId, listings.id))
      .where(eq(listings.ownerId, ownerId))
      .orderBy(desc(applications.createdAt));
  }

  // Message operations
  async createMessage(
    message: InsertMessage & { senderId: string }
  ): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async getMessages(chatId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.chatId, chatId))
      .orderBy(asc(messages.createdAt));
  }

  getChatId(userId1: string, userId2: string): string {
    // Create deterministic chat ID by sorting user IDs
    const [id1, id2] = [userId1, userId2].sort();
    return `${id1}_${id2}`;
  }

  // Review operations
  async createReview(
    review: InsertReview & { authorId: string }
  ): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  async getReviewsForUser(userId: string): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.targetId, userId))
      .orderBy(desc(reviews.createdAt));
  }

  async getReviewsForListing(listingId: number): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.listingId, listingId))
      .orderBy(desc(reviews.createdAt));
  }
}

export const storage = new DatabaseStorage();
