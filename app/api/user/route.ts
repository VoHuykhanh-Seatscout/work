import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  console.log("Incoming request headers:", req.headers);

  const session = await getServerSession(authOptions);
  console.log("DEBUG: Session Data:", session);

  if (!session?.user?.email) {
    console.error("Unauthorized Access - No session found");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  console.log("DEBUG: User from DB:", user);

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt ? user.createdAt.toISOString() : null, // ✅ Safer handling
  });
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.error("Unauthorized Access - No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, profileImage } = await req.json();
    
    console.log("Updating User Profile:", { name, profileImage });

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { 
        name, 
        profileImage: profileImage ?? null, // ✅ Ensure it's either a string or null
      },
      select: { id: true, name: true, email: true, profileImage: true },
    });

    return NextResponse.json({ message: "Profile updated", user: updatedUser });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
