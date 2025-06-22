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

interface Speaker {
  name: string;
  title: string;
  bio: string;
  photo: string | null;
}

interface AgendaItem {
  time: string;
  title: string;
  description: string;
  speaker: string;
}

function toPrismaJson(data: unknown): Prisma.InputJsonValue {
  if (data === null || data === undefined) {
    return Prisma.DbNull as unknown as Prisma.InputJsonValue;
  }
  if (Array.isArray(data)) {
    return data.map(item => toPrismaJson(item)) as Prisma.InputJsonValue;
  }
  if (typeof data === 'object') {
    const result: Record<string, Prisma.InputJsonValue> = {};
    for (const key in data) {
      result[key] = toPrismaJson((data as any)[key]);
    }
    return result as Prisma.InputJsonValue;
  }
  return data as Prisma.InputJsonValue;
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

async function notifyTalkshowPublished(talkshow: {
  id: string;
  title: string;
  organizerName: string;
}) {
  try {
    const notification = await prisma.notification.create({
      data: {
        type: "talkshow_published",
        title: "New Talkshow Available!",
        message: `${talkshow.title} by ${talkshow.organizerName} is now open`,
        link: `/talkshows/${talkshow.id}`,
        metadata: { talkshowId: talkshow.id }
      }
    });

    const users = await prisma.user.findMany({
      select: { id: true }
    });

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

    // Parse JSON body
    const data = await request.json();
    const {
      title,
      organizerName,
      date,
      time,
      registrationDeadline,
      duration,
      locationType,
      meetingLink,
      venueAddress,
      description,
      audienceType,
      enableQandA,
      enablePolls,
      allowReactions,
      registrationType,
      ticketingType,
      ticketPrice,
      maxAttendees,
      confirmationEmailTemplate,
      visibility,
      sendReminders,
      thumbnail,
      organizerLogo,
      paymentQrCode,
      speakers = [],
      agenda = [],
      tags = [],
      isPublished = false
    } = data;

    // Validate required fields
    if (!title || !organizerName || !date || !time || !duration || !locationType || 
        !description || !audienceType || !registrationType || !ticketingType || !registrationDeadline) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate dates
    const eventDateTime = new Date(`${date}T${time}:00`);
    if (isNaN(eventDateTime.getTime())) {
      return NextResponse.json(
        { error: 'Invalid event date/time format' },
        { status: 400 }
      );
    }

    let registrationDeadlineDate: Date;
    if (/^\d{4}-\d{2}-\d{2}$/.test(registrationDeadline)) {
      registrationDeadlineDate = new Date(`${registrationDeadline}T23:59:59`);
    } else {
      registrationDeadlineDate = new Date(registrationDeadline);
    }

    if (isNaN(registrationDeadlineDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid registration deadline format' },
        { status: 400 }
      );
    }

    // Create talkshow
    const newTalkshow = await prisma.talkshow.create({
      data: {
        title,
        organizerName,
        organizerLogo,
        date: eventDateTime,
        time,
        duration,
        locationType,
        meetingLink: locationType !== 'offline' ? meetingLink : null,
        venueAddress: locationType !== 'online' ? venueAddress : null,
        description,
        audienceType,
        enableQandA,
        enablePolls,
        allowReactions,
        registrationType,
        ticketingType,
        ticketPrice: ticketingType === 'paid' ? parseFloat(ticketPrice) : 0,
        maxAttendees: parseInt(maxAttendees),
        registrationDeadline: registrationDeadlineDate,
        confirmationEmailTemplate,
        visibility,
        sendReminders,
        thumbnail,
        speakers: toPrismaJson(speakers),
        agenda: toPrismaJson(agenda),
        tags,
        organizer: { connect: { id: session.user.id } },
      }
    });

    if (isPublished) {
      await notifyTalkshowPublished({
        id: newTalkshow.id,
        title: newTalkshow.title,
        organizerName: organizerName
      });
    }

    return NextResponse.json(newTalkshow, { status: 201 });
  } catch (error) {
    console.error('Error creating talkshow:', error);
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
    const talkshowId = formData.get('id') as string;
    const isPublished = formData.get('isPublished') === 'true';

    // Verify talkshow exists
    const existing = await prisma.talkshow.findUnique({
      where: { id: talkshowId },
      select: { organizerId: true, title: true }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    if (existing.organizerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Handle file updates if provided
    const thumbnail = formData.get('thumbnail') as unknown as File;
    const organizerLogo = formData.get('organizerLogo') as unknown as File;

    let thumbnailUrl: string | undefined;
    let organizerLogoUrl: string | undefined;

    if (thumbnail) {
      thumbnailUrl = await handleFileUpload(thumbnail, 'talkshow-thumbnails');
    }

    if (organizerLogo) {
      organizerLogoUrl = await handleFileUpload(organizerLogo, 'talkshow-logos');
    }

    // Update talkshow
    const updated = await prisma.talkshow.update({
      where: { id: talkshowId },
      data: { 
        ...(thumbnailUrl && { thumbnail: thumbnailUrl }),
        ...(organizerLogoUrl && { organizerLogo: organizerLogoUrl })
      }
    });

    if (isPublished) {
      await notifyTalkshowPublished({
        id: updated.id,
        title: updated.title,
        organizerName: updated.organizerName
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating talkshow:', error);
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
        { error: 'You must be signed in to view talkshows' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const organizerId = searchParams.get('organizerId');
    const upcomingOnly = searchParams.get('upcoming') === 'true';
    const currentDate = new Date();

    let where: any = {};
    
    if (upcomingOnly) {
      where.date = { gte: currentDate };
    }

    if (organizerId && organizerId === session.user.id) {
      where.organizerId = session.user.id;
    }

    const talkshows = await prisma.talkshow.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        organizerName: true,
        date: true,
        time: true,
        duration: true,
        locationType: true,
        thumbnail: true,
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
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    return NextResponse.json({ talkshows });
  } catch (error) {
    console.error('Error fetching talkshows:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}