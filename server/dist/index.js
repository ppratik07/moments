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
// Utility function to strip query parameters from a URL
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
    console.log("Received req.userId in /api/users:", req.userId);
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
    console.log("Key:", key);
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
    console.log(projectId, imageKey, uploadUrl);
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
        console.log("Updated project:", updatedProject);
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
        const { projectId, signature, pages } = req.body;
        if (!projectId || !signature || !pages) {
            return res.status(400).json({ error: "Missing required fields" });
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
        console.log('Received contribution pages:', JSON.stringify(pages, null, 2));
        const contribution = yield prisma.contribution.create({
            data: {
                projectId,
                signature,
                pages: {
                    create: pages.map((page) => ({
                        guid: page.guid,
                        layoutId: page.layoutId,
                        images: page.images.map(stripQueryParams),
                        message: page.message,
                        components: {
                            create: page.components.map((component) => {
                                const cleanedImageUrl = component.image_url ? stripQueryParams(component.image_url) : component.image_url;
                                console.log('Saving component with imageUrl:', cleanedImageUrl);
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
// Updated /api/preview/:projectId to return JSON
app.get('/api/preview/:projectId', middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.params;
    const userId = req.userId;
    console.log('Project ID', projectId);
    console.log('UID', userId);
    if (!projectId || typeof projectId !== 'string' || !userId) {
        return res.status(400).json({ message: 'Invalid projectId or unauthorized' });
    }
    try {
        const project = yield prisma.loginUser.findUnique({
            where: { id: projectId, userId },
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
            },
        });
        const pages = yield Promise.all(contributionsData.map((contrib) => __awaiter(void 0, void 0, void 0, function* () {
            const contributorName = contrib.signature || 'Anonymous';
            const excludedFromBook = false;
            if (excludedFromBook)
                return [];
            return yield Promise.all(contrib.pages.map((page) => __awaiter(void 0, void 0, void 0, function* () {
                const components = yield Promise.all(page.components.map((comp) => __awaiter(void 0, void 0, void 0, function* () {
                    if (comp.type === 'photo' && comp.imageUrl) {
                        const cleanedImageUrl = stripQueryParams(comp.imageUrl);
                        console.log('Cleaned imageUrl:', cleanedImageUrl);
                        try {
                            const keyMatch = cleanedImageUrl.match(/memorylane\/(.+)$/);
                            const key = keyMatch ? keyMatch[1] : cleanedImageUrl;
                            console.log('Generating signed URL for key:', key);
                            const command = new client_s3_1.GetObjectCommand({
                                Bucket: process.env.R2_BUCKET_NAME,
                                Key: key,
                            });
                            const signedUrl = yield (0, s3_request_presigner_1.getSignedUrl)(s3, command, { expiresIn: 3600 });
                            console.log('Signed URL:', signedUrl);
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
    const { projectId } = req.params;
    console.log('ProjectID', projectId);
    if (!projectId || typeof projectId !== 'string') {
        return res.status(400).json({ message: 'Invalid projectId or unauthorized' });
    }
    try {
        const project = yield prisma.loginUser.findUnique({
            where: { id: projectId },
            select: { projectName: true },
        });
        console.log('Project:', project);
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
                            },
                        },
                    },
                },
            },
        });
        console.log('Contributions Data for PDF:', JSON.stringify(contributionsData, null, 2));
        const contributions = yield Promise.all(contributionsData.map((contrib) => __awaiter(void 0, void 0, void 0, function* () {
            const pages = yield Promise.all(contrib.pages.map((page) => __awaiter(void 0, void 0, void 0, function* () {
                const components = yield Promise.all(page.components.map((comp) => __awaiter(void 0, void 0, void 0, function* () {
                    if (comp.type === 'photo' && comp.imageUrl) {
                        const cleanedImageUrl = stripQueryParams(comp.imageUrl);
                        console.log('Cleaned imageUrl for PDF:', cleanedImageUrl);
                        try {
                            const keyMatch = cleanedImageUrl.match(/memorylane\/(.+)$/);
                            const key = keyMatch ? keyMatch[1] : cleanedImageUrl;
                            console.log('Generating signed URL for PDF key:', key);
                            const command = new client_s3_1.GetObjectCommand({
                                Bucket: process.env.R2_BUCKET_NAME,
                                Key: key,
                            });
                            const signedUrl = yield (0, s3_request_presigner_1.getSignedUrl)(s3, command, { expiresIn: 3600 });
                            console.log('Signed URL for PDF:', signedUrl);
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
                contributorName: contrib.signature || 'Anonymous',
                excludedFromBook: false,
                pages,
            };
        })));
        const html = generateBookHtml({
            projectName: project.projectName,
            contributions,
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
        console.log('config', config);
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
// Helper function to generate HTML for PDF
function generateBookHtml(contributionsData) {
    const { projectName, contributions } = contributionsData;
    let pageContent = '';
    let pageCount = 0;
    contributions.forEach((contribution) => {
        if (contribution.excludedFromBook)
            return;
        contribution.pages.forEach((page) => {
            if (pageCount % 2 === 0 && pageCount > 0) {
                pageContent += '</div>';
            }
            if (pageCount % 2 === 0) {
                pageContent += '<div class="page">';
            }
            pageContent += `
        <div class="contribution">
          <h2 class="contributor-name">${contribution.contributorName}</h2>
      `;
            const photos = page.components.filter((comp) => comp.type === 'photo' && comp.imageUrl);
            photos.forEach((photo) => {
                pageContent += `
          <img 
            src="${photo.imageUrl || 'https://via.placeholder.com/300x200?text=Image+Not+Found'}" 
            alt="Contribution photo" 
            class="photo" 
            onerror="this.src='https://via.placeholder.com/300x200?text=Image+Failed+to+Load'; console.error('Image failed to load:', '${photo.imageUrl}')"
          >
        `;
            });
            const paragraphs = page.components.filter((comp) => comp.type === 'paragraph' && comp.value);
            paragraphs.forEach((paragraph) => {
                pageContent += `<p class="paragraph">${paragraph.value}</p>`;
            });
            if (photos.length === 0 && paragraphs.length === 0) {
                pageContent += `<p class="no-content">No content available</p>`;
            }
            pageContent += '</div>';
            pageCount++;
        });
    });
    if (pageCount % 2 !== 0 || pageCount === 0) {
        pageContent += '</div>';
    }
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${projectName} - Book Preview</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background: #fff;
        }
        .book-container {
          max-width: 210mm;
          margin: 0 auto;
          background: #fff;
        }
        .page {
          width: 210mm;
          min-height: 297mm;
          padding: 10mm;
          box-sizing: border-box;
          background: #fff;
          page-break-after: always;
        }
        .contribution {
          margin-bottom: 10mm;
          border-bottom: 1px solid #eee;
          padding-bottom: 5mm;
        }
        .contributor-name {
          font-size: 16pt;
          font-weight: bold;
          margin-bottom: 5mm;
          color: #333;
        }
        .photo {
          max-width: 100%;
          height: auto;
          margin-bottom: 5mm;
          border-radius: 4px;
          display: block;
        }
        .paragraph {
          font-size: 12pt;
          line-height: 1.5;
          color: #555;
          margin-bottom: 5mm;
        }
        .no-content {
          font-size: 12pt;
          color: #999;
          text-align: center;
        }
        @page {
          size: A4;
          margin: 0;
        }
      </style>
    </head>
    <body>
      <div id="book-container" class="book-container">
        ${pageContent}
      </div>
    </body>
    </html>
  `;
}
// Listening to the server
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});
