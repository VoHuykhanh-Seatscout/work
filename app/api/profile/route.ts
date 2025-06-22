import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Schema for validating the request body
const profileSchema = z.object({
  university: z.string().min(1, "University is required"),
  degree: z.string().min(1, "Degree is required"),
  graduationYear: z.number().min(1900).max(new Date().getFullYear() + 5),
  linkedin: z.string().url().nullable().optional(),
  github: z.string().url().nullable().optional(),
  skills: z.array(z.string()).optional(),
  aboutMe: z.string().nullable().optional(),
  resume: z.string().url().nullable().optional(),
  name: z.string().min(1, "Name is required"),
  tagline: z.string().nullable().optional(),
  shortIntroduction: z.string().nullable().optional(),
  image: z.string().url().nullable().optional(), // Allow null values
});

// Helper function to get the authenticated user ID
async function getAuthUserId(req: NextRequest) {
  const session = await getServerSession(authOptions);
  return session?.user?.id; // Assuming your session user object has an `id` field
}

// GET: Fetch current user's profile
export async function GET(req: NextRequest) {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        profileImage: true, // Ensure this field is included
        tagline: true,
        shortIntroduction: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch student profile data
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Combine user and profile data
    const combinedData = {
      ...user,
      ...profile,
      profileImage: user.profileImage, // Include the profileImage from the User model
    };

    console.log("Combined Data:", combinedData); // Log the combined data
    return NextResponse.json(combinedData);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching profile:", error.message);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
    console.error("Unknown error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT: Update current user's profile + user info
export async function PUT(req: NextRequest) {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    console.log("Request Body:", body); // Log the request body

    // Convert empty strings to null for optional fields
    ["linkedin", "github", "resume", "aboutMe", "tagline", "shortIntroduction", "image"].forEach((field) => {
      if (body[field] === "") {
        body[field] = null;
      }
    });

    const validatedData = profileSchema.parse(body);
    console.log("Validated Data:", validatedData); // Log the validated data

    // Fetch the existing user data to preserve the current profileImage
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { profileImage: true },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Split data for user and studentProfile
    const {
      name,
      image: profileImage, // Rename `image` to `profileImage`
      tagline,
      shortIntroduction,
      ...profileData
    } = validatedData;

    // Update User model
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        profileImage: profileImage ?? existingUser.profileImage, // Preserve existing profileImage if no new image is provided
        tagline,
        shortIntroduction,
      },
    });
    console.log("Updated User:", updatedUser); // Log the updated user

    // Upsert studentProfile
    const updatedProfile = await prisma.studentProfile.upsert({
      where: { userId },
      update: profileData,
      create: { userId, ...profileData },
    });

    // Return updated user data to the client
    return NextResponse.json({
      user: updatedUser,
      profile: updatedProfile,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation Error:", error.errors);
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    if (error instanceof Error) {
      console.error("Error updating profile:", error.message);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
    console.error("Unknown error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}