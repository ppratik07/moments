import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return res.status(403).json({
            message: "No token provided"
        });
    }
    try {
        const secretKey = process.env.AUTH_JWT_KEY;
        if (!secretKey) {
            return res.status(500).json({
                message: "AUTH_JWT_KEY is not defined"
            });
        }
        const decoded = jwt.verify(token, secretKey, { algorithms: ["RS256"] });
     if(decoded?.sub){
        next();
        req.userId = decoded?.sub as string;
     }
    } catch (error) {
        res.status(403).json({
            message: "Error while decoding"
        });
    }
}