import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  context: {
    params: {
      id: string;
      roundId: string;
      resourceId: string;
    }
  }
) {
  try {
    const { params } = context;
    
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: competitionId, roundId, resourceId } = params;

    // Verify the resource belongs to this competition and round
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

    // Delete the resource
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