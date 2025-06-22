import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const currentDate = new Date();

    console.log('Fetching stats from database...');
    
    const [
      activeCompetitions,
      activeTalkshows,
      activeEvents,
      totalUsers,
      totalPartners
    ] = await Promise.all([
      prisma.competition.count({
        where: { endDate: { gt: currentDate } }
      }),
      prisma.talkshow.count({
        where: { date: { gt: currentDate } }
      }),
      prisma.event.count({
        where: {
          OR: [
            { endDate: { gt: currentDate } },
            { endDate: null, startDate: { gt: currentDate } }
          ]
        }
      }),
      prisma.user.count({
        where: { role: { not: 'ADMIN' } }
      }),
      prisma.user.count({
        where: { role: 'BUSINESS' }
      })
    ]);

    const stats = {
      activeChallenges: activeCompetitions + activeTalkshows + activeEvents,
      members: totalUsers,
      partners: totalPartners,
      jobs: 45 // Placeholder
    };

    console.log('Stats fetched successfully:', stats);
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({
      activeChallenges: 0,
      members: 0,
      partners: 0,
      jobs: 0
    });
  }
}