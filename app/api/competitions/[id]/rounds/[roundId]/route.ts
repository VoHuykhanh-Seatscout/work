import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import type { Round, Competition } from '@prisma/client'

// Helper function to safely parse JSON fields
const parseJsonField = (field: any) => {
  if (typeof field === 'string') {
    try {
      return JSON.parse(field)
    } catch {
      return null
    }
  }
  return field
}

// Define a custom type that includes competition
type RoundWithCompetition = Round & {
  competition: {
    organizerId: string
  }
}

export async function GET(
  req: Request,
  { params }: any
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: competitionId, roundId } = params;

    if (!competitionId || !roundId) {
      return NextResponse.json(
        { error: 'Missing competition ID or round ID' },
        { status: 400 }
      );
    }

    const round = await prisma.round.findUnique({
      where: {
        id: roundId,
        competitionId: competitionId,
      },
      include: {
        competition: {
          select: {
            organizerId: true
          }
        }
      }
    });

    if (!round) {
      return new NextResponse('Round not found', { status: 404 });
    }

    // Type assertion to our custom type
    const roundWithCompetition = round as RoundWithCompetition;

    if (roundWithCompetition.status === 'draft' && 
        roundWithCompetition.competition.organizerId !== session.user.id) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    // Get resources separately if needed
    const resources = await prisma.resource.findMany({
      where: {
        roundId: roundId
      }
    });

    const parsedRound = {
      ...roundWithCompetition,
      resources: resources || [],
      submissionRules: parseJsonField(roundWithCompetition.submissionRules) || {
        allowFileUpload: false,
        allowExternalLinks: false,
        acceptLateSubmissions: false,
        showCountdown: false,
        maxFileSizeMB: 10,
        allowedFileTypes: []
      },
      evaluation: parseJsonField(roundWithCompetition.evaluation) || {
        rubric: [],
        judges: [],
        weight: 100
      }
    };

    return NextResponse.json({ round: parsedRound });
  } catch (error) {
    console.error('[ROUND_GET_ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


export async function PUT(
  req: Request,
  { params }: any
) {
  try {
    const { id: competitionId, roundId } = params;
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    
    // Verify competition ownership
    const competition = await prisma.competition.findFirst({
      where: {
        id: competitionId,
        organizerId: session.user.id
      }
    });

    if (!competition) {
      return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
    }

    // Clean up resources - ensure they're in the correct format
    const cleanedResources = Array.isArray(body.resources) 
      ? body.resources.map((resource: any) => ({
          name: resource.name || 'Unnamed resource',
          url: resource.url || ''
        }))
      : [];

    // Prepare update data
    const updateData = {
      ...body,
      resources: {
        // Delete existing resources and create new ones
        deleteMany: {},
        create: cleanedResources
      },
      submissionRules: typeof body.submissionRules === 'object' 
        ? JSON.stringify(body.submissionRules)
        : body.submissionRules,
      evaluation: typeof body.evaluation === 'object'
        ? JSON.stringify(body.evaluation)
        : body.evaluation
    };

    // Remove any fields that shouldn't be updated directly
    delete updateData.competitionId;
    delete updateData.competition;
    delete updateData.id;

    // Update the round
    const updatedRound = await prisma.round.update({
      where: {
        id: roundId,
        competitionId: competitionId
      },
      data: updateData,
      include: {
        resources: true
      }
    });

    // Parse the updated round to match frontend expectations
    const parsedRound = {
      ...updatedRound,
      resources: updatedRound.resources || [],
      submissionRules: parseJsonField(updatedRound.submissionRules) || {
        allowFileUpload: false,
        allowExternalLinks: false,
        acceptLateSubmissions: false,
        showCountdown: false,
        maxFileSizeMB: 10,
        allowedFileTypes: []
      },
      evaluation: parseJsonField(updatedRound.evaluation) || {
        rubric: [],
        judges: [],
        weight: 100
      }
    };

    return NextResponse.json({ round: parsedRound });
    
  } catch (error) {
    console.error('Error updating round:', error);
    return NextResponse.json(
      { error: 'Failed to update round' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: any
) {
  try {
    const { id, roundId } = params

    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Validate parameters
    if (!id || !roundId) {
      return new NextResponse('Missing required parameters', { status: 400 })
    }

    const competition = await prisma.competition.findUnique({
      where: {
        id: id,
        organizerId: session.user.id,
      },
    })

    if (!competition) {
      return new NextResponse('Competition not found', { status: 404 })
    }

    await prisma.round.delete({
      where: {
        id: roundId,
        competitionId: id,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[COMPETITION_ROUND_DELETE]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}