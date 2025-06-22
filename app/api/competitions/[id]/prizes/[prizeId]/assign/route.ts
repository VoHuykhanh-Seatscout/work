// api/competitions/[id]/prizes/[prizeId]/assign/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { id: string; prizeId: string } }
) {
  try {
    const { id: competitionId, prizeId } = params;
    const { submissionId } = await request.json();

    if (!prizeId || !submissionId) {
      return NextResponse.json(
        { error: 'Prize ID and Submission ID are required' },
        { status: 400 }
      );
    }

    // Verify the prize exists and is available
    const prize = await prisma.prize.findUnique({
      where: { id: prizeId }
    });

    if (!prize) {
      return NextResponse.json(
        { error: 'Prize not found' },
        { status: 404 }
      );
    }

    if (prize.winnerId) {
      return NextResponse.json(
        { error: 'This prize has already been awarded' },
        { status: 400 }
      );
    }

    // Verify the submission exists
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { user: true }
    });

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (prisma) => {
      // Update the prize with the winner
      const updatedPrize = await prisma.prize.update({
        where: { id: prizeId },
        data: {
          winnerId: submissionId
        }
      });

      // Update the submission with the winning prize
      await prisma.submission.update({
        where: { id: submissionId },
        data: {
          winningPrizeId: prizeId
        }
      });

      // Add points to the user
      await prisma.user.update({
        where: { id: submission.userId },
        data: {
          points: {
            increment: 50 // Adjust points as needed
          }
        }
      });

      // If this is the first prize, set as competition winner
      if (prize.position === 1) {
        await prisma.competition.update({
          where: { id: competitionId },
          data: {
            winnerId: submissionId
          }
        });
      }

      return updatedPrize;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error assigning prize:', error);
    return NextResponse.json(
      { error: 'Failed to assign prize' },
      { status: 500 }
    );
  }
}