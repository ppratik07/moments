import express from "express";
import cors from "cors";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { authMiddleware } from "./middleware/middleware";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(
  cors({
    origin: process.env.FRONTEND_URL, //allowing from frontend
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

//Get the event type and description
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
//Stroring the login inforation
app.post(
  "/api/users",
  authMiddleware,
  async (req: Request, res: Response): Promise<any> => {
    const { projectName, bookName, dueDate, eventType, eventDescription } =
      req.body;
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
  }
);

//getting the image url and storing it in r2 storage
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
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 }); // 60 sec
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
    // Step 1: Delete the object from R2
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

// Get projects for the logged-in user
app.get(
  "/api/user-projects",
  authMiddleware,
  async (req: Request, res: Response): Promise<any> => {
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
          eventDescription: true, //Need to fix this later
          imageKey: true,
          uploadUrl: true,
        },
      });
      return res.status(200).json({ projects });
    } catch (error) {
      console.error("Error fetching user projects:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

app.patch(
  "/api/users/:projectId/upload-image",
  async (req: Request, res: Response): Promise<any> => {
    //Need to send token for future
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
  }
);

//store the user info
app.post(
  "/api/user-information",
  async (req: Request, res: Response): Promise<any> => {
    {
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
    }
  }
);

app.post("/api/save-contribution", async (req, res): Promise<any> => {
  try {
    const { projectId, signature, pages } = req.body;

    // Validate input
    if (!projectId || !signature || !pages) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    // Validate pages data
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
    // Create contribution and nested pages/components
    const contribution = await prisma.contribution.create({
      data: {
        projectId,
        signature,
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
              images: page.images, // Already filtered to contain only strings
              message: page.message,
              components: {
                create: page.components.map((component) => ({
                  type: component.type,
                  position: component.position || null,
                  size: component.size,
                  styles: component.styles || null,
                  editor: component.editor || null,
                  value: component.value,
                  imageUrl: component.image_url,
                  original: component.original || null,
                })),
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

//Fill your information page
app.post(
  "/api/submit-information",
  async (req: Request, res: Response): Promise<any> => {
    const {
      firstName,
      lastName,
      email,
      relationship,
      excludeOnline,
      notifyMe,
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
  }
);
//Get the contribution count
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
app.get( "/api/deadline/:projectId",async (req: Request, res: Response): Promise<any> => {  //Authenticate authorization
    const { projectId } = req.params;

    if (!projectId || typeof projectId !== "string") {
      return res.status(400).json({ message: "Invalid projectId" });
    }

    try {
      // // Verify user authentication
      // const token = await getToken({ req });
      // if (!token) {
      //   return res.status(401).json({ message: "Unauthorized" });
      // }

      // Fetch the deadline for the project
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

      // Return the deadline (prefer actual_deadline if available, otherwise calculate_date)
      const deadlineDate = deadline.actual_deadline ?? deadline.calculate_date;

      return res.status(200).json({
        deadline: deadlineDate ? deadlineDate.toISOString() : null,
        deadline_enabled: deadline.deadline_enabled,
      });
    } catch (error) {
      console.error("Error fetching deadline:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
