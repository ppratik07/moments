"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function authMiddleware(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const authHeader = req.headers["authorization"];
            //console.log("Received auth header:", authHeader);
            const token = authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(" ")[1];
            //console.log("Re token", token);
            if (!token) {
                res.status(401).json({ message: "No token provided" });
                return;
            }
            //console.log("Received token:", token);
            const publicKey = process.env.CLERK_JWT_PUBLIC_KEY;
            if (!publicKey) {
                console.error("Missing CLERK_JWT_PUBLIC_KEY in environment variables");
                res.status(500).json({ message: "Server configuration error" });
                return;
            }
            const formattedKey = publicKey.replace(/\\n/g, "\n");
            //console.log("Formatted public key:", formattedKey);
            const decoded = jsonwebtoken_1.default.verify(token, formattedKey, {
                algorithms: ["RS256"],
            });
            //console.log("Decoded token:", decoded);
            const userId = decoded.sub;
            const expiration = decoded.exp;
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
        }
        catch (error) {
            console.error("Error in authMiddleware:", error);
            res.status(403).json({
                message: "Error while decoding",
            });
        }
    });
}
