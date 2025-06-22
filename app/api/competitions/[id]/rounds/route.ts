import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'

export async function GET(
  request: Request,
  { params }: any
) {
  try {
    // First verify the competition exists
    const competitionExists = await prisma.competition.findUnique({
      where: { id: params.id },
      select: { id: true }
    })

    if (!competitionExists) {
      return NextResponse.json({ error: 'Competition not found' }, { status: 404 })
    }

    // Fetch rounds from the Round table
    const rounds = await prisma.round.findMany({
      where: {
        competitionId: params.id
      },
      orderBy: {
        startDate: 'asc'
      }
    })

    return NextResponse.json({ rounds })
  } catch (error) {
    console.error('Error fetching rounds:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rounds' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: any
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const roundData = await request.json()

    // Validate the competition exists and belongs to the user
    const competition = await prisma.competition.findUnique({
      where: {
        id: params.id,
        organizerId: session.user.id
      }
    })

    if (!competition) {
      return NextResponse.json({ error: 'Competition not found or unauthorized' }, { status: 404 })
    }

    // Create a new round in the Round table
    const newRound = await prisma.round.create({
      data: {
        ...roundData,
        competitionId: params.id,
        // Ensure dates are properly formatted
        startDate: new Date(roundData.startDate),
        endDate: new Date(roundData.endDate),
        // Handle resources JSON
        resources: roundData.resources ? JSON.stringify(roundData.resources) : null
      }
    })

    return NextResponse.json({ round: newRound }, { status: 201 })
  } catch (error) {
    console.error('Error creating round:', error)
    return NextResponse.json(
      { error: 'Failed to create round' },
      { status: 500 }
    )
  }
}