// /api/student/profile.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { university, degree, graduationYear, skills, resume, aboutMe, userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const gradYear = graduationYear ? parseInt(graduationYear) : null;

    const profile = await prisma.studentProfile.upsert({
      where: { userId },
      update: {
        university,
        degree,
        graduationYear: gradYear,
        skills,
        resume,
        aboutMe,
      },
      create: {
        userId,
        university,
        degree,
        graduationYear: gradYear,
        skills,
        resume,
        aboutMe,
      },
    });

    return NextResponse.json({ success: true, profile }, { status: 200 });

  } catch (error) {
    console.error("Profile error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
