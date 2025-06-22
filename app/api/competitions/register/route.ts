// app/api/competitions/register/route.ts
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be signed in to register' },
        { status: 401 }
      );
    }

    const { competitionId } = await request.json();

    // Check if competition exists
    const competition = await prisma.competition.findUnique({
      where: { id: competitionId },
    });

    if (!competition) {
      return NextResponse.json(
        { error: 'Competition not found' },
        { status: 404 }
      );
    }

    // Check if registration already exists
    const existingRegistration = await prisma.registration.findFirst({
      where: {
        competitionId,
        userId: session.user.id,
      },
    });

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'You are already registered for this competition' },
        { status: 400 }
      );
    }

    // Create new registration and update user xp in a transaction
    const result = await prisma.$transaction([
      prisma.registration.create({
        data: {
          competitionId,
          userId: session.user.id,
        },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          xp: {
            increment: 30, // Add 30 XP
          },
        },
      }),
    ]);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Registration successful',
        xpAdded: 30,
        newXpTotal: result[1].xp,
        points: result[1].points // Return points in case frontend needs it
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}