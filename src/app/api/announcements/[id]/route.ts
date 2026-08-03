import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { announcementUpdateSchema } from "@/lib/validation";
import { ZodError } from "zod";

interface Params {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: Params) {
  const announcement = await prisma.announcement.findUnique({
    where: { id: params.id },
    include: { grade: true, files: true },
  });

  if (!announcement) {
    return NextResponse.json({ error: "الإعلان غير موجود" }, { status: 404 });
  }

  return NextResponse.json(announcement);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = announcementUpdateSchema.parse(body);

    const existing = await prisma.announcement.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "الإعلان غير موجود" }, { status: 404 });
    }

    const updated = await prisma.announcement.update({
      where: { id: params.id },
      data,
      include: { grade: true, files: true },
    });

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: "بيانات غير صالحة", details: err.errors }, { status: 400 });
    }
    console.error("PATCH /api/announcements/[id] failed:", err);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const existing = await prisma.announcement.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "الإعلان غير موجود" }, { status: 404 });
  }

  await prisma.announcement.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
