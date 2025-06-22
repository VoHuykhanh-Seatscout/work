// app/api/competitions/[id]/prizes/[prizeId]/assign/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(
  request: NextRequest
): Promise<NextResponse> {
  try {
    // Extract params from the URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const competitionId = pathParts[4]; // [id] position
    const prizeId = pathParts[6]; // [prizeId] position

    const { submissionId } = await request.json();

    // Validation
    if (!prizeId || !submissionId) {
      return NextResponse.json(
        { error: 'Prize ID and Submission ID are required' },
        { status: 400 }
      );
    }

    // Transaction for atomic operations
    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify and lock the prize
      const prize = await tx.prize.findUnique({
        where: { id: prizeId },
        select: { winnerId: true, position: true }
      });

      if (!prize) throw new Error('Prize not found');
      if (prize.winnerId) throw new Error('Prize already awarded');

      // 2. Verify submission
      const submission = await tx.submission.findUnique({
        where: { id: submissionId },
        select: { userId: true }
      });
      if (!submission) throw new Error('Submission not found');

      // 3. Update prize
      const updatedPrize = await tx.prize.update({
        where: { id: prizeId },
        data: { winnerId: submissionId },
        select: { id: true, winnerId: true }
      });

      // 4. Update submission
      await tx.submission.update({
        where: { id: submissionId },
        data: { winningPrizeId: prizeId }
      });

      // 5. Award points
      await tx.user.update({
        where: { id: submission.userId },
        data: { points: { increment: 50 } }
      });

      // 6. If first prize, set competition winner
      if (prize.position === 1) {
        await tx.competition.update({
          where: { id: competitionId },
          data: { winnerId: submissionId }
        });
      }

      return updatedPrize;
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Prize assignment error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to assign prize';
    const statusCode = error instanceof Error && error.message === 'Prize not found' ? 404 : 500;
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}