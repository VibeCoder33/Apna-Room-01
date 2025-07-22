import express from "express";
import cors from "cors";
import { requireAuth } from "./middleware/clerkAuth"; // or adjust path if needed

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 🔐 Protected route
app.get("/api/protected", requireAuth, (req, res) => {
  res.json({ message: "You are authenticated!" });
});

// 🟢 Public route (no auth)
app.get("/", (req, res) => {
  res.send("API is running");
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

// import type { Express } from "express";
// import { createServer, type Server } from "http";
// import { WebSocketServer, WebSocket } from "ws";
// import { storage } from "./storage";
// import { requireAuth } from "./middleware/clerkAuth"; // adjust path if needed

// import {
//   insertListingSchema,
//   insertApplicationSchema,
//   insertMessageSchema,
//   insertReviewSchema,
// } from "@shared/schema";

// const app = express();

// app.get("/api/protected", requireAuth, (req, res) => {
//   res.json({ message: "You are authenticated!" });
// });

// export async function registerRoutes(app: Express): Promise<Server> {
//   // Auth middleware
//   // await setupAuth(app);

//   // Auth routes
//   app.get("/api/auth/user", requireAuth, async (req: any, res) => {
//     try {
//       const userId = req.user.claims.sub;
//       const user = await storage.getUser(userId);
//       res.json(user);
//     } catch (error) {
//       console.error("Error fetching user:", error);
//       res.status(500).json({ message: "Failed to fetch user" });
//     }
//   });

//   // User profile routes
//   app.patch("/api/users/profile", requireAuth, async (req: any, res) => {
//     try {
//       const userId = req.user.claims.sub;
//       const { role } = req.body;

//       const updatedUser = await storage.upsertUser({
//         id: userId,
//         email: req.user.claims.email,
//         firstName: req.user.claims.first_name,
//         lastName: req.user.claims.last_name,
//         profileImageUrl: req.user.claims.profile_image_url,
//         role: role || "SEEKER",
//       });

//       res.json(updatedUser);
//     } catch (error) {
//       console.error("Error updating user profile:", error);
//       res.status(500).json({ message: "Failed to update profile" });
//     }
//   });

//   // Listing routes
//   app.get("/api/listings", async (req, res) => {
//     try {
//       const { search, minRent, maxRent, location, roomType } = req.query;

//       const filters = {
//         search: search as string,
//         minRent: minRent ? parseInt(minRent as string) : undefined,
//         maxRent: maxRent ? parseInt(maxRent as string) : undefined,
//         location: location as string,
//         roomType: roomType as string,
//       };

//       const listings = await storage.getListings(filters);
//       res.json(listings);
//     } catch (error) {
//       console.error("Error fetching listings:", error);
//       res.status(500).json({ message: "Failed to fetch listings" });
//     }
//   });

//   app.get("/api/listings/:id", async (req, res) => {
//     try {
//       const id = parseInt(req.params.id);
//       const listing = await storage.getListing(id);

//       if (!listing) {
//         return res.status(404).json({ message: "Listing not found" });
//       }

//       res.json(listing);
//     } catch (error) {
//       console.error("Error fetching listing:", error);
//       res.status(500).json({ message: "Failed to fetch listing" });
//     }
//   });

//   app.post("/api/listings", requireAuth, async (req: any, res) => {
//     try {
//       const userId = req.user.claims.sub;
//       const validatedData = insertListingSchema.parse(req.body);

//       const listing = await storage.createListing({
//         ...validatedData,
//         ownerId: userId,
//       });

//       res.status(201).json(listing);
//     } catch (error) {
//       console.error("Error creating listing:", error);
//       res.status(500).json({ message: "Failed to create listing" });
//     }
//   });

//   app.patch("/api/listings/:id", requireAuth, async (req: any, res) => {
//     try {
//       const userId = req.user.claims.sub;
//       const id = parseInt(req.params.id);
//       const updates = req.body;

//       // Verify ownership
//       const existing = await storage.getListing(id);
//       if (!existing || existing.ownerId !== userId) {
//         return res.status(403).json({ message: "Not authorized" });
//       }

//       const updated = await storage.updateListing(id, updates);
//       res.json(updated);
//     } catch (error) {
//       console.error("Error updating listing:", error);
//       res.status(500).json({ message: "Failed to update listing" });
//     }
//   });

//   app.delete("/api/listings/:id", requireAuth, async (req: any, res) => {
//     try {
//       const userId = req.user.claims.sub;
//       const id = parseInt(req.params.id);

//       const success = await storage.deleteListing(id, userId);
//       if (!success) {
//         return res
//           .status(403)
//           .json({ message: "Not authorized or listing not found" });
//       }

//       res.json({ message: "Listing deleted" });
//     } catch (error) {
//       console.error("Error deleting listing:", error);
//       res.status(500).json({ message: "Failed to delete listing" });
//     }
//   });

//   app.get("/api/users/:userId/listings", async (req, res) => {
//     try {
//       const ownerId = req.params.userId;
//       const listings = await storage.getListings({ ownerId });
//       res.json(listings);
//     } catch (error) {
//       console.error("Error fetching user listings:", error);
//       res.status(500).json({ message: "Failed to fetch user listings" });
//     }
//   });

//   // Application routes
//   app.post("/api/applications", requireAuth, async (req: any, res) => {
//     try {
//       const userId = req.user.claims.sub;
//       const validatedData = insertApplicationSchema.parse(req.body);

//       const application = await storage.createApplication({
//         ...validatedData,
//         seekerId: userId,
//       });

//       res.status(201).json(application);
//     } catch (error) {
//       console.error("Error creating application:", error);
//       res.status(500).json({ message: "Failed to create application" });
//     }
//   });

//   app.patch(
//     "/api/applications/:id/status",
//     requireAuth,
//     async (req: any, res) => {
//       try {
//         const userId = req.user.claims.sub;
//         const id = parseInt(req.params.id);
//         const { status } = req.body;

//         // Verify that user owns the listing for this application
//         const application = await storage.getApplication(id);
//         if (!application) {
//           return res.status(404).json({ message: "Application not found" });
//         }

//         const listing = await storage.getListing(application.listingId);
//         if (!listing || listing.ownerId !== userId) {
//           return res.status(403).json({ message: "Not authorized" });
//         }

//         const updated = await storage.updateApplicationStatus(id, status);
//         res.json(updated);
//       } catch (error) {
//         console.error("Error updating application status:", error);
//         res
//           .status(500)
//           .json({ message: "Failed to update application status" });
//       }
//     }
//   );

//   app.get("/api/applications/sent", requireAuth, async (req: any, res) => {
//     try {
//       const userId = req.user.claims.sub;
//       const applications = await storage.getApplicationsForSeeker(userId);
//       res.json(applications);
//     } catch (error) {
//       console.error("Error fetching sent applications:", error);
//       res.status(500).json({ message: "Failed to fetch applications" });
//     }
//   });

//   app.get("/api/applications/received", requireAuth, async (req: any, res) => {
//     try {
//       const userId = req.user.claims.sub;
//       const applications = await storage.getApplicationsForOwner(userId);
//       res.json(applications);
//     } catch (error) {
//       console.error("Error fetching received applications:", error);
//       res.status(500).json({ message: "Failed to fetch applications" });
//     }
//   });

//   // Message routes
//   app.get("/api/messages/:chatId", requireAuth, async (req: any, res) => {
//     try {
//       const userId = req.user.claims.sub;
//       const chatId = req.params.chatId;

//       // Verify user is part of this chat
//       if (!chatId.includes(userId)) {
//         return res.status(403).json({ message: "Not authorized" });
//       }

//       const messages = await storage.getMessages(chatId);
//       res.json(messages);
//     } catch (error) {
//       console.error("Error fetching messages:", error);
//       res.status(500).json({ message: "Failed to fetch messages" });
//     }
//   });

//   app.post("/api/messages", requireAuth, async (req: any, res) => {
//     try {
//       const userId = req.user.claims.sub;
//       const validatedData = insertMessageSchema.parse(req.body);

//       // Verify user is part of this chat
//       if (!validatedData.chatId.includes(userId)) {
//         return res.status(403).json({ message: "Not authorized" });
//       }

//       const message = await storage.createMessage({
//         ...validatedData,
//         senderId: userId,
//       });

//       res.status(201).json(message);
//     } catch (error) {
//       console.error("Error creating message:", error);
//       res.status(500).json({ message: "Failed to send message" });
//     }
//   });

//   // Review routes
//   app.post("/api/reviews", requireAuth, async (req: any, res) => {
//     try {
//       const userId = req.user.claims.sub;
//       const validatedData = insertReviewSchema.parse(req.body);

//       const review = await storage.createReview({
//         ...validatedData,
//         authorId: userId,
//       });

//       res.status(201).json(review);
//     } catch (error) {
//       console.error("Error creating review:", error);
//       res.status(500).json({ message: "Failed to create review" });
//     }
//   });

//   app.get("/api/users/:userId/reviews", async (req, res) => {
//     try {
//       const userId = req.params.userId;
//       const reviews = await storage.getReviewsForUser(userId);
//       res.json(reviews);
//     } catch (error) {
//       console.error("Error fetching user reviews:", error);
//       res.status(500).json({ message: "Failed to fetch reviews" });
//     }
//   });

//   const httpServer = createServer(app);

//   // WebSocket setup for real-time chat
//   const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

//   wss.on("connection", (ws: WebSocket, req) => {
//     console.log("WebSocket connection established");

//     ws.on("message", (data) => {
//       try {
//         const message = JSON.parse(data.toString());

//         // Broadcast message to all clients in the same chat
//         wss.clients.forEach((client) => {
//           if (client !== ws && client.readyState === WebSocket.OPEN) {
//             client.send(JSON.stringify(message));
//           }
//         });
//       } catch (error) {
//         console.error("Error handling WebSocket message:", error);
//       }
//     });

//     ws.on("close", () => {
//       console.log("WebSocket connection closed");
//     });
//   });

//   return httpServer;
// }
