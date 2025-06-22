import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Get all notifications for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const notifications = await prisma.notificationRecipient.findMany({
      where: {
        userId: session.user.id,
        status: { not: 'ARCHIVED' } // Exclude archived notifications
      },
      include: {
        notification: true
      },
      orderBy: {
        notification: {
          createdAt: 'desc'
        }
      }
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Create a new notification
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { type, title, message, link, metadata, userIds } = body;

    // Validate required fields
    if (!type || !title || !message) {
      return NextResponse.json({ 
        error: "Missing required fields",
        required: ["type", "title", "message"],
      }, { status: 400 });
    }

    // Default to sending to the current user if no userIds are provided
    const recipients = userIds && userIds.length > 0 
      ? userIds 
      : [session.user.id];

    const notification = await prisma.notification.create({
      data: {
        type,
        title,
        message,
        link: link || null,
        metadata: metadata || null,
        recipients: {
          create: recipients.map((userId: any) => ({
            user: { connect: { id: userId } }
          }))
        }
      },
      include: {
        recipients: true
      }
    });

    return NextResponse.json({ notification }, { status: 201 });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json({ 
      error: "Failed to create notification",
    }, { status: 500 });
  }
}

// Update the PATCH endpoint in api/notification/route.ts
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { notificationIds } = await req.json();

    await prisma.notificationRecipient.updateMany({
      where: {
        userId: session.user.id,
        id: { in: notificationIds }
      },
      data: {
        status: "READ",
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return NextResponse.json({ 
      error: "Failed to mark notifications as read",
    }, { status: 500 });
  }
}