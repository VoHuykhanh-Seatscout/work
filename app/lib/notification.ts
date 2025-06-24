// lib/notification.ts
import prisma from "@/lib/prisma";

// Updated notifyCompetitionPublished function
export async function notifyCompetitionPublished(competition: {
  id: string;
  title: string;
  organizerName: string;
}) {
  try {
    // First create the notification
    const notification = await prisma.notification.create({
      data: {
        type: "competition_published",
        title: "New Competition Published!",
        message: `${competition.title} by ${competition.organizerName} is now available`,
        link: `/competitions/${competition.id}`,
        metadata: { competitionId: competition.id }
      }
    });

    // If you want to send this to all users, you would need to:
    // 1. Get all user IDs (be careful with large user bases)
    // 2. Create NotificationRecipient records for each user
    // Here's a simplified version:
    
    // Example for a few users (in production you'd paginate this)
    const users = await prisma.user.findMany({
      select: { id: true },
      take: 1000 // Limit for demo purposes
    });

    await prisma.notificationRecipient.createMany({
      data: users.map(user => ({
        notificationId: notification.id,
        userId: user.id,
        status: "UNREAD"
      }))
    });

  } catch (error) {
    console.error("Failed to create competition published notification:", error);
  }
}

// Updated markNotificationsAsRead function
export async function markNotificationsAsRead(notificationIds: string[], userId: string) {
  try {
    await prisma.notificationRecipient.updateMany({
      where: {
        notificationId: {
          in: notificationIds
        },
        userId: userId
      },
      data: {
        status: "READ" // Update the status field in NotificationRecipient
      }
    });
  } catch (error) {
    console.error("Failed to mark notifications as read:", error);
    throw error;
  }
}