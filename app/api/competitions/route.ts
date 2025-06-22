import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';
import { Prisma } from '@prisma/client';

// Configure Cloudinary
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

interface Round {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  deliverables: string;
  judgingMethod?: string;
  criteria?: string[];
  submissionRules?: Prisma.InputJsonValue;
}

interface Prize {
  title: string;
  description: string;
  value: string;
  type: string;
}

function toPrismaJson(data: unknown): Prisma.InputJsonValue {
  return data === null || data === undefined 
    ? Prisma.DbNull as unknown as Prisma.InputJsonValue 
    : data as Prisma.InputJsonValue;
}

async function handleFileUpload(file: File | null, folder: string): Promise<string> {
  if (!file) return '';
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder, resource_type: 'auto' },
        (error, result) => error ? reject(error) : resolve(result)
      ).end(buffer);
    });
    return (result as any).secure_url;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
}

async function notifyCompetitionPublished(competition: {
  id: string;
  title: string;
  organizerName: string;
}) {
  try {
    // First create the notification
    const notification = await prisma.notification.create({
      data: {
        type: "competition_published",
        title: "New Competition Available!",
        message: `${competition.title} by ${competition.organizerName} is now open`,
        link: `/competitions/${competition.id}`,
        metadata: { competitionId: competition.id }
      }
    });

    // Get all users who should receive this notification
    // (You might want to add filters here, like only active users, etc.)
    const users = await prisma.user.findMany({
      select: { id: true },
      where: {
        // Any filters you want to apply
      }
    });

    // Create recipient records in batches to avoid overloading the database
    const batchSize = 100;
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      await prisma.notificationRecipient.createMany({
        data: batch.map(user => ({
          notificationId: notification.id,
          userId: user.id,
          status: "UNREAD"
        })),
        skipDuplicates: true
      });
    }

    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const isPublished = formData.get('isPublished') === 'true';

    // Extract all fields
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const organizerName = formData.get('organizerName') as string || 'Organizer';
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;
    const coverImageUrl = formData.get('coverImage') as string;
    const logoUrl = formData.get('logo') as string;
    const roundsJson = formData.get('rounds') as string;
    const rounds = roundsJson ? JSON.parse(roundsJson) as Round[] : [];
    const numberOfRounds = rounds.length;

    // Validate required fields
    if (!title || !description || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create competition in transaction
    const competition = await prisma.$transaction(async (prisma) => {
      // First create the competition
      const newCompetition = await prisma.competition.create({
        data: {
          title,
          description,
          organizerName,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          coverImage: coverImageUrl,
          logo: logoUrl,
          organizer: { connect: { id: session.user.id } },
          publishedAt: isPublished ? new Date() : null,
          contactEmail: formData.get('contactEmail') as string || '',
          prize: formData.get('prize') as string || '',
          rules: formData.get('rules') as string || '',
          numberOfRounds,
          categories: JSON.parse(formData.get('categories') as string || '[]'),
          eligibility: formData.get('eligibility') as string || '',
          judgingCriteria: formData.get('judgingCriteria') as string || '',
          teamSize: Number(formData.get('teamSize')) || undefined,
          website: formData.get('website') as string || '',
          audienceLevel: formData.get('audienceLevel') as string || '',
          participationType: formData.get('participationType') as string || '',
          teamFormation: formData.get('teamFormation') as string || '',
          visibility: formData.get('visibility') as string || 'public'
        }
      });

      // Then create the rounds
      if (rounds.length > 0) {
        await prisma.round.createMany({
          data: rounds.map((round, index) => ({
            competitionId: newCompetition.id,
            name: round.name,
            description: round.description,
            startDate: new Date(round.startDate),
            endDate: new Date(round.endDate),
            deliverables: round.deliverables,
            judgingMethod: round.judgingMethod,
            criteria: round.criteria ? toPrismaJson(round.criteria) : undefined,
            submissionRules: round.submissionRules ? toPrismaJson(round.submissionRules) : undefined,
            status: 'draft'
          }))
        });
      }

      // Then create prizes if any
      const prizesJson = formData.get('prizes') as string;
      if (prizesJson) {
        const prizes = JSON.parse(prizesJson) as Prize[];
        if (prizes.length > 0) {
          await prisma.prize.createMany({
            data: prizes.map((prize, index) => ({
              competitionId: newCompetition.id,
              name: prize.title,
              description: prize.description,
              value: prize.value,
              position: index + 1
            }))
          });
        }
      }

      if (isPublished) {
        await notifyCompetitionPublished({
          id: newCompetition.id,
          title: newCompetition.title,
          organizerName: organizerName
        });
      }

      return newCompetition;
    });

    // Fetch the full competition with relations for response
    const fullCompetition = await prisma.competition.findUnique({
      where: { id: competition.id },
      include: {
        rounds: true,
        prizes: true,
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true
          }
        }
      }
    });

    return NextResponse.json(fullCompetition);
  } catch (error) {
    console.error('Error creating competition:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Operation failed' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const competitionId = formData.get('id') as string;
    const isPublished = formData.get('isPublished') === 'true';

    // Verify competition exists
    const existing = await prisma.competition.findUnique({
      where: { id: competitionId },
      select: { organizerId: true, publishedAt: true, title: true }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    if (existing.organizerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update competition
    const updated = await prisma.competition.update({
      where: { id: competitionId },
      data: { publishedAt: isPublished ? new Date() : undefined },
      include: { organizer: { select: { name: true } } }
    });

    // Send notification if publishing for first time
    if (isPublished && !existing.publishedAt) {
      await notifyCompetitionPublished({
        id: updated.id,
        title: updated.title,
        organizerName: updated.organizer?.name || 'Organizer'
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating competition:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Update failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be signed in to view competitions' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const organizerId = searchParams.get('organizerId');
    const currentDate = new Date();

    // Base where clause - show active competitions (endDate >= current date)
    let where: any = {
      endDate: {
        gte: currentDate
      }
    };

    // If organizerId is provided and matches current user, show their competitions (including past ones)
    if (organizerId && organizerId === session.user.id) {
      where = {
        organizerId: session.user.id
      };
    }

    const competitions = await prisma.competition.findMany({
      where,
      include: {
        _count: {
          select: {
            registrations: true
          }
        },
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true
          }
        },
        rounds: {
          select: {
            id: true,
            name: true,
            description: true,
            startDate: true,
            endDate: true,
            status: true,
            deliverables: true,
            judgingMethod: true,
            criteria: true,
            submissionRules: true
          },
          orderBy: {
            startDate: 'asc'
          }
        },
        prizes: {
          select: {
            id: true,
            name: true,
            description: true,
            value: true,
            position: true 
          },
          orderBy: {
            position: 'asc'
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    });

    return NextResponse.json({ competitions });
  } catch (error) {
    console.error('Error fetching competitions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}