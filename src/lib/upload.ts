import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE_MB } from "./validation";

export class UploadError extends Error {}

export interface UploadedFileResult {
  fileName: string; // original name, shown to users
  fileUrl: string; // public path to serve
  fileType: "image" | "pdf" | "docx";
  fileSizeKb: number;
}

function classifyMimeType(mime: string): "image" | "pdf" | "docx" {
  if (mime.startsWith("image/")) return "image";
  if (mime === "application/pdf") return "pdf";
  return "docx";
}

/**
 * Handles a single uploaded file end-to-end:
 *  1. Rejects disallowed MIME types (allowlist, not blocklist — safer default).
 *  2. Rejects oversized files before they're written to disk.
 *  3. Generates a random filename (never trusts the client-supplied name for
 *     the actual stored path) to prevent path traversal and overwrite attacks.
 *  4. Writes to /public/uploads in dev.
 *
 * PRODUCTION NOTE: replace the writeFile/mkdir block with a call to your
 * object storage provider (Vercel Blob, S3, etc). The function signature
 * and return type stay the same, so nothing else in the app changes.
 */
export async function uploadFile(
  file: File,
  subfolder: "homework" | "announcements" | "schedules" | "general"
): Promise<UploadedFileResult> {
  if (!ALLOWED_FILE_TYPES.includes(file.type as any)) {
    throw new UploadError(
      "نوع الملف غير مسموح به. الأنواع المسموحة: صور، PDF، Word"
    );
  }

  const sizeMb = file.size / (1024 * 1024);
  if (sizeMb > MAX_FILE_SIZE_MB) {
    throw new UploadError(`حجم الملف يتجاوز الحد الأقصى (${MAX_FILE_SIZE_MB} ميجابايت)`);
  }

  const ext = path.extname(file.name).toLowerCase();
  const safeStoredName = `${randomUUID()}${ext}`;

  const uploadDir = path.join(process.cwd(), "public", "uploads", subfolder);
  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, safeStoredName), buffer);

  return {
    fileName: file.name, // original name preserved for display/download only
    fileUrl: `/uploads/${subfolder}/${safeStoredName}`,
    fileType: classifyMimeType(file.type),
    fileSizeKb: Math.round(file.size / 1024),
  };
}
