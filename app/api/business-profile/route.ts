// app/api/business-profile/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      name,
      email,
      phone,
      website,
      linkedin,
      location,
      industry,
      bio,
      logo
    } = body

    // Validate required fields
    if (!name || !email || !phone || !industry) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if profile already exists
    const existingProfile = await prisma.businessProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (existingProfile) {
      // Update existing profile
      const updatedProfile = await prisma.businessProfile.update({
        where: { userId: session.user.id },
        data: {
          name,
          email,
          phone,
          website: website || null,
          linkedin: linkedin || null,
          location: location || null,
          industry,
          bio: bio || null,
          logo: logo || null
        }
      })

      return NextResponse.json(updatedProfile)
    } else {
      // Create new profile
      const newProfile = await prisma.businessProfile.create({
        data: {
          userId: session.user.id,
          name,
          email,
          phone,
          website: website || null,
          linkedin: linkedin || null,
          location: location || null,
          industry,
          bio: bio || null,
          logo: logo || null
        }
      })

      return NextResponse.json(newProfile)
    }
  } catch (error) {
    console.error('[BUSINESS_PROFILE_ERROR]', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const profile = await prisma.businessProfile.findUnique({
      where: { userId: session.user.id }
    })

    return NextResponse.json(profile || null)
  } catch (error) {
    console.error('[GET_BUSINESS_PROFILE_ERROR]', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}