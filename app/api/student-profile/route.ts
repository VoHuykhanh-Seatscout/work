// app/api/student-profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { university, degree, graduationYear, skills, resume, aboutMe, userId } = await req.json();

    // Validate userId exists and is in correct format
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: "Valid user ID is required" },
        { status: 400 }
      );
    }

    // Verify the user exists first
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (!userExists) {
      return NextResponse.json(
        { error: "User not found - cannot create profile" },
        { status: 404 }
      );
    }

    // Prepare data with proper types
    const profileData = {
      university: university || null,
      degree: degree || null,
      graduationYear: graduationYear ? parseInt(graduationYear) : null,
      skills: Array.isArray(skills) ? skills : [],
      resume: resume || null,
      aboutMe: aboutMe || null
    };

    // Create or update profile
    const profile = await prisma.studentProfile.upsert({
      where: { userId },
      update: profileData,
      create: {
        userId,
        ...profileData
      }
    });

    return NextResponse.json({ success: true, profile }, { status: 200 });

  } catch (error) {
    console.error("Profile creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}