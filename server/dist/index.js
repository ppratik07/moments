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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const uuid_1 = require("uuid");
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const middleware_1 = require("./middleware/middleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8080;
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL, //allowing from frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "token"],
}));
app.use(express_1.default.json());
const prisma = new client_1.PrismaClient();
// S3/R2 Client Configuration
const s3 = new client_s3_1.S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});
//getting the image url and storing it in r2 storage
app.get("/api/get-presign-url", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const fileType = req.query.fileType;
    if (!fileType) {
        return;
    }
    const fileExtension = fileType.split("/")[1];
    const key = `${(0, uuid_1.v4)()}.${fileExtension}`;
    const command = new client_s3_1.PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        ContentType: fileType,
    });
    try {
        const uploadUrl = yield (0, s3_request_presigner_1.getSignedUrl)(s3, command, { expiresIn: 60 }); // 60 sec
        res.json({ uploadUrl, key });
    }
    catch (error) {
        console.error("Error generating presigned URL:", error);
        res.status(500).json({ error: "Could not generate upload URL" });
    }
}));
process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection:", reason);
});
app.delete("/api/delete-image", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { key } = req.query;
    console.log("Key:", key);
    if (!key || typeof key !== "string") {
        res.status(400).json({ error: "Missing or invalid key parameter" });
    }
    try {
        // Step 1: Delete the object from R2
        const deleteCommand = new client_s3_1.DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
        });
        yield s3.send(deleteCommand);
        // Respond with success
        res.status(200).json({ message: "Image deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting image from R2:", error);
        res.status(500).json({ error: "Failed to delete image" });
    }
}));
//Stroring the login inforation
app.post("/api/users", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectName, bookName, dueDate, eventType, eventDescription } = req.body;
    console.log("Received req.userId in /api/users:", req.userId);
    try {
        const userDeatails = yield prisma.loginUser.create({
            data: {
                projectName,
                bookName,
                dueDate: new Date(dueDate),
                eventType,
                eventDescription,
                userId: req.userId || "",
            },
        });
        return res.status(201).json({
            message: "Data saved successfully",
            userId: req.userId,
        });
    }
    catch (error) {
        console.error("Failed to create project:", error);
        res.status(500).json({ error: "Server error" });
    }
}));
//store the user info
app.post("/api/user-information", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    {
        const { firstName, lastName, email } = req.body;
        if (!firstName || !lastName || !email) {
            res.status(400).json({ message: "All fields are required" });
        }
        const user = yield prisma.userInformation.create({
            data: {
                first_name: firstName,
                last_name: lastName,
                email,
            },
        });
        return res.status(200).send({
            message: "User information filled successfully",
        });
    }
}));
//Get the event type and description
app.get("/event-type", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.query;
    if (!name || typeof name !== "string") {
        return res.status(400).json({ error: "Event type name is required" });
    }
    try {
        const eventType = yield prisma.eventType.findUnique({
            where: { name: name },
        });
        if (!eventType) {
            return res.status(404).json({ error: "Event type not found" });
        }
        if (eventType) {
            return res.json({ description: eventType.description });
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
}));
//Fill your information page
app.post("/api/fill-your-info", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, lastName, email, relationship, excludeOnline, notifyMe, } = req.body;
    if (!firstName || !lastName || !email || !relationship) {
        return res.status(400).json({ message: "All fields are required" });
    }
    try {
        const user = yield prisma.fillYourDetails.create({
            data: {
                first_name: firstName,
                last_name: lastName,
                email,
                relationship,
                ExcludeFromOnlineVersion: excludeOnline,
                ExcludeFromPromotion: notifyMe,
            },
        });
        return res.status(200).json({
            message: "User information saved successfully",
            user,
        });
    }
    catch (error) {
        console.error("Error saving user information:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});
