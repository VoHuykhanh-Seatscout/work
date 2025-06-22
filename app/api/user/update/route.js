import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, profileImage } = await req.json(); // Receive profileImage

    const existingUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user data in Prisma
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { 
        ...(name && { name: name.trim() }), 
        ...(profileImage && { profileImage }) 
      },
      select: { // Ensure profileImage is included in the response
        id: true,
        name: true,
        email: true,
        profileImage: true // Make sure to return this field
      }
    });

    console.log("✅ Updated User Data:", updatedUser); // Debug log

    return NextResponse.json({ 
      message: "Profile updated successfully", 
      user: updatedUser // Now includes profileImage
    });

  } catch (error) {
    console.error("❌ Profile Update Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
