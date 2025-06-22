import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // ✅ Step 1: Read Request Body
    const body = await req.json();
    console.log("🔹 Received Body:", body);

    // ✅ Step 2: Destructure Body & Validate Input
    const { competitionId, name, email, image } = body ?? {}; // Default to empty object
    console.log(`📩 Extracted - Name: ${name} | Email: ${email} | Image: ${image}`);

    if (!email || !competitionId) {
      console.error("❌ Missing required fields (email or competitionId)");
      return NextResponse.json({ error: "Email and Competition ID are required" }, { status: 400 });
    }

    // ✅ Step 3: Check If User Exists
    let user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, profileImage: true },
    });

    // ✅ Step 4: Create New User If Not Found
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name?.trim() || "Unnamed User", // Default name if missing
          profileImage: image?.trim() || null, // Default null if missing
        },
        select: { id: true, name: true, email: true, profileImage: true },
      });

      console.log("✅ New user created:", user);
    } else {
      console.log("ℹ️ User already exists:", user);
    }

    // ✅ Step 5: Check If User Is Already Registered for Competition
    const existingRegistration = await prisma.registration.findFirst({
      where: {
        userId: user.id,
        competitionId: competitionId,
      },
    });

    if (existingRegistration) {
      console.log("⚠️ User is already registered for this competition.");
      return NextResponse.json({ message: "User is already registered" }, { status: 200 });
    }

    // ✅ Step 6: Register User for the Competition
    const newRegistration = await prisma.registration.create({
      data: {
        userId: user.id,
        competitionId: competitionId,
      },
    });

    console.log("✅ User successfully registered:", newRegistration);

    // ✅ Step 7: Return Success Response
    return NextResponse.json({
      message: "User registered successfully",
      registration: newRegistration,
    });

  } catch (error) {
    console.error("🚨 Error registering user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
