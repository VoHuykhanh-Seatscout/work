import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { Competition, Prize, Round, Submission, User } from '@prisma/client';

type CompetitionWithRelations = Competition & {
  organizer: User;
  registrations: Array<{
    user: User;
    id: string;
    competitionId: string;
    userId: string;
    createdAt: Date;
  }>;
  rounds?: Array<
    Round & {
      resources?: Array<{
        id: string;
        name: string;
        url: string;
        type?: string;
        size?: number;
        publicId?: string;
        roundId: string;
        createdAt: Date;
        updatedAt: Date;
      }>;
      submissions?: Array<{
        id: string;
        status: string;
        submittedAt: Date;
        nextRoundId: string | null;
      }>;
    }
  >;
  submissions?: Array<
    Submission & {
      user: User;
      winningPrize: Prize | null;
    }
  >;
};

type PrizeWithRelations = Prize & {
  winner: {
    id: string;
    userId: string;
    user: User;
  } | null;
};

export async function GET(
  request: Request,
  { params }: any
) {
  // Add early check for prisma
  if (!prisma) {
    return NextResponse.json(
      { error: 'Database connection not available' },
      { status: 500 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const includeRounds = searchParams.get('includeRounds') === 'true';
    const includeWinners = searchParams.get('includeWinners') === 'true';
    
    const id = params.id;
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // First fetch the competition without prizes
    const competition = await prisma.competition.findUnique({
      where: { id },
      include: {
        rounds: includeRounds ? {
          include: {
            submissions: userId ? {
              where: { userId },
              select: {
                id: true,
                status: true,
                submittedAt: true,
                nextRoundId: true
              }
            } : false,
            resources: true
          },
          orderBy: { startDate: 'asc' }
        } : false,
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
        registrations: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        submissions: includeWinners ? {
          where: {
            winningPrizeId: {
              not: null
            }
          },
          include: {
            user: true,
            winningPrize: true
          }
        } : false
      },
    }) as CompetitionWithRelations | null;

    if (!competition) {
      return NextResponse.json(
        { error: 'Competition not found' },
        { status: 404 }
      );
    }

    // Then fetch prizes separately if requested
    let prizes: PrizeWithRelations[] = [];
    if (includeWinners) {
      prizes = await prisma.prize.findMany({
        where: { competitionId: id },
        include: {
          winner: {
            include: {
              user: true
            }
          }
        },
        orderBy: { position: 'asc' }
      });
    }

    const registrations = competition.registrations || [];
    const isRegistered = userId 
      ? registrations.some(reg => reg.userId === userId)
      : false;

    const response = {
      id: competition.id,
      title: competition.title,
      tagline: competition.tagline,
      description: competition.description,
      categories: competition.categories,
      startDate: competition.startDate,
      endDate: competition.endDate,
      prize: competition.prize,
      rules: competition.rules,
      judgingCriteria: competition.judgingCriteria,
      eligibility: competition.eligibility,
      contactEmail: competition.contactEmail,
      website: competition.website,
      teamSize: competition.teamSize,
      socialMediaLinks: competition.socialMediaLinks,
      hashtags: competition.hashtags,
      coverImage: competition.coverImage,
      logo: competition.logo,
      organizer: competition.organizer,
      participants: registrations.map(reg => ({
        user: reg.user
      })),
      isRegistered,
      rounds: includeRounds && competition.rounds 
        ? competition.rounds.map(round => ({
            id: round.id,
            name: round.name,
            description: round.description,
            startDate: round.startDate,
            endDate: round.endDate,
            status: round.status,
            deliverables: round.deliverables,
            judgingMethod: round.judgingMethod,
            submissionRules: round.submissionRules,
            resources: round.resources || [],
            userStatus: round.submissions && round.submissions.length 
              ? round.submissions[0].status 
              : undefined,
            advancedToNextRound: round.submissions && round.submissions.length 
              ? round.submissions[0].nextRoundId !== null 
              : undefined
          }))
        : undefined,
      prizes: includeWinners && prizes.length > 0
        ? prizes.map(prize => ({
            id: prize.id,
            name: prize.name,
            description: prize.description,
            value: prize.value,
            position: prize.position,
            winner: prize.winner ? {
              id: prize.winner.id,
              userId: prize.winner.userId,
              user: prize.winner.user
            } : null
          }))
        : undefined,
      winningSubmissions: includeWinners && competition.submissions
        ? competition.submissions.map(sub => ({
            id: sub.id,
            userId: sub.userId,
            user: sub.user,
            winningPrize: sub.winningPrize
          }))
        : undefined
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Detailed error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error
    });
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}