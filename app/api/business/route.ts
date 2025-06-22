import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const businessProfile = await prisma.businessProfile.findUnique({
      where: { userId: session.user.id }
    })
    return NextResponse.json(businessProfile || {})
  } catch (error) {
    console.error('Error fetching business profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch business profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await request.json()
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, phone: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const businessData = {
        name: data.name || 'My Business',
        industry: data.industry || 'Other',
        email: data.email || user.email || '',
        phone: data.phone || user.phone || '',
        logo: data.logo || null, // Explicitly include logo
        location: data.location || null,
        website: data.website || null,
        linkedin: data.linkedin || null,
        bio: data.bio || null
      }

    // Remove companyName if it exists in the data
    if ('companyName' in businessData) {
      delete businessData.companyName
    }

    const updatedBusinessProfile = await prisma.businessProfile.upsert({
      where: { userId: session.user.id },
      update: businessData,
      create: {
        userId: session.user.id,
        ...businessData
      }
    })

    return NextResponse.json(updatedBusinessProfile)
  } catch (error) {
    console.error('Error updating business profile:', error)
    return NextResponse.json(
      { error: 'Failed to update business profile' },
      { status: 500 }
    )
  }
}