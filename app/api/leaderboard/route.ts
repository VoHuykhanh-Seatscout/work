// app/api/leaderboard/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // First, verify the Prisma connection with a simple query
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Database connection successful");

    // Try the simplest possible query first
    const testUsers = await prisma.user.findMany({
      select: { id: true },
      take: 1
    });
    console.log("✅ Test users query successful:", testUsers);

    // Then try your actual query with error handling
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
        points: true,
      },
      orderBy: {
        points: 'desc',
      },
      take: 100,
    });

    const rankedUsers = users.map((user, index) => ({
      ...user,
      rank: index + 1,
      points: user.points || 0 // Ensure points has a default value
    }));

    return NextResponse.json(rankedUsers);
  } catch (error) {
    console.error("❌ FULL ERROR DETAILS:", error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch leaderboard data',
        details: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}