import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { roundId: string } }
) {
  try {
    // Create a proper request object for getServerSession
    const req = {
      headers: Object.fromEntries(request.headers.entries()),
      cookies: Object.fromEntries(
        request.headers.get('cookie')?.split(';').map(c => {
          const [key, ...rest] = c.trim().split('=');
          return [key, rest.join('=')];
        }) || []
      ),
    };

    const session = await getServerSession({ req, ...authOptions });
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const round = await prisma.round.findUnique({
  where: { id: params.roundId },
  include: {
    competition: {
      select: {
        id: true,
        title: true,
        registrations: {
          where: { userId: session.user.id },
          select: { id: true }
        }
      }
    },
    submissions: {
      where: { userId: session.user.id },
      orderBy: { submittedAt: 'desc' },
      take: 1
    },
    resources: true // Add this line to include resources
  }
});

    if (!round) {
      return new NextResponse(
        JSON.stringify({ error: 'Round not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const responseData = {
      id: round.id,
      name: round.name,
      description: round.description,
      startDate: round.startDate.toISOString(),
      endDate: round.endDate.toISOString(),
      status: round.status,
      deliverables: round.deliverables,
      judgingMethod: round.judgingMethod,
      criteria: round.criteria,
      submissionRules: round.submissionRules ? 
        (typeof round.submissionRules === 'string' ? JSON.parse(round.submissionRules) : round.submissionRules) 
        : {},
      resources: round.resources ? 
        (typeof round.resources === 'string' ? JSON.parse(round.resources) : round.resources) 
        : [],
      competition: {
        id: round.competition.id,
        title: round.competition.title,
        isRegistered: round.competition.registrations.length > 0
      },
      submissions: round.submissions.map(sub => ({
        id: sub.id,
        submittedAt: sub.submittedAt.toISOString(),
        status: sub.status,
        feedback: sub.feedback
      }))
    };
    

    return new NextResponse(JSON.stringify(responseData), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } catch (error) {
    console.error('Error fetching round details:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}