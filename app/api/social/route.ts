import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

export async function GET(request: Request) {
    try {
      const session = await getServerSession(authOptions);
  
      if (!session?.user) {
        return NextResponse.json(
          { error: 'You must be signed in to view events' },
          { status: 401 }
        );
      }
  
      const { searchParams } = new URL(request.url);
      const upcomingOnly = searchParams.get('upcoming') === 'true';
      const organizerId = searchParams.get('organizerId');
  
      const whereClause: {
        startDate?: { gte: Date };
        organizerId?: string;
      } = { organizerId: session.user.id };
      
      if (upcomingOnly) {
        whereClause.startDate = { gte: new Date() };
      }
  
      if (organizerId) {
        whereClause.organizerId = organizerId;
      }
  
      const events = await prisma.event.findMany({
        where: whereClause,
        select: {
          id: true,
          title: true,
          tagline: true,
          organizerName: true,  // Using organizerName from Event model
          organizerId: true,    // If you need the ID
          startDate: true,
          startTime: true,
          endTime: true,
          eventMode: true,
          onlineLink: true,
          location: true,
          coverImage: true,
          eventType: true,
          status: true,
          createdAt: true,
          // Removed the organizer relation since it doesn't exist in your schema
        },
        orderBy: {
          startDate: 'asc'
        }
      });
  
      return NextResponse.json({ events });
    } catch (error: any) {
      console.error('Error fetching events:', error);
      return NextResponse.json(
        { error: error.message || 'Internal server error' },
        { status: 500 }
      );
    }
  }

