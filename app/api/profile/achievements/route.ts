import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch awards data
    const awards = await prisma.prize.findMany({
      where: {
        winner: {
          userId: session.user.id
        }
      },
      include: {
        competition: true
      }
    });

    // Fetch competitions participated count
    const competitionsParticipated = await prisma.registration.count({
      where: {
        userId: session.user.id
      }
    });

    // Fetch projects
    const projects = await prisma.project.findMany({
      where: {
        userId: session.user.id
      }
    });

    // Fetch competitions data
    const competitions = await prisma.registration.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        competition: true
      }
    });

    // Format the competitions data
    const formattedCompetitions = competitions.map(reg => ({
      id: reg.competition.id,
      title: reg.competition.title,
      description: reg.competition.description,
      startDate: reg.competition.startDate.toISOString(),
      endDate: reg.competition.endDate.toISOString(),
      prize: reg.competition.prize,
      categories: reg.competition.categories,
      coverImage: reg.competition.coverImage
    }));

    // Format the awards data
    const formattedAwards = awards.map(award => ({
      id: award.id,
      name: award.name,
      description: award.description,
      position: award.position,
      competitionName: award.competition.title
    }));

    return NextResponse.json({
      awards: formattedAwards,
      awardsCount: awards.length,
      competitionsParticipated,
      projects,
      competitions: formattedCompetitions
    });

  } catch (error) {
    console.error("Error fetching achievements:", error);
    return NextResponse.json(
      { error: "Failed to fetch achievements" },
      { status: 500 }
    );
  }
}