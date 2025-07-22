import { verifyToken } from "@clerk/clerk-sdk-node";
import type { Request, Response, NextFunction } from "express";

// Load env variables (optional if you're already doing it elsewhere)
import dotenv from "dotenv";
dotenv.config({ path: "./server/.env" });

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Missing token" });
    }

    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
      issuer: process.env.CLERK_ISSUER!,
    });

    (req as any).auth = payload;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ message: "Unauthorized" });
  }
}
