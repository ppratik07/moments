import type { NextFunction, Request, Response } from "express";
import { clerkClient } from "@clerk/clerk-sdk-node";
import type { NextFunction, Request, Response } from "express";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Use Clerk SDK to verify the token. This abstracts JWK handling and works for Google OAuth as well.
    const verification = await clerkClient.verifyToken(token);
    if (!verification?.payload?.sub) {
      return res.status(403).json({ message: "Invalid token payload" });
    }

    // Attach the Clerk user ID to the request for downstream handlers.
    (req as any).userId = verification.payload.sub;
    next();
  } catch (error) {
    console.error("Error in authMiddleware:", error);
    res.status(403).json({ message: "Error while verifying token" });
  }
}
