import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminCreateSchema } from "@/lib/validation";
import { ZodError } from "zod";

// Never select passwordHash -- nothing in the UI needs it, ever.
const ADMIN_SELECT = { id: true, name: true, email: true, isActive: true } as const;

/** GET /api/admins — admin only, full list of admin accounts. */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const admins = await prisma.admin.findMany({
    orderBy: { name: "asc" },
    select: ADMIN_SELECT,
  });
  return NextResponse.json(admins);
}

/** POST /api/admins — admin only. Any admin can add another admin. */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, email, password } = adminCreateSchema.parse(body);

    const passwordHash = await hashPassword(password);
    const admin = await prisma.admin.create({
      data: { name, email: email.toLowerCase().trim(), passwordHash },
      select: ADMIN_SELECT,
    });
    return NextResponse.json(admin, { status: 201 });
  } catch (err: any) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: "بيانات غير صالحة", details: err.errors }, { status: 400 });
    }
    if (err.code === "P2002") {
      return NextResponse.json({ error: "هذا البريد الإلكتروني مستخدم بالفعل" }, { status: 409 });
    }
    console.error("POST /api/admins failed:", err);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
