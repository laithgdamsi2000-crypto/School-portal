import { z } from "zod";

/**
 * Every API route parses its input through one of these schemas BEFORE
 * touching the database or the filesystem. This is the primary defense
 * against malformed input, oversized payloads, and injection-adjacent
 * attacks (Prisma itself prevents SQL injection via parameterized
 * queries — this layer stops bad data from ever reaching that point).
 */

export const homeworkCreateSchema = z.object({
  title: z.string().min(3, "العنوان قصير جداً").max(200),
  description: z.string().min(5, "الوصف قصير جداً").max(5000),
  status: z.enum(["NORMAL", "IMPORTANT"]).default("NORMAL"),
  gradeId: z.string().cuid("الصف غير صالح"),
  subjectId: z.string().cuid("المادة غير صالحة"),
  teacherId: z.string().cuid().optional().nullable(),
  assignedDate: z.coerce.date(),
  dueDate: z.coerce.date(),
}).refine((data) => data.dueDate >= data.assignedDate, {
  message: "تاريخ التسليم يجب أن يكون بعد تاريخ التكليف",
  path: ["dueDate"],
});

export const homeworkUpdateSchema = homeworkCreateSchema.partial();

export const announcementCreateSchema = z.object({
  title: z.string().min(3).max(200),
  content: z.string().min(5).max(5000),
  scope: z.enum(["SCHOOL_WIDE", "GRADE_SPECIFIC"]),
  isImportant: z.boolean().default(false),
  gradeId: z.string().cuid().optional().nullable(),
}).refine(
  (data) => data.scope === "SCHOOL_WIDE" || !!data.gradeId,
  { message: "يجب تحديد الصف عند اختيار إعلان خاص بصف معين", path: ["gradeId"] }
);

export const announcementUpdateSchema = announcementCreateSchema.partial();

export const gradeCreateSchema = z.object({
  name: z.string().min(2).max(50),
  slug: z.string().regex(/^[a-z0-9-]+$/, "المعرف يجب أن يحتوي أحرف إنجليزية وأرقام وشرطات فقط"),
  order: z.number().int().default(0),
});

export const subjectCreateSchema = z.object({
  name: z.string().min(2).max(100),
  gradeId: z.string().cuid().optional().nullable(),
});

export const teacherCreateSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
});

export const searchQuerySchema = z.object({
  q: z.string().max(200).default(""),
  gradeId: z.string().cuid().optional(),
  subjectId: z.string().cuid().optional(),
  teacherId: z.string().cuid().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

// File upload constraints — enforced in lib/upload.ts using these constants
export const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const MAX_FILE_SIZE_MB = 15;