export async function POST(request: Request) {
  try {
    // 1. Get the current session
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be signed in to create an event' },
        { status: 401 }
      );
    }

    // 2. Parse the form data
    const formData = await request.formData();

    // 3. Extract all fields from form data with type safety
    const eventName = formData.get('eventName') as string;
    const tagline = formData.get('tagline') as string;
    const organizerName = formData.get('organizerName') as string;
    const eventMode = formData.get('eventMode') as string;
    const location = formData.get('location') as string;
    const onlineLink = formData.get('onlineLink') as string;
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string | null;
    const startTime = formData.get('startTime') as string;
    const endTime = formData.get('endTime') as string | null;
    const eventType = formData.get('eventType') as string;
    const description = formData.get('description') as string;
    const coverImage = formData.get('coverImage') as File | null;
    const additionalMedia = formData.getAll('additionalMedia') as File[];
    const eventRulesEnabled = formData.get('eventRules.enabled') === 'true';
    const eventRulesText = formData.get('eventRules.text') as string;
    const maxCapacity = formData.get('maxCapacity') as string | null;
    const speakers = formData.get('speakers') 
      ? JSON.parse(formData.get('speakers') as string) as Array<{ name: string; title: string; bio: string; photo: string | null }>
      : [];
    const agenda = formData.get('agenda') 
      ? JSON.parse(formData.get('agenda') as string) as Array<{ time: string; title: string; description: string; speaker: string }>
      : [];
    const promotionalBanner = formData.get('promotionalBanner') as File | null;
    const socialMediaLinks = formData.get('socialMediaLinks') 
      ? JSON.parse(formData.get('socialMediaLinks') as string) as string[]
      : [];
    const eventPoster = formData.get('eventPoster') as File | null;
    const customRegistrationLink = formData.get('customRegistrationLink') as string | null;
    const emailNotifications = formData.get('emailNotifications') === 'true';
    const timezone = formData.get('timezone') as string;

    // 4. Validate required fields
    const requiredFields = {
      eventName,
      organizerName,
      startDate,
      startTime,
      eventType,
      description,
      eventMode,
      timezone
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // 5. Validate event mode specific fields
    if (eventMode === 'in-person' && !location) {
      return NextResponse.json(
        { error: 'Location is required for in-person events' },
        { status: 400 }
      );
    }

    if (eventMode === 'online' && !onlineLink) {
      return NextResponse.json(
        { error: 'Online link is required for online events' },
        { status: 400 }
      );
    }

    if (eventMode === 'hybrid' && (!onlineLink || !location)) {
      return NextResponse.json(
        { error: 'Both online link and location are required for hybrid events' },
        { status: 400 }
      );
    }

    // 6. Validate dates
    const eventStartDateTime = new Date(`${startDate}T${startTime}:00`);
    if (isNaN(eventStartDateTime.getTime())) {
      return NextResponse.json(
        { error: 'Invalid start date/time format. Please use format YYYY-MM-DD for date and HH:MM for time.' },
        { status: 400 }
      );
    }

    let eventEndDateTime: Date | null = null;
    if (endDate && endTime) {
      eventEndDateTime = new Date(`${endDate}T${endTime}:00`);
      if (isNaN(eventEndDateTime.getTime())) {
        return NextResponse.json(
          { error: 'Invalid end date/time format. Please use format YYYY-MM-DD for date and HH:MM for time.' },
          { status: 400 }
        );
      }

      if (eventEndDateTime <= eventStartDateTime) {
        return NextResponse.json(
          { error: 'End date/time must be after start date/time' },
          { status: 400 }
        );
      }
    }

    // 7. Handle file uploads to Cloudinary
    let coverImageUrl = '';
    if (coverImage) {
      coverImageUrl = await uploadToCloudinary(coverImage, 'event-covers');
    }

    let promotionalBannerUrl = '';
    if (promotionalBanner) {
      promotionalBannerUrl = await uploadToCloudinary(promotionalBanner, 'event-banners');
    }

    let eventPosterUrl = '';
    if (eventPoster) {
      eventPosterUrl = await uploadToCloudinary(eventPoster, 'event-posters');
    }

    // Handle additional media
    const additionalMediaUrls = await Promise.all(
      additionalMedia.map(file => uploadToCloudinary(file, 'event-media'))
    );

    // Handle speaker photos
    const updatedSpeakers = await Promise.all(
      speakers.map(async (speaker: any, index: number) => {
        const photoFile = formData.get(`speakerPhoto_${index}`) as File | null;
        let photoUrl = speaker.photo || null;
        
        if (photoFile) {
          photoUrl = await uploadToCloudinary(photoFile, 'event-speakers');
        }
        
        return {
          ...speaker,
          photo: photoUrl
        };
      })
    );

    // 8. Create the event in database
    const event = await prisma.event.create({
      data: {
        title: eventName,
        tagline,
        organizerName,
        organizerId: session.user.id,
        eventMode,
        location: eventMode !== 'online' ? location : null,
        onlineLink: eventMode !== 'in-person' ? onlineLink : null,
        startDate: eventStartDateTime,
        endDate: eventEndDateTime,
        startTime,
        endTime,
        eventType,
        description,
        coverImage: coverImageUrl,
        additionalMedia: additionalMediaUrls,
        eventRulesEnabled,
        eventRulesText,
        maxCapacity: maxCapacity ? parseInt(maxCapacity) : null,
        speakers: updatedSpeakers,
        agenda,
        promotionalBanner: promotionalBannerUrl,
        socialMediaLinks,
        eventPoster: eventPosterUrl,
        customRegistrationLink,
        emailNotifications,
        timezone,
        status: 'published'
      },
      select: {
        id: true,
        title: true,
        tagline: true,
        organizerName: true,
        startDate: true,
        startTime: true,
        eventMode: true,
        coverImage: true,
        createdAt: true
      }
    });

    // 9. Return the created event
    return NextResponse.json(event, { status: 201 });

  } catch (error: any) {
    console.error('Error creating event:', error);
    
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Foreign key constraint violated. Check if the organizer exists.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

async function uploadToCloudinary(file: File, folder: string): Promise<string> {
  try {
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert buffer to base64 string
    const base64String = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        base64String,
        {
          folder: folder,
          resource_type: 'auto'
        },
        (error: any, result: any) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
    }) as { secure_url: string };

    return result.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload file to Cloudinary');
  }
}