import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

// Add proper type for registration
interface RegistrationWithUser {
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    profileImage: string | null;
  };
}

export async function GET(
  request: Request,
  { params }: any
) {
  try {
    const id = params.id;
    const session = await getServerSession(authOptions);

    const talkshow = await prisma.talkshow.findUnique({
      where: { id },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
        // Use the exact relation name from your schema
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
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!talkshow) {
      return NextResponse.json(
        { error: 'Talkshow not found' },
        { status: 404 }
      );
    }

    // Safe JSON parsing with proper typing
    const parseJsonField = <T>(field: any): T[] => {
      if (!field) return [];
      try {
        return typeof field === 'string' ? JSON.parse(field) : field;
      } catch (e) {
        console.error('Error parsing JSON field:', e);
        return [];
      }
    };

    const speakers = parseJsonField<Speaker>(talkshow.speakers);
    const agenda = parseJsonField<AgendaItem>(talkshow.agenda);
    const registrations = talkshow.registrations || [];
    
    const isRegistered = session?.user?.id 
      ? registrations.some((reg: RegistrationWithUser) => reg.userId === session.user.id)
      : false;

    const response = {
      ...talkshow,
      date: talkshow.date.toISOString(),
      registrationDeadline: talkshow.registrationDeadline.toISOString(),
      speakers,
      agenda,
      registrations: registrations.map((reg: RegistrationWithUser) => ({
        user: {
          id: reg.user.id,
          name: reg.user.name,
          email: reg.user.email,
          profileImage: reg.user.profileImage,
        },
      })),
      isRegistered,
      roundDescriptions: [],
      prize: "",
      rules: ""
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching talkshow:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: any
) {
  try {
    const id = params.id;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const talkshow = await prisma.talkshow.findUnique({
      where: { id },
    });

    if (!talkshow) {
      return NextResponse.json(
        { error: 'Talkshow not found' },
        { status: 404 }
      );
    }

    if (talkshow.registrationDeadline < new Date()) {
      return NextResponse.json(
        { error: 'Registration deadline has passed' },
        { status: 400 }
      );
    }

    const existingRegistration = await prisma.talkshowRegistration.findFirst({
      where: {
        talkshowId: id,
        userId: session.user.id,
      },
    });

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'Already registered for this talkshow' },
        { status: 400 }
      );
    }

    await prisma.talkshowRegistration.create({
      data: {
        talkshowId: id,
        userId: session.user.id,
        status: 'registered'
      },
    });

    const updatedTalkshow = await prisma.talkshow.findUnique({
      where: { id },
      include: {
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
        },
      },
    });

    if (!updatedTalkshow) {
      return NextResponse.json(
        { error: 'Talkshow not found' },
        { status: 404 }
      );
    }

    const response = {
      id: updatedTalkshow.id,
      title: updatedTalkshow.title,
      description: updatedTalkshow.description,
      date: updatedTalkshow.date.toISOString(),
      registrationDeadline: updatedTalkshow.registrationDeadline.toISOString(),
      registrations: updatedTalkshow.registrations.map((reg: RegistrationWithUser) => ({
        user: {
          id: reg.user.id,
          name: reg.user.name,
          email: reg.user.email,
          profileImage: reg.user.profileImage,
        },
      })),
      isRegistered: true,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error registering for talkshow:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Add these interfaces for better type safety
interface Speaker {
  id: string;
  name: string;
  title: string;
  photo?: string;
  bio?: string;
}

interface AgendaItem {
  time: string;
  title: string;
  description: string;
  speakerId?: string;
}