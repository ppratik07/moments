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
const request_1 = __importDefault(require("request"));
const stripe_1 = __importDefault(require("stripe"));
const axios_1 = __importDefault(require("axios"));
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const generateBookHtml_1 = require("./services/generateBookHtml");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8080;
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
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
if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not defined in the environment variables");
}
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
const razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
function stripQueryParams(url) {
    const index = url.indexOf('?');
    return index !== -1 ? url.substring(0, index) : url;
}
// Existing Endpoints (unchanged)
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
app.post("/api/users", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectName, bookName, dueDate, eventType, eventDescription } = req.body;
    try {
        const userDetails = yield prisma.loginUser.create({
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
            projectId: userDetails.id,
        });
    }
    catch (error) {
        console.error("Failed to create project:", error);
        res.status(500).json({ error: "Server error" });
    }
}));
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
        const uploadUrl = yield (0, s3_request_presigner_1.getSignedUrl)(s3, command, { expiresIn: 60 });
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
    if (!key || typeof key !== "string") {
        res.status(400).json({ error: "Missing or invalid key parameter" });
    }
    try {
        const deleteCommand = new client_s3_1.DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
        });
        yield s3.send(deleteCommand);
        res.status(200).json({ message: "Image deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting image from R2:", error);
        res.status(500).json({ error: "Failed to delete image" });
    }
}));
app.get("/api/user-projects", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }
        const projects = yield prisma.loginUser.findMany({
            where: { userId },
            select: {
                id: true,
                projectName: true,
                bookName: true,
                createdAt: true,
                eventType: true,
                eventDescription: true,
                imageKey: true,
                uploadUrl: true,
            },
        });
        return res.status(200).json({ projects });
    }
    catch (error) {
        console.error("Error fetching user projects:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
app.get('/api/user-projects/:projectId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.params;
    if (!projectId || typeof projectId !== 'string') {
        return res.status(400).json({ message: 'Invalid projectId' });
    }
    try {
        const project = yield prisma.loginUser.findUnique({
            where: { id: projectId },
            select: {
                id: true,
                projectName: true,
                bookName: true,
                createdAt: true,
                eventType: true,
                eventDescription: true,
                imageKey: true,
                uploadUrl: true,
            },
        });
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        return res.status(200).json({ project });
    }
    catch (error) {
        console.error('Error fetching user projects:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
app.patch("/api/users/:projectId/upload-image", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.params;
    const { imageKey, uploadUrl } = req.body;
    if (!imageKey || !uploadUrl) {
        return res.status(400).json({ error: "Missing imageKey or uploadUrl" });
    }
    try {
        const updatedProject = yield prisma.loginUser.update({
            where: { id: projectId },
            data: {
                imageKey,
                uploadUrl,
            },
        });
        res.json({
            message: "Image updated successfully",
            project: updatedProject,
        });
    }
    catch (error) {
        console.error("Failed to update image info:", error);
        res.status(500).json({ error: "Server error" });
    }
}));
app.post("/api/user-information", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
}));
app.post("/api/save-contribution", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { projectId, signature, pages, fillYourDetailsId } = req.body;
        if (!projectId || !signature || !pages) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        if (fillYourDetailsId) {
            const fillYourDetails = yield prisma.fillYourDetails.findUnique({
                where: { id: fillYourDetailsId },
            });
            if (!fillYourDetails) {
                return res.status(400).json({ error: "FillYourDetails record not found" });
            }
        }
        for (const page of pages) {
            if (page.layoutId < 0) {
                return res.status(400).json({ error: "Invalid layoutId" });
            }
            if (!Array.isArray(page.images) ||
                page.images.some((img) => img !== null && typeof img !== "string")) {
                return res.status(400).json({ error: "Invalid images array" });
            }
        }
        const contribution = yield prisma.contribution.create({
            data: {
                projectId,
                signature,
                fillYourDetailsId, // Optional, may be null
                pages: {
                    create: pages.map((page) => ({
                        guid: page.guid,
                        layoutId: page.layoutId,
                        images: page.images.map(stripQueryParams),
                        message: page.message,
                        components: {
                            create: page.components.map((component) => {
                                const cleanedImageUrl = component.image_url ? stripQueryParams(component.image_url) : component.image_url;
                                return {
                                    type: component.type,
                                    position: component.position || null,
                                    size: component.size,
                                    styles: component.styles || null,
                                    editor: component.editor || null,
                                    value: component.value,
                                    imageUrl: cleanedImageUrl,
                                    original: component.original || null,
                                };
                            }),
                        },
                    })),
                },
            },
        });
        res.status(200).json({
            message: "Contribution saved successfully",
            contributionId: contribution.id,
        });
    }
    catch (error) {
        console.error("Error saving contribution:", error);
        res.status(500).json({ error: "Failed to save contribution" });
    }
    finally {
        yield prisma.$disconnect();
    }
}));
app.post("/api/submit-information", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, lastName, email, relationship, excludeOnline, notifyMe, projectId } = req.body;
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
                projectId
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
app.get("/contributions/count/:projectId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.params;
    try {
        const count = yield prisma.contribution.count({
            where: { projectId },
        });
        res.json({ projectId, count });
    }
    catch (error) {
        console.error("Error getting contribution count:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
app.get("/api/deadline/:projectId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { projectId } = req.params;
    if (!projectId || typeof projectId !== "string") {
        return res.status(400).json({ message: "Invalid projectId" });
    }
    try {
        const deadline = yield prisma.contributionDeadlines.findFirst({
            where: {
                projectId,
                deadline_enabled: true,
            },
            select: {
                actual_deadline: true,
                calculate_date: true,
                deadline_enabled: true,
            },
        });
        if (!deadline) {
            return res
                .status(404)
                .json({ message: "No active deadline found for this project" });
        }
        const deadlineDate = (_a = deadline.actual_deadline) !== null && _a !== void 0 ? _a : deadline.calculate_date;
        return res.status(200).json({
            deadline: deadlineDate ? deadlineDate.toISOString() : null,
            deadline_enabled: deadline.deadline_enabled,
        });
    }
    catch (error) {
        console.error("Error fetching deadline:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}));
app.get("/api/lastcontribution/:projectId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.params;
    if (!projectId || typeof projectId !== "string") {
        return res.status(400).json({ message: "Invalid projectId" });
    }
    try {
        const lastContribution = yield prisma.contribution.findFirst({
            where: { projectId },
            orderBy: { createdAt: "desc" },
            take: 1,
        });
        if (!lastContribution) {
            return res.status(404).json({ message: "No contributions found" });
        }
        return res.status(200).json({
            lastContributionDate: lastContribution.createdAt.toISOString(),
        });
    }
    catch (error) {
        console.error("Error fetching last contribution:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}));
app.post("/api/feedback", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId, content } = req.body;
    if (!projectId ||
        !content ||
        typeof projectId !== "string" ||
        typeof content !== "string") {
        return res.status(400).json({ message: "Invalid projectId or content" });
    }
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const feedback = yield prisma.feedback.create({
            data: {
                userId,
                projectId,
                content,
            },
        });
        return res
            .status(201)
            .json({ message: "Feedback submitted successfully", feedback });
    }
    catch (error) {
        console.error("Error saving feedback:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}));
app.get("/api/project-status/:projectId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.params;
    if (!projectId || typeof projectId !== "string") {
        return res.status(400).json({ message: "Invalid projectId" });
    }
    try {
        const order = yield prisma.order.findFirst({
            where: { projectId },
        });
        const status = order ? "printing" : "gathering";
        return res.status(200).json({ status });
    }
    catch (error) {
        console.error("Error fetching project status:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}));
app.get('/api/orders/:projectId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.params;
    if (!projectId || typeof projectId !== 'string') {
        return res.status(400).json({ message: 'Invalid projectId' });
    }
    try {
        const order = yield prisma.order.findFirst({
            where: { projectId },
            select: {
                id: true,
                createdAt: true,
                total: true,
            },
        });
        if (!order) {
            return res.status(404).json({ message: 'No order found for this project' });
        }
        return res.status(200).json({
            orderId: order.id,
            orderDate: order.createdAt.toISOString(),
            total: order.total,
        });
    }
    catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
app.get('/api/contributions/:projectId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.params;
    if (!projectId || typeof projectId !== 'string') {
        return res.status(400).json({ message: 'Invalid projectId' });
    }
    try {
        const contributions = yield prisma.contribution.findMany({
            where: { projectId },
            include: {
                pages: {
                    include: {
                        components: {
                            select: {
                                type: true,
                                imageUrl: true,
                                value: true,
                            },
                        },
                    },
                },
                fillYourDetails: {
                    select: {
                        first_name: true,
                        last_name: true,
                        email: true,
                        relationship: true,
                        ExcludeFromOnlineVersion: true,
                        ExcludeFromPromotion: true,
                    },
                }
            },
        });
        if (!contributions) {
            return res.status(404).json({ message: 'Contributions not found' });
        }
        return res.status(200).json({
            totalContributions: contributions.length,
            contributions,
        });
    }
    catch (error) {
        console.error('Error fetching contributions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
app.post("/api/layouts", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId, layouts } = req.body;
    const userId = req.userId;
    if (!projectId || !userId || !Array.isArray(layouts)) {
        return res.status(400).json({ error: "Missing projectId, userId, or invalid layouts" });
    }
    try {
        const project = yield prisma.loginUser.findFirst({
            where: { id: projectId, userId },
        });
        if (!project) {
            return res.status(404).json({ error: "Project not found or unauthorized" });
        }
        yield prisma.layout.deleteMany({
            where: { projectId },
        });
        const savedLayouts = yield prisma.layout.createMany({
            data: layouts.map((layout) => ({
                id: layout.id,
                projectId,
                userId,
                pageType: layout.pageType,
                isPreview: layout.isPreview,
                section: layout.section,
                config: layout.config,
            })),
        });
        res.status(201).json({
            message: "Layouts saved successfully",
            count: savedLayouts.count,
        });
    }
    catch (error) {
        console.error("Error saving layouts:", error);
        res.status(500).json({ error: "Failed to save layouts" });
    }
}));
app.get('/api/layouts/:projectId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.params;
    if (!projectId || typeof projectId !== 'string') {
        res.status(400).json({ error: 'Missing or invalid projectId' });
        return;
    }
    try {
        // Verify project exists and belongs to user
        const project = yield prisma.loginUser.findFirst({
            where: { id: projectId },
        });
        if (!project) {
            res.status(404).json({ error: 'Project not found or unauthorized' });
            return;
        }
        // Fetch the first front cover layout
        const frontCover = yield prisma.layout.findFirst({
            where: {
                projectId,
                pageType: 'front_cover',
                isPreview: true,
            },
        });
        if (!frontCover) {
            res.status(200).json(null); // Return null instead of empty array
        }
        else {
            res.status(200).json(frontCover);
        }
    }
    catch (error) {
        console.error('Error fetching front cover:', error);
        res.status(500).json({ error: 'Failed to fetch front cover' });
    }
}));
// Updated /api/preview/:projectId to return JSON
app.get('/api/preview/:projectId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.params;
    if (!projectId || typeof projectId !== 'string') {
        return res.status(400).json({ message: 'Invalid projectId or unauthorized' });
    }
    try {
        const project = yield prisma.loginUser.findUnique({
            where: { id: projectId },
            select: { projectName: true },
        });
        if (!project) {
            return res.status(404).json({ message: 'Project not found or unauthorized' });
        }
        const contributionsData = yield prisma.contribution.findMany({
            where: { projectId },
            include: {
                pages: {
                    include: {
                        components: {
                            select: {
                                type: true,
                                imageUrl: true,
                                value: true,
                                position: true, // Include position
                                size: true, // Include size
                                styles: true, // Include styles
                            },
                        },
                    },
                },
                fillYourDetails: {
                    select: {
                        first_name: true,
                        last_name: true,
                        email: true,
                        relationship: true,
                        ExcludeFromOnlineVersion: true,
                        ExcludeFromPromotion: true,
                    },
                }
            },
        });
        const pages = yield Promise.all(contributionsData.map((contrib) => __awaiter(void 0, void 0, void 0, function* () {
            var _b;
            const contributorName = ((_b = contrib.fillYourDetails) === null || _b === void 0 ? void 0 : _b.first_name) || 'Anonymous';
            const excludedFromBook = false;
            if (excludedFromBook)
                return [];
            return yield Promise.all(contrib.pages.map((page) => __awaiter(void 0, void 0, void 0, function* () {
                const components = yield Promise.all(page.components.map((comp) => __awaiter(void 0, void 0, void 0, function* () {
                    if (comp.type === 'photo' && comp.imageUrl) {
                        const cleanedImageUrl = stripQueryParams(comp.imageUrl);
                        try {
                            const keyMatch = cleanedImageUrl.match(/memorylane\/(.+)$/);
                            const key = keyMatch ? keyMatch[1] : cleanedImageUrl;
                            const command = new client_s3_1.GetObjectCommand({
                                Bucket: process.env.R2_BUCKET_NAME,
                                Key: key,
                            });
                            const signedUrl = yield (0, s3_request_presigner_1.getSignedUrl)(s3, command, { expiresIn: 3600 });
                            return Object.assign(Object.assign({}, comp), { imageUrl: signedUrl });
                        }
                        catch (error) {
                            console.error('Error generating signed URL for', cleanedImageUrl, ':', error);
                            return Object.assign(Object.assign({}, comp), { imageUrl: '' });
                        }
                    }
                    return comp;
                })));
                return {
                    contributorName,
                    components, // Return full components array with position, size, styles
                };
            })));
        })));
        // Flatten the pages array
        const flattenedPages = pages.flat();
        res.status(200).json({
            projectName: project.projectName,
            pages: flattenedPages,
        });
    }
    catch (error) {
        console.error('Error generating preview:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Updated /api/pdf/:projectId
app.get('/api/pdf/:projectId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d, _e, _f, _g, _h, _j;
    const { projectId } = req.params;
    if (!projectId || typeof projectId !== 'string') {
        return res.status(400).json({ message: 'Invalid projectId or unauthorized' });
    }
    try {
        const project = yield prisma.loginUser.findUnique({
            where: { id: projectId },
            select: { projectName: true },
        });
        if (!project) {
            return res.status(404).json({ message: 'Project not found or unauthorized' });
        }
        // Fetch front cover layout
        const frontCover = yield prisma.layout.findFirst({
            where: {
                projectId,
                pageType: 'front_cover',
                isPreview: true,
            },
        });
        // Generate signed URL for front cover image (if exists)
        let frontCoverImageUrl = '';
        if ((frontCover === null || frontCover === void 0 ? void 0 : frontCover.config) && typeof frontCover.config === 'object' && 'imageKey' in frontCover.config) {
            const cleanedImageUrl = stripQueryParams(frontCover.config.imageKey);
            try {
                const keyMatch = cleanedImageUrl.match(/memorylane\/(.+)$/);
                const key = keyMatch ? keyMatch[1] : cleanedImageUrl;
                const command = new client_s3_1.GetObjectCommand({
                    Bucket: process.env.R2_BUCKET_NAME,
                    Key: key,
                });
                frontCoverImageUrl = yield (0, s3_request_presigner_1.getSignedUrl)(s3, command, { expiresIn: 3600 });
            }
            catch (error) {
                console.error('Error generating signed URL for front cover:', error);
                frontCoverImageUrl = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
            }
        }
        const contributionsData = yield prisma.contribution.findMany({
            where: { projectId },
            include: {
                pages: {
                    include: {
                        components: {
                            select: {
                                type: true,
                                imageUrl: true,
                                value: true,
                            },
                        },
                    },
                },
                fillYourDetails: {
                    select: {
                        first_name: true,
                        last_name: true,
                    },
                }
            },
        });
        //console.log('Contributions Data for PDF:', JSON.stringify(contributionsData, null, 2));
        const contributions = yield Promise.all(contributionsData.map((contrib) => __awaiter(void 0, void 0, void 0, function* () {
            var _k;
            const pages = yield Promise.all(contrib.pages.map((page) => __awaiter(void 0, void 0, void 0, function* () {
                const components = yield Promise.all(page.components.map((comp) => __awaiter(void 0, void 0, void 0, function* () {
                    if (comp.type === 'photo' && comp.imageUrl) {
                        const cleanedImageUrl = stripQueryParams(comp.imageUrl);
                        try {
                            const keyMatch = cleanedImageUrl.match(/memorylane\/(.+)$/);
                            const key = keyMatch ? keyMatch[1] : cleanedImageUrl;
                            const command = new client_s3_1.GetObjectCommand({
                                Bucket: process.env.R2_BUCKET_NAME,
                                Key: key,
                            });
                            const signedUrl = yield (0, s3_request_presigner_1.getSignedUrl)(s3, command, { expiresIn: 3600 });
                            return Object.assign(Object.assign({}, comp), { imageUrl: signedUrl });
                        }
                        catch (error) {
                            console.error('Error generating signed URL for', cleanedImageUrl, ':', error);
                            return Object.assign(Object.assign({}, comp), { imageUrl: '' });
                        }
                    }
                    return comp;
                })));
                return Object.assign(Object.assign({}, page), { components });
            })));
            return {
                id: contrib.id,
                contributorName: ((_k = contrib.fillYourDetails) === null || _k === void 0 ? void 0 : _k.first_name) || 'Anonymous',
                excludedFromBook: false,
                pages,
            };
        })));
        const html = (0, generateBookHtml_1.generateBookHtml)({
            projectName: project.projectName,
            contributions,
            frontCover: frontCover
                ? {
                    title: ((_c = frontCover.config) === null || _c === void 0 ? void 0 : _c.title) || 'No Title',
                    imageUrl: frontCoverImageUrl,
                    description: ((_d = frontCover.config) === null || _d === void 0 ? void 0 : _d.description) || '',
                    titleStyle: ((_e = frontCover.config) === null || _e === void 0 ? void 0 : _e.titleStyle) || {},
                    imageStyle: ((_f = frontCover.config) === null || _f === void 0 ? void 0 : _f.imageStyle) || {},
                    descriptionStyle: ((_g = frontCover.config) === null || _g === void 0 ? void 0 : _g.descriptionStyle) || {},
                    containerStyle: ((_h = frontCover.config) === null || _h === void 0 ? void 0 : _h.containerStyle) || {},
                    hoverEffects: ((_j = frontCover.config) === null || _j === void 0 ? void 0 : _j.hoverEffects) || {},
                }
                : null,
        });
        const config = {
            url: 'https://api.docraptor.com/docs',
            encoding: null,
            headers: {
                'Content-Type': 'application/json',
            },
            json: {
                user_credentials: process.env.DOCRAPTER_API_KEY || '3jOFcaZidoZMhyOjTQ_Y',
                doc: {
                    document_content: html,
                    type: 'pdf',
                    test: process.env.NODE_ENV !== 'production',
                    prince_options: {
                        media: 'print',
                        baseurl: process.env.R2_ENDPOINT || 'https://memorylane.db134517dd79f4a26d091b4dcda7e499.r2.cloudflarestorage.com',
                    },
                },
            },
        };
        request_1.default.post(config, (err, response, body) => {
            if (err) {
                console.error('Error generating PDF:', err);
                return res.status(500).json({ error: 'Failed to generate PDF' });
            }
            if (response.statusCode !== 200) {
                console.error('DocRaptor error:', body);
                return res.status(response.statusCode).json({ error: 'DocRaptor API error' });
            }
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'inline; filename="book.pdf"',
            });
            res.send(body);
        });
    }
    catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Updated generateBookHtml to include front cover
app.post('/api/create-checkout-session', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const session = yield stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Book',
                        },
                        unit_amount: 2500, // $25.00
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${req.headers.origin}/success`,
            cancel_url: `${req.headers.origin}/cancel`,
        });
        res.status(200).json({ id: session.id });
    }
    catch (err) {
        res.status(500).json({ message: 'Error creating checkout', error: err });
    }
}));
app.get('/api/user-projects/:projectId', middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _l;
    const { projectId } = req.params;
    const userId = req.userId;
    if (!projectId || typeof projectId !== 'string') {
        return res.status(400).json({ message: 'Invalid projectId' });
    }
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const project = yield prisma.loginUser.findFirst({
            where: {
                id: projectId,
                userId, // Ensure project belongs to authenticated user
            },
            select: {
                projectName: true,
                imageKey: true,
                deadlines: {
                    where: {
                        deadline_enabled: true, // Fetch only enabled deadlines
                    },
                    orderBy: {
                        updatedAt: 'desc', // Get the most recent deadline
                    },
                    take: 1, // Limit to one deadline
                    select: {
                        actual_deadline: true,
                        calculate_date: true,
                        deadline_enabled: true,
                    },
                },
            },
        });
        if (!project) {
            return res.status(404).json({ message: 'Project not found or unauthorized' });
        }
        // Determine deadlineDate (prefer actual_deadline, fallback to calculate_date)
        const deadline = project.deadlines.length > 0
            ? ((_l = project.deadlines[0].actual_deadline) !== null && _l !== void 0 ? _l : project.deadlines[0].calculate_date)
            : null;
        return res.status(200).json({
            project: {
                projectName: project.projectName,
                imageKey: project.imageKey,
                deadlineDate: deadline ? deadline.toISOString() : null,
            },
        });
    }
    catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
app.patch('/api/user-projects/:projectId', middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _m, _o, _p, _q, _r, _s, _t;
    const { projectId } = req.params;
    const { deadlineDate } = req.body;
    const userId = req.userId;
    if (!projectId || typeof projectId !== 'string') {
        return res.status(400).json({ message: 'Invalid projectId' });
    }
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!deadlineDate || typeof deadlineDate !== 'string') {
        return res.status(400).json({ message: 'Invalid or missing deadlineDate' });
    }
    const parsedDate = new Date(deadlineDate);
    if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ message: 'Invalid deadlineDate format' });
    }
    // Ensure deadline is in the future
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Normalize to midnight
    if (parsedDate < now) {
        return res.status(400).json({ message: 'deadlineDate must be in the future' });
    }
    try {
        // Verify project exists and belongs to the user
        const project = yield prisma.loginUser.findFirst({
            where: {
                id: projectId,
                userId,
            },
            select: {
                projectName: true,
                imageKey: true,
            },
        });
        if (!project) {
            return res.status(404).json({ message: 'Project not found or unauthorized' });
        }
        // Check if a deadline record exists
        const existingDeadline = yield prisma.contributionDeadlines.findFirst({
            where: {
                projectId,
                deadline_enabled: true,
            },
        });
        if (!existingDeadline) {
            // Create a new deadline record
            yield prisma.contributionDeadlines.create({
                data: {
                    id: (0, uuid_1.v4)(),
                    projectId,
                    actual_deadline: parsedDate,
                    deadline_enabled: true,
                },
            });
        }
        else {
            // Update existing deadline
            yield prisma.contributionDeadlines.update({
                where: { id: existingDeadline.id },
                data: {
                    actual_deadline: parsedDate,
                    updatedAt: new Date(), // Explicitly update timestamp
                },
            });
        }
        // Fetch updated project to return consistent response
        const updatedProject = yield prisma.loginUser.findFirst({
            where: { id: projectId },
            select: {
                projectName: true,
                imageKey: true,
                deadlines: {
                    where: { deadline_enabled: true },
                    orderBy: { updatedAt: 'desc' },
                    take: 1,
                    select: {
                        actual_deadline: true,
                        calculate_date: true,
                    },
                },
            },
        });
        const deadline = ((_o = (_m = updatedProject === null || updatedProject === void 0 ? void 0 : updatedProject.deadlines) === null || _m === void 0 ? void 0 : _m.length) !== null && _o !== void 0 ? _o : 0) > 0
            ? ((_r = (_q = (_p = updatedProject === null || updatedProject === void 0 ? void 0 : updatedProject.deadlines) === null || _p === void 0 ? void 0 : _p[0]) === null || _q === void 0 ? void 0 : _q.actual_deadline) !== null && _r !== void 0 ? _r : (_t = (_s = updatedProject === null || updatedProject === void 0 ? void 0 : updatedProject.deadlines) === null || _s === void 0 ? void 0 : _s[0]) === null || _t === void 0 ? void 0 : _t.calculate_date)
            : null;
        return res.status(200).json({
            project: {
                projectName: updatedProject === null || updatedProject === void 0 ? void 0 : updatedProject.projectName,
                imageKey: updatedProject === null || updatedProject === void 0 ? void 0 : updatedProject.imageKey,
                deadlineDate: deadline ? deadline.toISOString() : null,
            },
        });
    }
    catch (error) {
        console.error('Error updating project deadline:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
app.patch("/api/update-contribution/:contributionId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { contributionId } = req.params;
        const { fillYourDetailsId } = req.body;
        if (!contributionId || !fillYourDetailsId) {
            return res.status(400).json({ error: "Missing contributionId or fillYourDetailsId" });
        }
        // Validate Contribution exists
        const contribution = yield prisma.contribution.findUnique({
            where: { id: contributionId },
        });
        if (!contribution) {
            return res.status(404).json({ error: "Contribution not found" });
        }
        // Prevent updating if fillYourDetailsId is already set
        if (contribution.fillYourDetailsId) {
            return res.status(400).json({ error: "Contribution already linked to FillYourDetails" });
        }
        // Validate FillYourDetails exists
        const fillYourDetails = yield prisma.fillYourDetails.findUnique({
            where: { id: fillYourDetailsId },
        });
        if (!fillYourDetails) {
            return res.status(400).json({ error: "FillYourDetails record not found" });
        }
        // Update Contribution with fillYourDetailsId
        const updatedContribution = yield prisma.contribution.update({
            where: { id: contributionId },
            data: {
                fillYourDetails: {
                    connect: { id: fillYourDetailsId },
                },
            },
        });
        res.status(200).json({
            message: "Contribution updated successfully",
            contributionId: updatedContribution.id,
        });
    }
    catch (error) {
        console.error("Error updating contribution:", error);
        res.status(500).json({ error: "Failed to update contribution" });
    }
    finally {
        yield prisma.$disconnect();
    }
}));
app.post('/api/shipping-options', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _u;
    const { shipping_address } = req.body;
    try {
        // Validate shipping address
        if (!shipping_address || !shipping_address.postal_code) {
            return res.status(400).json({ error: 'Shipping address with postal code is required' });
        }
        // Prepare query parameters for Shiprocket GET request
        const queryParams = {
            pickup_postcode: process.env.WAREHOUSE_POSTCODE, // Your warehouse postcode
            delivery_postcode: shipping_address.postal_code,
            weight: 0.5, // Example: 500g for a book (adjust as needed)
            cod: 0, // Prepaid order
            // Optional: Add more parameters for filtering (e.g., length, breadth, height)
        };
        // Call Shiprocket's serviceability API (GET request)
        const shiprocketResponse = yield axios_1.default.get('https://apiv2.shiprocket.in/v1/external/courier/serviceability/', {
            params: queryParams,
            headers: {
                Authorization: `Bearer ${process.env.SHIPROCKET_API_TOKEN}`,
            },
        });
        if (shiprocketResponse.data.status !== 200) {
            return res.status(400).json({ error: 'No shipping options available' });
        }
        // Map Shiprocket response to frontend format
        const shippingOptions = shiprocketResponse.data.data.available_courier_companies.map((courier) => ({
            id: courier.courier_company_id,
            name: courier.courier_name,
            amount: Math.round(courier.freight_charge * 100), // Convert to paise
            estimated_days: courier.estimated_delivery_days || '3-5', // Fallback if not provided
        }));
        res.json({ shipping_options: shippingOptions });
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error)) {
            console.error('Error fetching shipping options:', ((_u = error.response) === null || _u === void 0 ? void 0 : _u.data) || error.message);
        }
        else {
            console.error('Error fetching shipping options:', error);
        }
        res.status(400).json({ error: 'Unable to fetch shipping options' });
    }
}));
app.post('/api/create-order', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { project_id, shipping_address, shipping_option, amount } = req.body;
    try {
        // Validate inputs
        if (!project_id || !shipping_address || !shipping_option || !amount) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        // Create Razorpay order
        const order = yield razorpay.orders.create({
            amount: amount, // Amount in paise (e.g., 5000 paise = ₹50)
            currency: 'INR',
            receipt: `od_${project_id}`,
            notes: {
                project_id,
                shipping_option,
            },
        });
        const orderResponse = res.json({
            order_id: order.id,
            amount: order.amount,
            currency: order.currency,
        });
    }
    catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
}));
app.post('/api/verify-payment', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, project_id, amount, shipping_address } = req.body;
    try {
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto_1.default
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || (() => { throw new Error("RAZORPAY_KEY_SECRET is not defined in the environment variables"); })())
            .update(body)
            .digest('hex');
        const isSignatureValid = expectedSignature === razorpay_signature;
        const paymentDetails = yield prisma.payment.create({
            data: {
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id,
                signature: razorpay_signature,
                project_id,
                amount,
                verified: isSignatureValid,
                error_message: isSignatureValid ? null : 'Invalid signature',
                shipping_address: shipping_address ? JSON.stringify(shipping_address) : null
            },
        });
        if (isSignatureValid) {
            res.json({ success: true });
        }
        else {
            res.status(400).json({ success: false, error: 'Invalid signature' });
        }
    }
    catch (error) {
        console.error('Error verifying payment:', error);
        yield prisma.payment.create({
            data: {
                orderId: razorpay_order_id || 'unknown',
                paymentId: razorpay_payment_id || 'unknown',
                signature: razorpay_signature || 'unknown',
                project_id: project_id || 'unknown',
                amount: amount || 0,
                verified: false,
                error_message: error instanceof Error ? error.message : 'Payment verification failed',
                shipping_address: shipping_address ? JSON.stringify(shipping_address) : null
            },
        });
        res.status(500).json({ success: false, error: 'Payment verification failed' });
    }
}));
app.get('/api/order', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { order_id } = req.query;
    if (!order_id) {
        return res.status(400).json({ error: 'Missing order_id' });
    }
    try {
        const order = yield prisma.payment.findFirst({
            where: { orderId: order_id },
            select: {
                orderId: true,
                paymentId: true,
                signature: true,
                project_id: true,
                amount: true,
                error_message: true,
                verified: true,
                shipping_address: true
            },
        });
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json({
            order_id: order.orderId,
            project_id: order.project_id,
            amount: order.amount || 0,
            status: order.verified ? 'confirmed' : 'failed',
            error_message: order.error_message || null,
            shipping_address: order.shipping_address ? JSON.parse(order.shipping_address) : null,
        });
    }
    catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
}));
app.post('/api/print/:projectId', middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.params;
    const { order_id } = req.body;
    if (!projectId || typeof projectId !== 'string' || !order_id || typeof order_id !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid projectId or order_id' });
    }
    try {
        // Step 1: Fetch order details to get shipping_address
        const order = yield prisma.payment.findFirst({
            where: { orderId: order_id, project_id: projectId },
            select: { shipping_address: true },
        });
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        const shipping_address = order.shipping_address ? JSON.parse(order.shipping_address) : null;
        // Step 2: Fetch project details to get totalPages
        const project = yield prisma.loginUser.findUnique({
            where: { id: projectId },
            select: { totalPages: true },
        });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        // Step 3: Fetch PDF from /api/pdf/:projectId (internal call)
        const pdfResponse = yield axios_1.default.get(`${process.env.INTERNAL_BACKEND_URL || 'http://localhost:8080'}/api/pdf/${projectId}`, {
            responseType: 'arraybuffer',
        });
        // Step 4: Authenticate with Lulu API
        const base64LuluKey = `${process.env.LULU_BASE_ENCODED_KEY}`;
        const luluTokenResponse = yield axios_1.default.post('https://api.sandbox.lulu.com/auth/realms/glasstree/protocol/openid-connect/token', new URLSearchParams({ grant_type: 'client_credentials' }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: base64LuluKey,
            },
        });
        const luluAccessToken = luluTokenResponse.data.access_token;
        console.log('Lulu Access Token:', luluAccessToken);
        // Step 5: Upload PDF to Lulu
        const formData = new FormData();
        formData.append('file', new Blob([Buffer.from(pdfResponse.data)]), `book-${projectId}.pdf`);
        const uploadResponse = yield axios_1.default.post('https://api.lulu.com/files/', formData, {
            headers: {
                Authorization: `Bearer ${luluAccessToken}`,
                'Content-Type': 'multipart/form-data',
            },
        });
        console.log('File Upload Response:', uploadResponse.data);
        const fileId = uploadResponse.data.id;
        console.log('File uploaded to Lulu:', fileId);
        // Step 6: Create print job
        const printJobResponse = yield axios_1.default.post('https://api.lulu.com/print-jobs/', {
            line_items: [
                {
                    page_count: project.totalPages || 100, // Use totalPages or fallback
                    product: 'PAPERBACK_60X90_40', // 6x9 paperback, adjust as needed
                    file: fileId,
                },
            ],
            shipping_address: {
                name: (shipping_address === null || shipping_address === void 0 ? void 0 : shipping_address.name) || 'Customer Name',
                street_line_1: (shipping_address === null || shipping_address === void 0 ? void 0 : shipping_address.line1) || '123 Main St',
                city: (shipping_address === null || shipping_address === void 0 ? void 0 : shipping_address.city) || 'Anytown',
                state_code: (shipping_address === null || shipping_address === void 0 ? void 0 : shipping_address.state) || 'NY',
                country_code: (shipping_address === null || shipping_address === void 0 ? void 0 : shipping_address.country) || 'US',
                postal_code: (shipping_address === null || shipping_address === void 0 ? void 0 : shipping_address.postal_code) || '12345',
            },
            shipping_level: 'EXPRESS', // Adjust as needed
        }, {
            headers: {
                Authorization: `Bearer ${luluAccessToken}`,
                'Content-Type': 'application/json',
            },
        });
        // Step 7: Store print job in PrintJob model
        const printJob = yield prisma.printJob.create({
            data: {
                lulu_job_id: printJobResponse.data.id,
                paymentId: order_id,
                projectId
            },
        });
        res.json({ success: true, print_job_id: printJobResponse.data.id });
    }
    catch (error) {
        console.error('Error creating print job:', error);
        res.status(500).json({ error: 'Failed to create print job' });
    }
}));
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});
// Listening to the server
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});
