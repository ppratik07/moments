import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { Readable } from "stream";

let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      region: "auto",
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return s3Client;
}

const uploadDir = path.join(process.cwd(), "uploads");

export function useLocalFileStorage(): boolean {
  const flag = process.env.USE_LOCAL_FILE_STORAGE?.toLowerCase();
  if (flag === "true" || flag === "1") return true;
  if (flag === "false" || flag === "0") return false;
  if (process.env.NODE_ENV === "development") return true;
  const endpoint = (process.env.R2_ENDPOINT ?? "").toLowerCase();
  return endpoint.includes("127.0.0.1") || endpoint.includes("localhost");
}

export function localUploadDir(): string {
  return uploadDir;
}

export async function ensureUploadDir(): Promise<void> {
  await fs.mkdir(uploadDir, { recursive: true });
}

export function publicImageUrlForKey(key: string): string {
  if (useLocalFileStorage()) {
    const base =
      process.env.R2_PUBLIC_URL?.replace(/\/$/, "") ||
      `http://localhost:${process.env.PORT || 8080}/uploads`;
    return `${base}/${key}`;
  }
  const base =
    process.env.R2_PUBLIC_URL?.replace(/\/$/, "") ||
    "https://pub-7e95bf502cc34aea8d683b14cb66fc8d.r2.dev/memorylane";
  return `${base}/${key}`;
}

export async function putObject(
  key: string,
  body: Buffer,
  contentType: string
): Promise<void> {
  if (useLocalFileStorage()) {
    await ensureUploadDir();
    await fs.writeFile(path.join(uploadDir, key), body);
    return;
  }
  await getS3Client().send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}

export async function deleteObject(key: string): Promise<void> {
  if (useLocalFileStorage()) {
    await fs.unlink(path.join(uploadDir, key)).catch((err: NodeJS.ErrnoException) => {
      if (err.code !== "ENOENT") throw err;
    });
    return;
  }
  await getS3Client().send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
    })
  );
}

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export async function getObjectBuffer(key: string): Promise<Buffer> {
  if (useLocalFileStorage()) {
    return fs.readFile(path.join(uploadDir, key));
  }
  const response = await getS3Client().send(
    new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
    })
  );
  const body = response.Body;
  if (!body) throw new Error(`Missing object body for key ${key}`);
  if (Buffer.isBuffer(body)) return body;
  if (body instanceof Readable) return streamToBuffer(body);
  const bytes = await body.transformToByteArray();
  return Buffer.from(bytes);
}
