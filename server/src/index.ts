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
    methods: ["GET", "POST", "PUT", "DELETE","PATCH", "OPTIONS"],
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
//Stroring the login inforation
app.post("/api/users",authMiddleware,async (req: Request, res: Response): Promise<any> => {
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
  }
);
// Get projects for the logged-in user
app.get("/api/user-projects",authMiddleware,async (req: Request, res: Response): Promise<any> => {
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

app.patch('/api/users/:projectId/upload-image', async (req: Request, res: Response) : Promise<any> => {  //Need to send token for future
  const { projectId } = req.params;
  const { imageKey, uploadUrl } = req.body;
  console.log(projectId, imageKey, uploadUrl);
  if (!imageKey || !uploadUrl) {
    return res.status(400).json({ error: 'Missing imageKey or uploadUrl' });
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
    res.json({ message: 'Image updated successfully', project: updatedProject });
  } catch (error) {
    console.error('Failed to update image info:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


//store the user info
app.post("/api/user-information",async (req: Request, res: Response): Promise<any> => {
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

//Fill your information page
app.post(
  "/api/fill-your-info",
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

// Get project image by project ID
// app.get("/api/get-image/:projectId", async (req: Request, res: Response) : Promise<any> => {
//   const { projectId } = req.params;

//   try {
//     const project = await prisma.loginUser.findUnique({
//       where: { id: projectId },
//     });

//     if (!project) {
//       return res.status(404).json({ error: "Project not found" });
//     }

//     const imageUrl = `https://${process.env.R2_BUCKET_NAME}.r2.cloudflarestorage.com/${projectId}`;
//     res.redirect(imageUrl);
//   } catch (error) {
//     console.error("Error fetching project image:", error);
//     res.status(500).json({ error: "Failed to fetch project image" });
//   }
// });

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
