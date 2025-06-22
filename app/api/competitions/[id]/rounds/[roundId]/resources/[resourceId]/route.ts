import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { [key: string]: string | string[] } }
) {
  try {
    // Type guard to ensure params are strings
    if (
      typeof params.id !== 'string' ||
      typeof params.roundId !== 'string' ||
      typeof params.resourceId !== 'string'
    ) {
      return NextResponse.json(
        { error: 'Invalid parameters' },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: competitionId, roundId, resourceId } = params;

    const resource = await prisma.resource.findFirst({
      where: {
        id: resourceId,
        round: {
          id: roundId,
          competition: {
            id: competitionId,
            organizerId: session.user.id
          }
        }
      }
    });

    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found or access denied' },
        { status: 404 }
      );
    }

    await prisma.resource.delete({
      where: { id: resourceId }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete resource error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}