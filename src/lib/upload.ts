import { put, del } from "@vercel/blob";
import { randomUUID } from "crypto";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE_MB } from "./validation";

export class UploadError extends Error {}

export interface UploadedFileResult {
  fileName: string; // original name, shown to users
  fileUrl: string; // public URL to serve (a Vercel Blob URL, not a local path)
  fileType: "image" | "pdf" | "docx" | "excel";
  fileSizeKb: number;
}

function classifyMimeType(mime: string): "image" | "pdf" | "docx" | "excel" {
  if (mime.startsWith("image/")) return "image";
  if (mime === "application/pdf") return "pdf";
  if (mime === "application/vnd.ms-excel" || mime === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
    return "excel";
  }
  return "docx";
}

/**
 * Handles a single uploaded file end-to-end:
 *  1. Rejects disallowed MIME types (allowlist, not blocklist — safer default).
 *  2. Rejects oversized files before they're uploaded.
 *  3. Generates a random filename (never trusts the client-supplied name for
 *     the actual stored path) to prevent path traversal and overwrite attacks.
 *  4. Uploads to Vercel Blob.
 *
 * Previously wrote to the local filesystem (public/uploads/) via
 * fs.writeFile -- that works in local dev but silently fails in
 * production on Vercel, where everything outside /tmp is read-only at
 * runtime. Every upload attempt (homework/announcement attachments,
 * grade schedules, general files) has failed there since this feature
 * was first deployed. This is why file uploads need the
 * BLOB_READ_WRITE_TOKEN env var set up (see .env.example) -- without
 * it, uploads fail immediately with a clear auth error instead of a
 * confusing filesystem one.
 */
export async function uploadFile(
  file: File,
  subfolder: "homework" | "announcements" | "schedules" | "general"
): Promise<UploadedFileResult> {
  if (!ALLOWED_FILE_TYPES.includes(file.type as any)) {
    throw new UploadError(
      "نوع الملف غير مسموح به. الأنواع المسموحة: صور، PDF، Word، Excel"
    );
  }

  const sizeMb = file.size / (1024 * 1024);
  if (sizeMb > MAX_FILE_SIZE_MB) {
    throw new UploadError(`حجم الملف يتجاوز الحد الأقصى (${MAX_FILE_SIZE_MB} ميجابايت)`);
  }

  const dotIndex = file.name.lastIndexOf(".");
  const ext = dotIndex >= 0 ? file.name.slice(dotIndex) : "";
  const blobPath = `${subfolder}/${randomUUID()}${ext}`;

  const blob = await put(blobPath, file, {
    access: "public",
    contentType: file.type,
  });

  return {
    fileName: file.name, // original name preserved for display/download only
    fileUrl: blob.url,
    fileType: classifyMimeType(file.type),
    fileSizeKb: Math.round(file.size / 1024),
  };
}

/**
 * Best-effort delete from Blob storage -- not fatal if it fails (file
 * already gone, transient network error). The DB row is always the
 * source of truth for whether a file "exists" from the app's
 * perspective; this just prevents orphaned blobs from accumulating.
 */
export async function deleteUploadedFile(fileUrl: string): Promise<void> {
  try {
    await del(fileUrl);
  } catch (err) {
    console.error("deleteUploadedFile failed (non-fatal):", err);
  }
}
