import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { SubmissionStatus } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { roundId, competitionId, notes, links, files } = await request.json();

    // Validate required fields
    if (!roundId || !competitionId) {
      return NextResponse.json(
        { error: 'Round ID and Competition ID are required' },
        { status: 400 }
      );
    }

    // Check if user is registered for the competition
    const registration = await prisma.registration.findFirst({
      where: {
        userId: session.user.id,
        competitionId,
      },
    });

    if (!registration) {
      return NextResponse.json(
        { error: 'You must be registered for this competition to submit' },
        { status: 403 }
      );
    }

    // Check if round belongs to competition
    const round = await prisma.round.findFirst({
      where: {
        id: roundId,
        competitionId,
      },
    });

    if (!round) {
      return NextResponse.json(
        { error: 'Round not found in this competition' },
        { status: 404 }
      );
    }

    // Check if submission already exists
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        userId: session.user.id,
        roundId,
      },
    });

    if (existingSubmission) {
      return NextResponse.json(
        { error: 'You already have a submission for this round' },
        { status: 400 }
      );
    }

    // Create submission
    const submission = await prisma.submission.create({
      data: {
        userId: session.user.id,
        roundId,
        competitionId,
        content: {
          notes,
          links: links || [],
          files: files || [],
        },
        status: SubmissionStatus.pending,
      },
      include: {
        round: true,
        competition: true,
      },
    });

    return NextResponse.json(submission);
  } catch (error) {
    console.error('Submission creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create submission' },
      { status: 500 }
    );
  }
}

// app/api/submissions/route.ts
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const roundId = searchParams.get('roundId');
    const competitionId = searchParams.get('competitionId');
    const userId = searchParams.get('userId');

    // At least competitionId must be provided
    if (!competitionId) {
      return NextResponse.json(
        { error: 'Competition ID is required' },
        { status: 400 }
      );
    }

    // Build the where clause
    const where: any = { competitionId };
    if (roundId) where.roundId = roundId;
    if (userId) where.userId = userId;

    const submissions = await prisma.submission.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true
          }
        },
        round: {
          select: {
            id: true,
            name: true
          }
        },
        competition: {
          select: {
            id: true,
            title: true
          }
        },
        nextRound: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    });

    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Submissions fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

