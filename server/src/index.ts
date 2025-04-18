import express from "express";
import cors from "cors";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
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

//store the user info
app.post("/api/users", async (req, res) => {
  {
    const { firstName, lastName, email } = req.body;
    if (!firstName || !lastName || !email) {
      res.status(400).json({ message: "All fields are required" });
    }
    const user = await prisma.user.create({
      data: {
        first_name: firstName,
        last_name: lastName,
        email,
      },
    });
    res.status(200).send({
      message: "User created successfully",
      user,
    });
  }
});

//Get the event type and description

app.get("/event-type", async (req, res) => {
  const { name } = req.query;
  if (!name || typeof name !== "string") {
    res.status(400).json({ error: "Event type name is required" });
  }

  try {
    const eventType = await prisma.eventType.findUnique({
      where: { name: name as string },
    });

    if (!eventType) {
      res.status(404).json({ error: "Event type not found" });
    }

    if (eventType) {
      res.json({ description: eventType.description });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
