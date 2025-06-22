// app/api/business/dashboard/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface DemographicData {
  university: string | null;
  count: bigint; // or number if you're using parseInt
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch all competitions organized by this user
    const competitions = await prisma.competition.findMany({
      where: { organizerId: userId },
      include: {
        registrations: true,
      },
      orderBy: {
        startDate: 'desc'
      }
    });

    // Calculate total competitions
    const totalCompetitions = competitions.length;

    // Calculate active competitions (where current date is between start and end date)
    const now = new Date();
    const activeCompetitions = competitions.filter(comp => {
      const startDate = new Date(comp.startDate);
      const endDate = new Date(comp.endDate);
      return startDate <= now && endDate >= now;
    }).length;

    // Get all unique participants across all competitions
    const uniqueParticipants = await prisma.registration.findMany({
      where: {
        competition: { organizerId: userId }
      },
      distinct: ['userId'],
      select: { userId: true }
    });
    const totalParticipants = uniqueParticipants.length;

    // Get participant demographics (universities)
    const participantDemographics = await prisma.$queryRaw<DemographicData[]>`
      SELECT sp.university, COUNT(*) as count
      FROM "Registration" r
      JOIN "Competition" c ON r."competitionId" = c.id
      JOIN "User" u ON r."userId" = u.id
      LEFT JOIN "StudentProfile" sp ON u.id = sp."userId"
      WHERE c."organizerId" = ${userId}
      GROUP BY sp.university
      ORDER BY count DESC
      LIMIT 5
    `;

    // Format competition data
    const formattedCompetitions = competitions.map(comp => ({
      id: comp.id,
      title: comp.title,
      registrations: comp.registrations.length,
      startDate: comp.startDate,
      endDate: comp.endDate
    }));

    return NextResponse.json({
      totalCompetitions,
      activeCompetitions,
      totalParticipants,
      competitions: formattedCompetitions,
      participantDemographics: participantDemographics.map(d => ({
        university: d.university || 'Unknown',
        count: Number(d.count) // Convert bigint to number if needed
      }))
    });
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}