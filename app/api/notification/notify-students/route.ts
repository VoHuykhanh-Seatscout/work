// app/api/notification/notify-students/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // Validate session first
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' }, 
        { status: 401 }
      );
    }

    if (session.user.role !== 'BUSINESS') {
      return NextResponse.json(
        { error: 'Unauthorized - Business account required' }, 
        { status: 403 }
      );
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { competitionId, competitionTitle, organizerName } = body;

    // Validate required fields
    if (!competitionId || !competitionTitle) {
      return NextResponse.json(
        { error: 'Missing required fields: competitionId and competitionTitle are required' },
        { status: 400 }
      );
    }

    // Get all Student users
    let students;
    try {
      students = await prisma.user.findMany({
        where: {
          role: 'STUDENT',
        },
        select: {
          id: true
        }
      });
    } catch (prismaError) {
      console.error('Prisma error fetching students:', prismaError);
      return NextResponse.json(
        { error: 'Failed to retrieve student list' },
        { status: 500 }
      );
    }

    if (!students || students.length === 0) {
      return NextResponse.json(
        { message: 'No students to notify' },
        { status: 200 }
      );
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        // First create the notification using the transaction client
        const notification = await tx.notification.create({
  data: {
    type: 'NEW_COMPETITION',
    title: 'New Competition Available',
    message: `A new competition "${competitionTitle}" has been created by ${organizerName || 'an organizer'}`,
    link: `/competitions/${competitionId}`,
    metadata: {
      competitionId,
      competitionTitle,
      organizerName: organizerName || session.user?.name || 'Unknown Organizer'
    },
  },
  select: {
    id: true,
    type: true,
    title: true,
    message: true,
    link: true,
    metadata: true,
    createdAt: true,
    updatedAt: true
  }
});

        // Then create all recipient records using the transaction client
        const recipientRecords = students.map(student => ({
          notificationId: notification.id,
          userId: student.id,
          status: 'UNREAD'
        }));

        // Use the transaction client to create recipients
        await tx.notificationRecipient.createMany({
          data: recipientRecords,
          skipDuplicates: true
        });

        return {
          notification,
          count: students.length
        };
      });

      return NextResponse.json(
        { 
          success: true,
          notification: result.notification, 
          count: result.count 
        },
        { status: 201 }
      );

    } catch (createError: any) {
      console.error('Error creating notification:', createError);
      return NextResponse.json(
        { 
          error: 'Failed to create notifications', 
          details: createError.message,
          stack: process.env.NODE_ENV === 'development' ? createError.stack : undefined
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Unexpected error in notify-students:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}