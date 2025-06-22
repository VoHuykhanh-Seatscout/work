import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  console.log("DEBUG: Session Data:", session);

  if (!session?.user?.email) {
    console.error("Unauthorized Access - No session found");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      console.error("User not found for email:", session.user.email);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userCompetitions = await prisma.registration.findMany({
      where: { userId: user.id },
      include: { competition: true },
    });

    console.log("DEBUG: Fetched User Competitions:", userCompetitions);

    return NextResponse.json(userCompetitions, { status: 200 });
  } catch (error) {
    console.error("Error fetching user competitions:", error);
    return NextResponse.json({ error: "Failed to fetch user competitions" }, { status: 500 });
  }
}
