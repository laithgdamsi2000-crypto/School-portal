import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminUpdateSchema } from "@/lib/validation";
import { ZodError } from "zod";

const ADMIN_SELECT = { id: true, name: true, email: true, isActive: true } as const;

interface Params {
  params: { id: string };
}

/**
 * PATCH /api/admins/[id] — admin only. The only supported change is
 * isActive: deactivating revokes login immediately (checked in
 * auth.ts's authorize callback), without deleting the row -- Admin is
 * referenced by Homework/Announcement.createdBy with no cascade, so a
 * hard delete would break historical attribution. Two guardrails so an
 * admin can't lock everyone (including themselves) out:
 *   - can't deactivate your own account from this list
 *   - can't deactivate the last remaining active admin
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const currentAdminId = (session.user as any).id;
  if (params.id === currentAdminId) {
    return NextResponse.json({ error: "لا يمكنك تعديل حالة حسابك الخاص من هنا" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { isActive } = adminUpdateSchema.parse(body);

    const existing = await prisma.admin.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "الحساب غير موجود" }, { status: 404 });
    }

    if (!isActive) {
      const activeCount = await prisma.admin.count({ where: { isActive: true } });
      if (activeCount <= 1) {
        return NextResponse.json({ error: "لا يمكن إيقاف آخر حساب إداري نشط" }, { status: 409 });
      }
    }

    const updated = await prisma.admin.update({
      where: { id: params.id },
      data: { isActive },
      select: ADMIN_SELECT,
    });
    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
    }
    console.error("PATCH /api/admins/[id] failed:", err);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
