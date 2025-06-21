import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { clerkClient } from "@clerk/clerk-sdk-node";
import dotenv from "dotenv";
dotenv.config();

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers["authorization"];
    //console.log("Received auth header:", authHeader);
    const token = authHeader?.split(" ")[1];
    //console.log("Re token", token);

    if (!token) {
      res.status(401).json({ message: "No token provided" });
      return;
    }

    //console.log("Received token:", token);

    const publicKey = process.env.CLERK_JWT_PUBLIC_KEY!;

    if (!publicKey) {
      console.error("Missing CLERK_JWT_PUBLIC_KEY in environment variables");
      res.status(500).json({ message: "Server configuration error" });
      return;
    }

    const formattedKey = publicKey.replace(/\\n/g, "\n");
    //console.log("Formatted public key:", formattedKey);

    const decoded = jwt.verify(token, formattedKey, {
      algorithms: ["RS256"],
    });

    //console.log("Decoded token:", decoded);

    const userId = (decoded as any).sub;
    const expiration = (decoded as any).exp;
    //console.log("User ID from token:", userId);

    if (expiration) {
      const expirationDate = new Date(expiration * 1000);
      //console.log("Token expiration date:", expirationDate);
    }

    if (!userId) {
      //console.error("No user ID in token payload");
      res.status(403).json({ message: "Invalid token payload" });
      return;
    }

    // Set userId on the request object
    req.userId = userId;
    //console.log("Set req.userId:", req.userId);

    next();
  } catch (error) {
    console.error("Error in authMiddleware:", error);
    res.status(403).json({
      message: "Error while decoding",
    });
  }
}
