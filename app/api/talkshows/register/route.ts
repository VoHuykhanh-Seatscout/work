// api/talkshows/register/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    // 1. Authenticate the user
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be signed in to register for a talkshow' },
        { status: 401 }
      )
    }
    const userId = session.user.id

    // 2. Parse and validate the request body
    const body = await request.json()
    const { talkshowId } = body

    if (!talkshowId) {
      return NextResponse.json(
        { error: 'Talkshow ID is required' },
        { status: 400 }
      )
    }

    // 3. Check if the talkshow exists
    const talkshow = await prisma.talkshow.findUnique({
      where: { id: talkshowId },
      include: {
        registrations: {
          where: { userId },
          select: { id: true }
        },
        _count: {
          select: { registrations: true }
        }
      }
    })

    if (!talkshow) {
      return NextResponse.json(
        { error: 'Talkshow not found' },
        { status: 404 }
      )
    }

    // 4. Check registration deadline
    const now = new Date()
    if (new Date(talkshow.registrationDeadline) < now) {
      return NextResponse.json(
        { error: 'Registration for this talkshow has closed' },
        { status: 400 }
      )
    }

    // 5. Check if user is already registered
    if (talkshow.registrations.length > 0) {
      return NextResponse.json(
        { error: 'You are already registered for this talkshow' },
        { status: 400 }
      )
    }

    // 6. Check capacity (if applicable)
    if (talkshow.maxAttendees > 0 && talkshow._count.registrations >= talkshow.maxAttendees) {
      return NextResponse.json(
        { error: 'This talkshow has reached maximum capacity' },
        { status: 400 }
      )
    }

    // 7. Check ticketing type and payment if needed
    if (talkshow.ticketingType === 'paid' && talkshow.ticketPrice > 0) {
      return NextResponse.json(
        { error: 'Payment processing not implemented yet' },
        { status: 400 }
      )
    }

    // 8. Create the registration and update XP in a transaction
    const result = await prisma.$transaction([
      prisma.talkshowRegistration.create({
        data: {
          talkshowId,
          userId,
          status: 'registered'
        }
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          xp: {
            increment: 20 // Add 20 XP for talkshow registration
          }
        }
      })
    ]);

    // 9. Return success response with XP information
    return NextResponse.json({
      success: true,
      registration: {
        ...result[0],
        talkshow: {
          title: talkshow.title,
          date: talkshow.date,
          time: talkshow.time,
          locationType: talkshow.locationType,
          meetingLink: talkshow.meetingLink,
          venueAddress: talkshow.venueAddress,
          organizerName: talkshow.organizerName
        },
        user: {
          name: session.user.name,
          email: session.user.email
        }
      },
      xpAdded: 20,
      newXpTotal: result[1].xp,
      message: 'Successfully registered for the talkshow'
    })

  } catch (error) {
    console.error('Error registering for talkshow:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing your registration' },
      { status: 500 }
    )
  }
}