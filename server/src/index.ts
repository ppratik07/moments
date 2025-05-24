import express from "express";
import cors from "cors";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { authMiddleware } from "./middleware/middleware";
import request from "request";
import Stripe from 'stripe';
import axios from "axios";
import { Courier } from "../types/types";
import Razorpay from "razorpay";
import crypto from 'crypto';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "token"],
  })
);
app.use(express.json());

const prisma = new PrismaClient();

// S3/R2 Client Configuration
const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined in the environment variables");
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


// Utility function to strip query parameters from a URL
function stripQueryParams(url: string): string {
  const index = url.indexOf('?');
  return index !== -1 ? url.substring(0, index) : url;
}


// Existing Endpoints (unchanged)
app.get("/event-type", async (req: Request, res: Response): Promise<any> => {
  const { name } = req.query;
  if (!name || typeof name !== "string") {
    return res.status(400).json({ error: "Event type name is required" });
  }

  try {
    const eventType = await prisma.eventType.findUnique({
      where: { name: name as string },
    });

    if (!eventType) {
      return res.status(404).json({ error: "Event type not found" });
    }

    if (eventType) {
      return res.json({ description: eventType.description });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/users", authMiddleware, async (req: Request, res: Response): Promise<any> => {
  const { projectName, bookName, dueDate, eventType, eventDescription } = req.body;
  console.log("Received req.userId in /api/users:", req.userId);
  try {
    const userDetails = await prisma.loginUser.create({
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
  } catch (error) {
    console.error("Failed to create project:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/get-presign-url", async (req, res) => {
  const fileType = req.query.fileType as string;

  if (!fileType) {
    return;
  }

  const fileExtension = fileType.split("/")[1];
  const key = `${uuidv4()}.${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    ContentType: fileType,
  });

  try {
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
    res.json({ uploadUrl, key });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    res.status(500).json({ error: "Could not generate upload URL" });
  }
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
});

app.delete("/api/delete-image", async (req, res) => {
  const { key } = req.query;
  console.log("Key:", key);
  if (!key || typeof key !== "string") {
    res.status(400).json({ error: "Missing or invalid key parameter" });
  }
  try {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key as string,
    });

    await s3.send(deleteCommand);

    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image from R2:", error);
    res.status(500).json({ error: "Failed to delete image" });
  }
});

app.get("/api/user-projects", authMiddleware, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    const projects = await prisma.loginUser.findMany({
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
  } catch (error) {
    console.error("Error fetching user projects:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get('/api/user-projects/:projectId', async (req: Request, res: Response): Promise<any> => {
  const { projectId } = req.params;

  if (!projectId || typeof projectId !== 'string') {
    return res.status(400).json({ message: 'Invalid projectId' });
  }

  try {
    const project = await prisma.loginUser.findUnique({
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
  } catch (error) {
    console.error('Error fetching user projects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch("/api/users/:projectId/upload-image", async (req: Request, res: Response): Promise<any> => {
  const { projectId } = req.params;
  const { imageKey, uploadUrl } = req.body;
  console.log(projectId, imageKey, uploadUrl);
  if (!imageKey || !uploadUrl) {
    return res.status(400).json({ error: "Missing imageKey or uploadUrl" });
  }

  try {
    const updatedProject = await prisma.loginUser.update({
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
  } catch (error) {
    console.error("Failed to update image info:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/user-information", async (req: Request, res: Response): Promise<any> => {
  const { firstName, lastName, email } = req.body;
  if (!firstName || !lastName || !email) {
    res.status(400).json({ message: "All fields are required" });
  }
  const user = await prisma.userInformation.create({
    data: {
      first_name: firstName,
      last_name: lastName,
      email,
    },
  });
  return res.status(200).send({
    message: "User information filled successfully",
  });
});

app.post("/api/save-contribution", async (req, res): Promise<any> => {
  try {
    const { projectId, signature, pages,fillYourDetailsId } = req.body;

    if (!projectId || !signature || !pages) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (fillYourDetailsId) {
      const fillYourDetails = await prisma.fillYourDetails.findUnique({
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
      if (
        !Array.isArray(page.images) ||
        page.images.some(
          (img: unknown) => img !== null && typeof img !== "string"
        )
      ) {
        return res.status(400).json({ error: "Invalid images array" });
      }
    }
    console.log('Received contribution pages:', JSON.stringify(pages, null, 2));
    const contribution = await prisma.contribution.create({
      data: {
        projectId,
        signature,
        fillYourDetailsId, // Optional, may be null
        pages: {
          create: pages.map(
            (page: {
              guid: string;
              layoutId: string;
              images: string[];
              message: string;
              components: {
                type: string;
                position?: any;
                size: any;
                styles?: any;
                editor?: any;
                value: string;
                image_url: string;
                original?: any;
              }[];
            }) => ({
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
            })
          ),
        },
      },
    });

    res.status(200).json({
      message: "Contribution saved successfully",
      contributionId: contribution.id,
    });
  } catch (error) {
    console.error("Error saving contribution:", error);
    res.status(500).json({ error: "Failed to save contribution" });
  } finally {
    await prisma.$disconnect();
  }
});

app.post("/api/submit-information", async (req: Request, res: Response): Promise<any> => {
  const {
    firstName,
    lastName,
    email,
    relationship,
    excludeOnline,
    notifyMe,
    projectId
  } = req.body;

  if (!firstName || !lastName || !email || !relationship) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = await prisma.fillYourDetails.create({
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
  } catch (error) {
    console.error("Error saving user information:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/contributions/count/:projectId", async (req, res) => {
  const { projectId } = req.params;

  try {
    const count = await prisma.contribution.count({
      where: { projectId },
    });
    res.json({ projectId, count });
  } catch (error) {
    console.error("Error getting contribution count:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/deadline/:projectId", async (req: Request, res: Response): Promise<any> => {
  const { projectId } = req.params;

  if (!projectId || typeof projectId !== "string") {
    return res.status(400).json({ message: "Invalid projectId" });
  }

  try {
    const deadline = await prisma.contributionDeadlines.findFirst({
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

    const deadlineDate = deadline.actual_deadline ?? deadline.calculate_date;

    return res.status(200).json({
      deadline: deadlineDate ? deadlineDate.toISOString() : null,
      deadline_enabled: deadline.deadline_enabled,
    });
  } catch (error) {
    console.error("Error fetching deadline:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/api/lastcontribution/:projectId", async (req: Request, res: Response): Promise<any> => {
  const { projectId } = req.params;

  if (!projectId || typeof projectId !== "string") {
    return res.status(400).json({ message: "Invalid projectId" });
  }

  try {
    const lastContribution = await prisma.contribution.findFirst({
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
  } catch (error) {
    console.error("Error fetching last contribution:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/api/feedback", authMiddleware, async (req: Request, res: Response): Promise<any> => {
  const { projectId, content }: { projectId: string; content: string } = req.body;

  if (
    !projectId ||
    !content ||
    typeof projectId !== "string" ||
    typeof content !== "string"
  ) {
    return res.status(400).json({ message: "Invalid projectId or content" });
  }
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const feedback = await prisma.feedback.create({
      data: {
        userId,
        projectId,
        content,
      },
    });
    return res
      .status(201)
      .json({ message: "Feedback submitted successfully", feedback });
  } catch (error) {
    console.error("Error saving feedback:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/api/project-status/:projectId", async (req: Request, res: Response): Promise<any> => {
  const { projectId } = req.params;

  if (!projectId || typeof projectId !== "string") {
    return res.status(400).json({ message: "Invalid projectId" });
  }

  try {
    const order = await prisma.order.findFirst({
      where: { projectId },
    });

    const status = order ? "printing" : "gathering";

    return res.status(200).json({ status });
  } catch (error) {
    console.error("Error fetching project status:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get('/api/orders/:projectId', async (req: Request, res: Response): Promise<any> => {
  const { projectId } = req.params;
  if (!projectId || typeof projectId !== 'string') {
    return res.status(400).json({ message: 'Invalid projectId' });
  }
  try {
    const order = await prisma.order.findFirst({
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
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/api/contributions/:projectId', async (req: Request, res: Response): Promise<any> => {
  const { projectId } = req.params;

  if (!projectId || typeof projectId !== 'string') {
    return res.status(400).json({ message: 'Invalid projectId' });
  }

  try {
    const contributions = await prisma.contribution.findMany({
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
        fillYourDetails:{
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
  } catch (error) {
    console.error('Error fetching contributions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post("/api/layouts", authMiddleware, async (req: Request, res: Response): Promise<any> => {
  const { projectId, layouts } = req.body;
  const userId = req.userId;

  if (!projectId || !userId || !Array.isArray(layouts)) {
    return res.status(400).json({ error: "Missing projectId, userId, or invalid layouts" });
  }

  try {
    const project = await prisma.loginUser.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found or unauthorized" });
    }

    await prisma.layout.deleteMany({
      where: { projectId },
    });

    const savedLayouts = await prisma.layout.createMany({
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
  } catch (error) {
    console.error("Error saving layouts:", error);
    res.status(500).json({ error: "Failed to save layouts" });
  }
});
app.get('/api/layouts/:projectId', async (req: Request, res: Response): Promise<void> => {
  const { projectId } = req.params;
  // const userId = req.userId as string;

  console.log('GET /api/layouts called with:', { projectId });

  if (!projectId || typeof projectId !== 'string') {
    console.log('Invalid projectId');
    res.status(400).json({ error: 'Missing or invalid projectId' });
    return;
  }

  try {
    // Verify project exists and belongs to user
    const project = await prisma.loginUser.findFirst({
      where: { id: projectId },
    });

    if (!project) {
      console.log('Project not found or unauthorized');
      res.status(404).json({ error: 'Project not found or unauthorized' });
      return;
    }

    // Fetch the first front cover layout
    const frontCover = await prisma.layout.findFirst({
      where: {
        projectId,
        pageType: 'front_cover',
        isPreview: true,
      },
    });

    if (!frontCover) {
      console.log('No front cover found');
      res.status(200).json(null); // Return null instead of empty array
    } else {
      res.status(200).json(frontCover);
    }
  } catch (error) {
    console.error('Error fetching front cover:', error);
    res.status(500).json({ error: 'Failed to fetch front cover' });
  }
});
// Updated /api/preview/:projectId to return JSON
app.get('/api/preview/:projectId', async (req: Request, res: Response): Promise<any> => {
  const { projectId } = req.params;
  // const userId = req.userId;
  console.log('Project ID', projectId);
  // console.log('UID', userId);
  if (!projectId || typeof projectId !== 'string') {
    return res.status(400).json({ message: 'Invalid projectId or unauthorized' });
  }

  try {
    const project = await prisma.loginUser.findUnique({
      where: { id: projectId},
      select: { projectName: true },
    });
    if (!project) {
      return res.status(404).json({ message: 'Project not found or unauthorized' });
    }

    const contributionsData = await prisma.contribution.findMany({
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
                size: true,     // Include size
                styles: true,   // Include styles
              },
            },
          },
        },
      },
    });

    const pages = await Promise.all(contributionsData.map(async (contrib) => {
      const contributorName = contrib.signature || 'Anonymous';
      const excludedFromBook = false;

      if (excludedFromBook) return [];

      return await Promise.all(contrib.pages.map(async (page) => {
        const components = await Promise.all(page.components.map(async (comp) => {
          if (comp.type === 'photo' && comp.imageUrl) {
            const cleanedImageUrl = stripQueryParams(comp.imageUrl);
            console.log('Cleaned imageUrl:', cleanedImageUrl);
            try {
              const keyMatch = cleanedImageUrl.match(/memorylane\/(.+)$/);
              const key = keyMatch ? keyMatch[1] : cleanedImageUrl;
              console.log('Generating signed URL for key:', key);
              const command = new GetObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME!,
                Key: key,
              });
              const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
              console.log('Signed URL:', signedUrl);
              return { ...comp, imageUrl: signedUrl };
            } catch (error) {
              console.error('Error generating signed URL for', cleanedImageUrl, ':', error);
              return { ...comp, imageUrl: '' };
            }
          }
          return comp;
        }));

        return {
          contributorName,
          components, // Return full components array with position, size, styles
        };
      }));
    }));

    // Flatten the pages array
    const flattenedPages = pages.flat();

    res.status(200).json({
      projectName: project.projectName,
      pages: flattenedPages,
    });
  } catch (error) {
    console.error('Error generating preview:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Updated /api/pdf/:projectId
app.get('/api/pdf/:projectId', async (req: Request, res: Response): Promise<any> => {
  const { projectId } = req.params;
  console.log('ProjectID', projectId);
  if (!projectId || typeof projectId !== 'string') {
    return res.status(400).json({ message: 'Invalid projectId or unauthorized' });
  }

  try {
    const project = await prisma.loginUser.findUnique({
      where: { id: projectId },
      select: { projectName: true },
    });
    console.log('Project:', project);
    if (!project) {
      return res.status(404).json({ message: 'Project not found or unauthorized' });
    }

    // Fetch front cover layout
    const frontCover = await prisma.layout.findFirst({
      where: {
        projectId,
        pageType: 'front_cover',
        isPreview: true,
      },
    });

    console.log('Front Cover:', JSON.stringify(frontCover, null, 2));

    // Generate signed URL for front cover image (if exists)
    let frontCoverImageUrl = '';
    if (frontCover?.config && typeof frontCover.config === 'object' && 'imageKey' in frontCover.config) {
      const cleanedImageUrl = stripQueryParams(frontCover.config.imageKey as string);
      try {
        const keyMatch = cleanedImageUrl.match(/memorylane\/(.+)$/);
        const key = keyMatch ? keyMatch[1] : cleanedImageUrl;
        console.log('Generating signed URL for front cover key:', key);
        const command = new GetObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME!,
          Key: key,
        });
        frontCoverImageUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
        console.log('Signed URL for front cover:', frontCoverImageUrl);
      } catch (error) {
        console.error('Error generating signed URL for front cover:', error);
        frontCoverImageUrl = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
      }
    }

    const contributionsData = await prisma.contribution.findMany({
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

    const contributions = await Promise.all(contributionsData.map(async (contrib) => {
      const pages = await Promise.all(contrib.pages.map(async (page) => {
        const components = await Promise.all(page.components.map(async (comp) => {
          if (comp.type === 'photo' && comp.imageUrl) {
            const cleanedImageUrl = stripQueryParams(comp.imageUrl);
            console.log('Cleaned imageUrl for PDF:', cleanedImageUrl);
            try {
              const keyMatch = cleanedImageUrl.match(/memorylane\/(.+)$/);
              const key = keyMatch ? keyMatch[1] : cleanedImageUrl;
              console.log('Generating signed URL for PDF key:', key);
              const command = new GetObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME!,
                Key: key,
              });
              const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
              console.log('Signed URL for PDF:', signedUrl);
              return { ...comp, imageUrl: signedUrl };
            } catch (error) {
              console.error('Error generating signed URL for', cleanedImageUrl, ':', error);
              return { ...comp, imageUrl: '' };
            }
          }
          return comp;
        }));
        return { ...page, components };
      }));
      return {
        id: contrib.id,
        contributorName: contrib.signature || 'Anonymous',
        excludedFromBook: false,
        pages,
      };
    }));

    const html = generateBookHtml({
      projectName: project.projectName,
      contributions,
      frontCover: frontCover
        ? {
            title: (frontCover.config as any)?.title || 'No Title',
            imageUrl: frontCoverImageUrl,
            description: (frontCover.config as any)?.description || '',
            titleStyle: (frontCover.config as any)?.titleStyle || {},
            imageStyle: (frontCover.config as any)?.imageStyle || {},
            descriptionStyle: (frontCover.config as any)?.descriptionStyle || {},
            containerStyle: (frontCover.config as any)?.containerStyle || {},
            hoverEffects: (frontCover.config as any)?.hoverEffects || {},
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
        user_credentials: process.env.DOCRAPTER_API_KEY! || '3jOFcaZidoZMhyOjTQ_Y',
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
    console.log('DocRaptor config:', JSON.stringify(config, null, 2));

    request.post(config, (err, response, body) => {
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
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Updated generateBookHtml to include front cover
function generateBookHtml(data: {
  projectName: string;
  contributions: any[];
  frontCover: {
    title: string;
    imageUrl: string;
    description: string;
    titleStyle: any;
    imageStyle: any;
    descriptionStyle: any;
    containerStyle: any;
    hoverEffects: any;
  } | null;
}): string {
  const { projectName, contributions, frontCover } = data;
  let pageContent = '';

  // Add front cover as the first page
  pageContent += '<div class="page front-cover">';
  if (frontCover) {
    pageContent += `
      <div class="front-cover-container">
        <h1 class="front-cover-title">${frontCover.title}</h1>
        ${
          frontCover.imageUrl
            ? `<img 
                 src="${frontCover.imageUrl}" 
                 alt="Front Cover" 
                 class="front-cover-image" 
                 onerror="this.src='https://via.placeholder.com/300x200?text=Image+Failed+to+Load'; console.error('Front cover image failed to load:', '${frontCover.imageUrl}')"
               >`
            : ''
        }
        ${
          frontCover.description
            ? `<p class="front-cover-description">${frontCover.description}</p>`
            : ''
        }
      </div>
    `;
  } else {
    pageContent += `
      <div class="front-cover-container">
        <h1 class="front-cover-title">Memory Lane Book</h1>
      </div>
    `;
  }
  pageContent += '</div>';

  // Add contribution pages
  let pageCount = 0; // Start after front cover
  contributions.forEach((contribution) => {
    if (contribution.excludedFromBook) return;

    contribution.pages.forEach((page: any) => {
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

      const photos = page.components.filter((comp: any) => comp.type === 'photo' && comp.imageUrl);
      photos.forEach((photo: any) => {
        pageContent += `
          <img 
            src="${photo.imageUrl || 'https://via.placeholder.com/300x200?text=Image+Not+Found'}" 
            alt="Contribution photo" 
            class="photo" 
            onerror="this.src='https://via.placeholder.com/300x200?text=Image+Failed+to+Load'; console.error('Image failed to load:', '${photo.imageUrl}')"
          >
        `;
      });

      const paragraphs = page.components.filter((comp: any) => comp.type === 'paragraph' && comp.value);
      paragraphs.forEach((paragraph: any) => {
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
        .front-cover {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 20mm;
          background: #fff;
        }
        .front-cover-container {
          position: relative;
          width: 100%;
          max-width: 180mm;
          text-align: center;
          border: 2px dashed #9ca3af;
          padding: 10mm;
          box-sizing: border-box;
        }
        .front-cover-title {
          font-size: ${frontCover?.titleStyle?.fontSize || '30pt'};
          font-weight: ${frontCover?.titleStyle?.fontWeight || 'bold'};
          margin-bottom: ${frontCover?.titleStyle?.marginBottom || '15mm'};
          margin-top: ${frontCover?.titleStyle?.marginTop || '10mm'};
          text-align: ${frontCover?.titleStyle?.textAlign || 'center'};
          color: #000;
          word-break: break-word;
        }
        .front-cover-image {
          width: ${frontCover?.imageStyle?.width ? `${frontCover.imageStyle.width}px` : '280px'};
          height: ${frontCover?.imageStyle?.height ? `${frontCover.imageStyle.height}px` : '200px'};
          object-fit: ${frontCover?.imageStyle?.objectFit || 'contain'};
          box-shadow: ${frontCover?.imageStyle?.shadow || '0 4px 6px rgba(0, 0, 0, 0.1)'};
          margin-bottom: ${frontCover?.imageStyle?.marginBottom || '15mm'};
          display: block;
          margin-left: auto;
          margin-right: auto;
        }
        .front-cover-description {
          max-width: ${frontCover?.descriptionStyle?.maxWidth || '80%'};
          color: ${frontCover?.descriptionStyle?.color || '#4b5563'};
          font-size: ${frontCover?.descriptionStyle?.fontSize || '13pt'};
          text-align: ${frontCover?.descriptionStyle?.textAlign || 'center'};
          margin-top: ${frontCover?.descriptionStyle?.marginTop || '10mm'};
          font-style: ${frontCover?.descriptionStyle?.fontStyle || 'italic'};
          line-height: ${frontCover?.descriptionStyle?.lineHeight || '1.5'};
          word-break: break-word;
          margin-left: auto;
          margin-right: auto;
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

app.post('/api/create-checkout-session', async (req: Request, res: Response): Promise<any> => {
  try {
    const session = await stripe.checkout.sessions.create({
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
  } catch (err) {
    res.status(500).json({ message : 'Error creating checkout',error : err });
  }
})

app.get('/api/user-projects/:projectId', authMiddleware, async (req: Request, res: Response): Promise<any> => {
  const { projectId } = req.params;
  const userId = req.userId;

  if (!projectId || typeof projectId !== 'string') {
    return res.status(400).json({ message: 'Invalid projectId' });
  }

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const project = await prisma.loginUser.findFirst({
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
      ? (project.deadlines[0].actual_deadline ?? project.deadlines[0].calculate_date)
      : null;

    return res.status(200).json({
      project: {
        projectName: project.projectName,
        imageKey: project.imageKey,
        deadlineDate: deadline ? deadline.toISOString() : null,
      },
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/api/user-projects/:projectId', authMiddleware, async (req: Request, res: Response): Promise<any> => {
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
    const project = await prisma.loginUser.findFirst({
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
    const existingDeadline = await prisma.contributionDeadlines.findFirst({
      where: {
        projectId,
        deadline_enabled: true,
      },
    });

    if (!existingDeadline) {
      // Create a new deadline record
      await prisma.contributionDeadlines.create({
        data: {
          id: uuidv4(),
          projectId,
          actual_deadline: parsedDate,
          deadline_enabled: true,
        },
      });
    } else {
      // Update existing deadline
      await prisma.contributionDeadlines.update({
        where: { id: existingDeadline.id },
        data: {
          actual_deadline: parsedDate,
          updatedAt: new Date(), // Explicitly update timestamp
        },
      });
    }

    // Fetch updated project to return consistent response
    const updatedProject = await prisma.loginUser.findFirst({
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

    const deadline = (updatedProject?.deadlines?.length ?? 0) > 0
      ? (updatedProject?.deadlines?.[0]?.actual_deadline ?? updatedProject?.deadlines?.[0]?.calculate_date)
      : null;

    return res.status(200).json({
      project: {
        projectName: updatedProject?.projectName,
        imageKey: updatedProject?.imageKey,
        deadlineDate: deadline ? deadline.toISOString() : null,
      },
    });
  } catch (error) {
    console.error('Error updating project deadline:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.patch("/api/update-contribution/:contributionId", async (req: Request, res: Response): Promise<any> => {
  try {
    const { contributionId } = req.params;
    const { fillYourDetailsId } = req.body;

    if (!contributionId || !fillYourDetailsId) {
      return res.status(400).json({ error: "Missing contributionId or fillYourDetailsId" });
    }

    // Validate Contribution exists
    const contribution = await prisma.contribution.findUnique({
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
    const fillYourDetails = await prisma.fillYourDetails.findUnique({
      where: { id: fillYourDetailsId },
    });
    if (!fillYourDetails) {
      return res.status(400).json({ error: "FillYourDetails record not found" });
    }

    // Update Contribution with fillYourDetailsId
    const updatedContribution = await prisma.contribution.update({
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
  } catch (error) {
    console.error("Error updating contribution:", error);
    res.status(500).json({ error: "Failed to update contribution" });
  } finally {
    await prisma.$disconnect();
  }
});

app.post('/api/shipping-options', async (req : Request, res : Response): Promise<any> => {
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
    const shiprocketResponse = await axios.get(
      'https://apiv2.shiprocket.in/v1/external/courier/serviceability/',
      {
        params: queryParams,
        headers: {
          Authorization: `Bearer ${process.env.SHIPROCKET_API_TOKEN}`,
        },
      }
    );

    if (shiprocketResponse.data.status !== 200) {
      return res.status(400).json({ error: 'No shipping options available' });
    }

    // Map Shiprocket response to frontend format
    const shippingOptions = shiprocketResponse.data.data.available_courier_companies.map((courier : Courier) => ({
      id: courier.courier_company_id,
      name: courier.courier_name,
      amount: Math.round(courier.freight_charge * 100), // Convert to paise
      estimated_days: courier.estimated_delivery_days || '3-5', // Fallback if not provided
    }));
    console.log('Shipping options:', shippingOptions);
    res.json({ shipping_options: shippingOptions });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching shipping options:', error.response?.data || error.message);
    } else {
      console.error('Error fetching shipping options:', error);
    }
    res.status(400).json({ error: 'Unable to fetch shipping options' });
  }
});

app.post('/api/create-order', async (req : Request, res : Response) : Promise<any> => {
  const { project_id, shipping_address, shipping_option, amount } = req.body;
  console.log('requestBody',req.body);
  try {
    // Validate inputs
    if (!project_id || !shipping_address || !shipping_option || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create Razorpay order
    console.log(`amount : ${amount}, receipt : order_${project_id}_${Date.now()}, notes : {${project_id},${shipping_option} }`)
    const order = await razorpay.orders.create({
      amount: amount, // Amount in paise (e.g., 5000 paise = ₹50)
      currency: 'INR',
      receipt: `od_${project_id}`,
      notes: {
        project_id,
        shipping_option,
      },
    });
    console.log('GET Order',order);
    const orderResponse = res.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
    console.log('orderResponse',orderResponse);
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.post('/api/verify-payment', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature,project_id,amount,shipping_address } = req.body;

  try {
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || (() => { throw new Error("RAZORPAY_KEY_SECRET is not defined in the environment variables"); })())
      .update(body)
      .digest('hex');

    const isSignatureValid = expectedSignature === razorpay_signature;
    const paymentDetails = await prisma.payment.create({
      data: {
        orderId : razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature : razorpay_signature,
        project_id,
        amount,
        verified: isSignatureValid,
        error_message: isSignatureValid ? null : 'Invalid signature',
        shipping_address: shipping_address ? JSON.stringify(shipping_address) : null
      },
    })
    if(isSignatureValid){
      res.json({ success: true });
    }else {
      res.status(400).json({ success: false, error: 'Invalid signature' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    await prisma.payment.create({
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
});

app.get('/api/order', async (req: Request, res: Response) : Promise<any> => {
  const { order_id } = req.query;
  console.log('order_id',order_id);
  if(!order_id){
    return res.status(400).json({ error: 'Missing order_id' });
  }
  try {
    const order = await prisma.payment.findFirst({
      where: { orderId: order_id as string },
      select: {
        orderId: true,
        paymentId: true,
        signature: true,
        project_id: true,
        amount: true,
        error_message : true,
        verified: true, 
        shipping_address: true  
      },
    });
    console.log('Find Order',order);
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
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

app.post('/api/print/:projectId', authMiddleware, async (req: Request, res: Response): Promise<any> => {
  const { projectId } = req.params;
  const { order_id } = req.body;

  if (!projectId || typeof projectId !== 'string' || !order_id || typeof order_id !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid projectId or order_id' });
  }

  try {
    // Step 1: Fetch order details to get shipping_address
    const order = await prisma.payment.findFirst({
      where: { orderId: order_id, project_id: projectId },
      select: { shipping_address: true },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const shipping_address = order.shipping_address ? JSON.parse(order.shipping_address) : null;

    // Step 2: Fetch project details to get totalPages
    const project = await prisma.loginUser.findUnique({
      where: { id: projectId },
      select: { totalPages: true },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Step 3: Fetch PDF from /api/pdf/:projectId (internal call)
    const pdfResponse = await axios.get(`${process.env.INTERNAL_BACKEND_URL || 'http://localhost:8080'}/api/pdf/${projectId}`, {
      responseType: 'arraybuffer',
    });

    // Step 4: Authenticate with Lulu API
    const luluTokenResponse = await axios.post('https://api.lulu.com/auth/v1/token', {
      grant_type: 'client_credentials',
      client_id: process.env.LULU_API_KEY,
      client_secret: process.env.LULU_API_SECRET,
    });
    const luluAccessToken = luluTokenResponse.data.access_token;

    // Step 5: Upload PDF to Lulu
    const formData = new FormData();
    formData.append('file', new Blob([Buffer.from(pdfResponse.data)]), `book-${projectId}.pdf`);

    const uploadResponse = await axios.post('https://api.lulu.com/files/', formData, {
      headers: {
        Authorization: `Bearer ${luluAccessToken}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    const fileId = uploadResponse.data.id;

    // Step 6: Create print job
    const printJobResponse = await axios.post(
      'https://api.lulu.com/print-jobs/',
      {
        line_items: [
          {
            page_count: project.totalPages || 100, // Use totalPages or fallback
            product: 'PAPERBACK_60X90_40', // 6x9 paperback, adjust as needed
            file: fileId,
          },
        ],
        shipping_address: {
          name: shipping_address?.name || 'Customer Name',
          street_line_1: shipping_address?.line1 || '123 Main St',
          city: shipping_address?.city || 'Anytown',
          state_code: shipping_address?.state || 'NY',
          country_code: shipping_address?.country || 'US',
          postal_code: shipping_address?.postal_code || '12345',
        },
        shipping_level: 'EXPRESS', // Adjust as needed
      },
      {
        headers: {
          Authorization: `Bearer ${luluAccessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Step 7: Store print job in PrintJob model
    const printJob = await prisma.printJob.create({
      data: {
        lulu_job_id: printJobResponse.data.id,
        paymentId: order_id,
        projectId
      },
    });

    res.json({ success: true, print_job_id: printJobResponse.data.id });
  } catch (error) {
    console.error('Error creating print job:', error);
    res.status(500).json({ error: 'Failed to create print job' });
  }
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Listening to the server
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});